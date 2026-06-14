'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';
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
      router.push(`${path}?status=${filter}`);
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
      { name: t('paid'), value: paidInvoices.length, color: '#10b981', link: '/dashboard/invoices?status=paid' },
      { name: t('pending'), value: pendingInvoices.length, color: '#f59e0b', link: '/dashboard/invoices?status=pending' },
      { name: t('overdue'), value: overdueInvoices.length, color: '#ef4444', link: '/dashboard/invoices?status=overdue' }
    ]);
    
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {t('welcomeBack')}
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              selectedPeriod === period
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {t(period)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => navigateTo('/dashboard/invoices', 'paid')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('revenue')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('netProfit')}</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                ${stats.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/invoices', 'pending')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('pending')}</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                ${stats.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/invoices')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('totalInvoices')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalInvoices}
              </p>
            </div>
            <div className="text-2xl">📄</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/invoices', 'paid')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('paid')}</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {stats.paidInvoices}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/clients')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('clients')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalClients}
              </p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/invoices', 'overdue')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('overdue')}</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {stats.overdueInvoices}
              </p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>
        
        <div
          onClick={() => navigateTo('/dashboard/expenses')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{t('expenses')}</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                ${stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">
            {t('revenueTrend')}
          </h2>
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
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">
            {t('invoiceStatus')}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigateTo(entry.link)}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                onClick={(e) => {
                  const item = statusData.find((d) => d.name === e.value);
                  if (item) navigateTo(item.link);
                }}
                formatter={(value) => <span className="cursor-pointer">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {t('recentInvoices')}
          </h2>
          <button
            onClick={() => navigateTo('/dashboard/invoices')}
            className="text-purple-600 text-sm hover:text-purple-700 transition-colors"
          >
            {t('viewAll')} →
          </button>
        </div>
        <div className="space-y-2">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>📭 {t('noInvoices')}</p>
            </div>
          ) : (
            recentInvoices.map((inv, idx) => (
              <div
                key={idx}
                onClick={() => navigateTo(`/dashboard/invoices/${inv.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${inv.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {inv.status === 'paid' ? '✅' : '📄'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {inv.invoice_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('due')}: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : t('na')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {inv.currency || 'USD'} {inv.total?.toFixed(2)}
                  </p>
                  <p className={`text-xs ${inv.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {t(inv.status || 'draft')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}