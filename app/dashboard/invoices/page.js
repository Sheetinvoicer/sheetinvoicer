'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    const { data } = await supabase
      .from('invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading invoices...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage all your invoices</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + Create Invoice
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Invoice #</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Client</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300 font-semibold">Due Date</th>
                <th className="px-6 py-4 text-right text-gray-600 dark:text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
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
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      View →
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
