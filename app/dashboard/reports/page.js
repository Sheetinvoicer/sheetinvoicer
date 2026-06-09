'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const { data: invoices } = await supabase.from('invoices').select('*');
    const { data: expenses } = await supabase.from('expenses').select('*');
    
    const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    setSummary({ revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses });
    
    // Monthly data for last 6 months
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthInvoices = invoices?.filter(inv => {
        const d = new Date(inv.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && inv.status === 'paid';
      }) || [];
      const monthExpenses = expenses?.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }) || [];
      
      monthly.push({
        name: format(date, 'MMM yyyy'),
        revenue: monthInvoices.reduce((sum, i) => sum + (i.total || 0), 0),
        expenses: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      });
    }
    setMonthlyData(monthly);
    
    // Category data for expenses
    const categoryTotals = {};
    expenses?.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const colors = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
    setCategoryData(Object.entries(categoryTotals).map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] })));
    
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-center">Loading reports...</div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Reports</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">View your business performance</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${summary.revenue.toLocaleString()}</div>
          <div className="text-gray-500">Total Revenue</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${summary.expenses.toLocaleString()}</div>
          <div className="text-gray-500">Total Expenses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold text-green-600">${summary.profit.toLocaleString()}</div>
          <div className="text-gray-500">Net Profit</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-bold mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {categoryData.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
