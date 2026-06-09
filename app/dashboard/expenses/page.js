'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const deductibleExpenses = expenses.filter(e => e.is_deductible).reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading expenses...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Track your business expenses</p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + Add Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Total Expenses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${deductibleExpenses.toLocaleString()}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Tax Deductible</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Category</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Description</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-gray-600 dark:text-gray-300">Tax Deductible</th>
                <th className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, idx) => (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{exp.category}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">${exp.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{exp.description || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {exp.is_deductible ? '✅ Yes' : '❌ No'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/expenses/${exp.id}`} className="text-orange-600 dark:text-orange-400 hover:underline">
                      Edit →
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
