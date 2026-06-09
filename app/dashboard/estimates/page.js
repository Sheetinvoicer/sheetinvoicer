'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadEstimates();
  }, []);

  async function loadEstimates() {
    const { data } = await supabase
      .from('estimates')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    setEstimates(data || []);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'converted': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'sent': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading estimates...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Estimates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create and manage estimates</p>
        </div>
        <Link
          href="/dashboard/estimates/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + New Estimate
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Estimate #</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Client</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est, idx) => (
                <motion.tr
                  key={est.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{est.estimate_number}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{est.clients?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {est.currency || 'USD'} {est.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(est.status)}`}>
                      {est.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/estimates/${est.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
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
