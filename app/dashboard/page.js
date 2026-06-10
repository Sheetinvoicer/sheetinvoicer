'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTranslate } from '@/hooks/useTranslate'

export default function DashboardPage() {
  const { t } = useTranslate()
  const [stats, setStats] = useState({ totalInvoices: 0, totalClients: 0, totalRevenue: 0, pendingAmount: 0 })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: invoices } = await supabase.from('invoices').select('*').eq('user_id', user.id)
      if (invoices) {
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        const pendingAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
        setStats({
          totalInvoices: invoices.length,
          totalClients: new Set(invoices.map(inv => inv.client_id)).size,
          totalRevenue,
          pendingAmount
        })
        setRecentInvoices(invoices.slice(0, 5))
      }
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6">{t('Loading')}...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{t('Dashboard')}</h1>
      <p className="text-gray-500 mb-6">{t('Welcome Back')}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">{t('Total Invoices')}</p>
          <p className="text-2xl font-bold">{stats.totalInvoices}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">{t('Total Clients')}</p>
          <p className="text-2xl font-bold">{stats.totalClients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">{t('Total Revenue')}</p>
          <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">{t('Pending Amount')}</p>
          <p className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{t('Recent Invoices')}</h2>
        </div>
        <div className="divide-y">
          {recentInvoices.length === 0 ? (
            <div className="p-4 text-center text-gray-500">{t('No invoices yet')}</div>
          ) : (
            recentInvoices.map(inv => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="block p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">${(inv.total || 0).toFixed(2)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
