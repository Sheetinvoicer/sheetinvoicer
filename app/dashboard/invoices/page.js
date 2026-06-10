'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTranslate } from '@/hooks/useTranslate'
import { Plus } from 'lucide-react'

export default function InvoicesPage() {
  const { t } = useTranslate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('invoices').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false })
      setInvoices(data || [])
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6">{t('Loading')}...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('Invoices')}</h1>
        <Link href="/dashboard/invoices/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> {t('New Invoice')}
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('No invoices yet')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">{t('Invoice Number')}</th>
                <th className="px-4 py-3 text-left">{t('Client')}</th>
                <th className="px-4 py-3 text-left">{t('Date')}</th>
                <th className="px-4 py-3 text-right">{t('Amount')}</th>
                <th className="px-4 py-3 text-center">{t('Status')}</th>
                <th className="px-4 py-3 text-center">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{inv.invoice_number}</td>
                  <td className="px-4 py-3">{inv.clients?.name || '-'}</td>
                  <td className="px-4 py-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">${(inv.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status === 'paid' ? t('Paid') : inv.status === 'sent' ? t('Sent') : t('Draft')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-blue-600 hover:underline">{t('View')}</Link>
                  </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}
    </div>
  )
}
