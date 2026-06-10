'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const statusFilter = searchParams.get('status');
    setFilter(statusFilter);
    loadInvoices(statusFilter);
  }, [searchParams]);

  async function loadInvoices(statusFilter) {
    let query = supabase
      .from('invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    
    if (statusFilter === 'paid') {
      query = query.eq('status', 'paid');
    } else if (statusFilter === 'pending') {
      // Show ALL non-paid invoices (draft, sent, overdue)
      query = query.neq('status', 'paid');
    } else if (statusFilter === 'overdue') {
      query = query.eq('status', 'sent').lt('due_date', new Date().toISOString().split('T')[0]);
    }
    
    const { data } = await query;
    setInvoices(data || []);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'sent': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    }
  };

  // Calculate counts
  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status !== 'paid').length;

  const filterButtons = [
    { label: 'All', value: null, count: totalInvoices },
    { label: 'Paid', value: 'paid', count: paidCount },
    { label: 'Pending', value: 'pending', count: pendingCount },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading invoices...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {filter === 'paid' ? 'Showing paid invoices' : filter === 'pending' ? 'Showing pending invoices (unpaid)' : 'All invoices'}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + Create Invoice
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => router.push(`/dashboard/invoices${btn.value ? `?status=${btn.value}` : ''}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              (filter === btn.value) || (filter === null && btn.value === null)
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Invoice #</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Client</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Due Date</th>
                <th className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{inv.clients?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {inv.currency || 'USD'} {inv.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
