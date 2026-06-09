'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function RecurringPage() {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRecurring();
  }, []);

  async function loadRecurring() {
    const { data } = await supabase
      .from('recurring_invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    setRecurring(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading recurring invoices...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Recurring Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Automate your recurring billing</p>
        </div>
        <Link
          href="/dashboard/recurring/new"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + Create Recurring
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurring.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">🔄</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${rec.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {rec.status || 'active'}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{rec.clients?.name || 'N/A'}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${rec.amount?.toFixed(2)}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Every {rec.frequency}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Next: {new Date(rec.next_send_date).toLocaleDateString()}</p>
            <Link href={`/dashboard/recurring/${rec.id}`} className="mt-4 inline-block text-teal-600 dark:text-teal-400 hover:underline">
              Manage →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
