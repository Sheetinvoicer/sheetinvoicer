'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
    pendingAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalClients: 0,
    totalExpenses: 0,
    growth: 0
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [selectedPeriod]);

  const navigateTo = (path, filter = null) => {
    if (filter) {
      router.push(path + '?status=' + filter);
    } else {
      router.push(path);
    }
  };

  async function loadAllData() {
    setLoading(true);
    
    const [invoicesRes, clientsRes, expensesRes] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id'),
      supabase.from('expenses').select('amount')
    ]);
    
    const invoices = invoicesRes.data || [];
    const clients = clientsRes.data || [];
    const expenses = expensesRes.data || [];
    
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const overdueInvoices = invoices.filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date());
    const pendingInvoices = invoices.filter(i => i.status !== 'paid' && (!i.due_date || new Date(i.due_date) >= new Date()));
    
    const totalRevenue = paidInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const pendingAmount = pendingInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const thisMonthInvoices = invoices.filter(i => new Date(i.created_at).getMonth() === currentMonth);
    const lastMonthInvoices = invoices.filter(i => new Date(i.created_at).getMonth() === currentMonth - 1);
    const thisMonthRevenue = thisMonthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const lastMonthRevenue = lastMonthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const growth = lastMonthRevenue === 0 ? 100 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
    
    setStats({
      totalRevenue,
      netProfit: totalRevenue - totalExpenses,
      pendingAmount,
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalClients: clients.length,
      totalExpenses,
      growth
    });
    
    setRecentInvoices(invoices.slice(0, 5));
    
    let chartData = [];
    if (selectedPeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayInvoices = invoices.filter(inv => 
          format(new Date(inv.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        chartData.push({
          name: format(date, 'EEE'),
          revenue: dayInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
        });
      }
    } else if (selectedPeriod === 'month') {
      for (let i = 29; i >= 0; i -= 3) {
        const date = subDays(new Date(), i);
        const dayInvoices = invoices.filter(inv => 
          format(new Date(inv.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        chartData.push({
          name: format(date, 'MMM dd'),
          revenue: dayInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthInvoices = invoices.filter(inv => 
          new Date(inv.created_at) >= startOfMonth(date) && 
          new Date(inv.created_at) <= endOfMonth(date)
        );
        chartData.push({
          name: format(date, 'MMM'),
          revenue: monthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
        });
      }
    }
    setRevenueData(chartData);
    
    setStatusData([
      { name: 'Paid', value: paidInvoices.length, color: '#10b981', link: '/dashboard/invoices?status=paid' },
      { name: 'Pending', value: pendingInvoices.length, color: '#f59e0b', link: '/dashboard/invoices?status=pending' },
      { name: 'Overdue', value: overdueInvoices.length, color: '#ef4444', link: '/dashboard/invoices?status=overdue' }
    ]);
    
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['week', 'month', 'year'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${selectedPeriod === period ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 border'}`}
          >
            {period}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div onClick={() => navigateTo('/dashboard/invoices', 'paid')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Revenue</p><p className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p></div><div className="text-2xl">💰</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/reports')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Net Profit</p><p className="text-xl font-bold text-green-600 dark:text-green-400">${stats.netProfit.toLocaleString()}</p></div><div className="text-2xl">📈</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/invoices', 'pending')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Pending</p><p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">${stats.pendingAmount.toLocaleString()}</p></div><div className="text-2xl">⏳</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/invoices')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Invoices</p><p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</p></div><div className="text-2xl">📄</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/invoices', 'paid')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Paid</p><p className="text-xl font-bold text-green-600">{stats.paidInvoices}</p></div><div className="text-2xl">✅</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/clients')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Clients</p><p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p></div><div className="text-2xl">👥</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/invoices', 'overdue')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Overdue</p><p className="text-xl font-bold text-red-600">{stats.overdueInvoices}</p></div><div className="text-2xl">⚠️</div></div>
        </div>
        <div onClick={() => navigateTo('/dashboard/expenses')} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
          <div className="flex justify-between"><div><p className="text-gray-500 text-xs">Expenses</p><p className="text-xl font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</p></div><div className="text-2xl">💰</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4">
          <h2 className="font-bold mb-3">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4">
          <h2 className="font-bold mb-3">Invoice Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {statusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold">Recent Invoices</h2>
          <button onClick={() => navigateTo('/dashboard/invoices')} className="text-purple-600 text-sm">View All →</button>
        </div>
        <div className="space-y-2">
          {recentInvoices.map((inv, idx) => (
            <div key={idx} onClick={() => navigateTo(`/dashboard/invoices/${inv.id}`)} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${inv.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>{inv.status === 'paid' ? '✅' : '📄'}</span>
                <div><p className="font-medium text-gray-900 dark:text-white">{inv.invoice_number}</p><p className="text-xs text-gray-500">Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</p></div>
              </div>
              <div className="text-right"><p className="font-bold text-gray-900 dark:text-white">{inv.currency || 'USD'} {inv.total?.toFixed(2)}</p><p className={`text-xs ${inv.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>{inv.status || 'draft'}</p></div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => alert('AI: Type "Show me my report" in the chat')}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl shadow-lg hover:scale-110 transition-all flex items-center justify-center"
      >
        🤖
      </button>
    </div>
  );
}
