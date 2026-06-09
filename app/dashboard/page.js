'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const [showAI, setShowAI] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'ai', content: "👋 Hello! Ask me about invoices, estimates, or currencies!" }
  ]);
  
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
  const [recentEstimates, setRecentEstimates] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [selectedPeriod]);

  const navigateTo = (path) => {
    router.push(path);
  };

  async function loadAllData() {
    setLoading(true);
    
    try {
      const [invoicesRes, clientsRes, expensesRes, estimatesRes] = await Promise.all([
        supabase.from('invoices').select('*, clients(id, name)').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name, email'),
        supabase.from('expenses').select('amount, category, date'),
        supabase.from('estimates').select('*, clients(name)').order('created_at', { ascending: false }).limit(5)
      ]);
      
      const invoices = invoicesRes.data || [];
      const clients = clientsRes.data || [];
      const expenses = expensesRes.data || [];
      const estimates = estimatesRes.data || [];
      
      const paidInvoices = invoices.filter(i => i.status === 'paid');
      const overdueInvoices = invoices.filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date());
      const pendingInvoices = invoices.filter(i => i.status !== 'paid' && (!i.due_date || new Date(i.due_date) >= new Date()));
      
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
      const pendingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthInvoices = invoices.filter(i => {
        const d = new Date(i.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const lastMonthInvoices = invoices.filter(i => {
        const d = new Date(i.created_at);
        return d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear;
      });
      const thisMonthRevenue = thisMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
      const lastMonthRevenue = lastMonthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
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
      
      setRecentInvoices(invoices.slice(0, 6));
      setRecentEstimates(estimates);
      
      let chartData = [];
      if (selectedPeriod === 'week') {
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayInvoices = invoices.filter(inv => 
            format(new Date(inv.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          chartData.push({
            name: format(date, 'EEE'),
            revenue: dayInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
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
            revenue: dayInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
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
            revenue: monthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
          });
        }
      }
      setRevenueData(chartData);
      
      setStatusData([
        { name: 'Paid', value: paidInvoices.length, color: '#10b981' },
        { name: 'Pending', value: pendingInvoices.length, color: '#f59e0b' },
        { name: 'Overdue', value: overdueInvoices.length, color: '#ef4444' }
      ]);
      
      const clientRevenue = {};
      invoices.forEach(inv => {
        if (inv.clients?.id && inv.status === 'paid') {
          clientRevenue[inv.clients.id] = (clientRevenue[inv.clients.id] || 0) + (inv.total || 0);
        }
      });
      const topClientsList = Object.entries(clientRevenue)
        .map(([id, revenue]) => {
          const client = clients.find(c => c.id === id);
          return { name: client?.name || 'Unknown', revenue, id };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopClients(topClientsList);
      
      const activities = [];
      invoices.slice(0, 5).forEach(inv => {
        activities.push({ 
          type: 'invoice', 
          action: inv.status === 'paid' ? 'paid' : 'created', 
          item: inv.invoice_number, 
          client: inv.clients?.name, 
          time: format(new Date(inv.created_at), 'MMM dd, h:mm a'),
          status: inv.status,
          id: inv.id
        });
      });
      estimates.forEach(est => {
        activities.push({ 
          type: 'estimate', 
          action: 'created', 
          item: est.estimate_number, 
          client: est.clients?.name, 
          time: format(new Date(est.created_at), 'MMM dd, h:mm a'),
          status: est.status,
          id: est.id
        });
      });
      setRecentActivity(activities.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return timeB - timeA;
      }).slice(0, 5));
      
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
    
    setLoading(false);
  }

  const handleAISend = () => {
    if (!aiMessage.trim()) return;
    const userMsg = aiMessage;
    setAiChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiMessage('');
    
    let response = "Ask me about creating invoices, estimates, or currencies!";
    const lower = userMsg.toLowerCase();
    
    if (lower.includes('invoice')) {
      response = "📄 Go to Invoices → Create Invoice. Add client, amount, choose currency!";
    } else if (lower.includes('estimate')) {
      response = "📋 Go to Estimates → New Estimate. Create, then click 'Convert to Invoice'!";
    } else if (lower.includes('currency')) {
      response = "💰 Supported: USD, EUR, GBP, CAD, AUD, JPY, CNY, INR, BRL, AED";
    } else {
      response = "💡 Try: 'How to create an invoice?' or 'What currencies are supported?'";
    }
    
    setTimeout(() => {
      setAiChat(prev => [...prev, { role: 'ai', content: response }]);
    }, 200);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      {/* AI Button */}
      <button
        onClick={() => setShowAI(!showAI)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110"
      >
        🤖
      </button>

      {showAI && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAI(false)} />
          <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 bg-purple-600 text-white flex justify-between">
              <span className="font-bold">AI Assistant</span>
              <button onClick={() => setShowAI(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {aiChat.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISend()}
                placeholder="Ask..."
                className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm"
              />
              <button onClick={handleAISend} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm">Send</button>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your business overview.</p>
      </div>

      {/* Period Selector */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: '💰', link: '/dashboard/invoices' },
          { title: 'Profit', value: `$${stats.netProfit.toLocaleString()}`, icon: '📈', link: '/dashboard/reports' },
          { title: 'Pending', value: `$${stats.pendingAmount.toLocaleString()}`, icon: '⏳', link: '/dashboard/invoices' },
          { title: 'Invoices', value: stats.totalInvoices, icon: '📄', link: '/dashboard/invoices' },
          { title: 'Paid', value: stats.paidInvoices, icon: '✅', link: '/dashboard/invoices' },
          { title: 'Clients', value: stats.totalClients, icon: '👥', link: '/dashboard/clients' },
          { title: 'Overdue', value: stats.overdueInvoices, icon: '⚠️', link: '/dashboard/invoices' },
          { title: 'Expenses', value: `$${stats.totalExpenses.toLocaleString()}`, icon: '💰', link: '/dashboard/expenses' },
        ].map((card, idx) => (
          <div key={idx} onClick={() => navigateTo(card.link)} className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 cursor-pointer hover:shadow-lg">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-xs">{card.title}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <button onClick={() => navigateTo('/dashboard/invoices/new')} className="bg-blue-600 text-white p-3 rounded-xl text-sm">📄 Create Invoice</button>
        <button onClick={() => navigateTo('/dashboard/clients/new')} className="bg-purple-600 text-white p-3 rounded-xl text-sm">👥 Add Client</button>
        <button onClick={() => navigateTo('/dashboard/estimates/new')} className="bg-green-600 text-white p-3 rounded-xl text-sm">📋 New Estimate</button>
        <button onClick={() => navigateTo('/dashboard/expenses/new')} className="bg-orange-600 text-white p-3 rounded-xl text-sm">💰 Add Expense</button>
        <button onClick={() => navigateTo('/dashboard/settings/reminders')} className="bg-yellow-600 text-white p-3 rounded-xl text-sm">🔔 Reminders</button>
        <button onClick={() => navigateTo('/dashboard/reports')} className="bg-indigo-600 text-white p-3 rounded-xl text-sm">📊 Reports</button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4">
        <h2 className="font-bold mb-3">🔄 Recent Activity</h2>
        <div className="space-y-2">
          {recentActivity.slice(0, 3).map((activity, idx) => (
            <div key={idx} onClick={() => navigateTo(activity.type === 'invoice' ? `/dashboard/invoices/${activity.id}` : `/dashboard/estimates/${activity.id}`)} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer text-sm">
              <span>{activity.type === 'invoice' ? '📄' : '📋'}</span>
              <span className="flex-1">{activity.action === 'paid' ? 'Payment received' : 'Created'} {activity.item}</span>
              <span className="text-gray-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
