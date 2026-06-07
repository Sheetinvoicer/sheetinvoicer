'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import MultiInvoicePDF from '@/components/MultiInvoicePDF'
import InvoiceFilter from '@/components/InvoiceFilter'
import QuickInvoiceForm from '@/components/QuickInvoiceForm'
import { Download } from 'lucide-react'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [clients, setClients] = useState([])
  const supabase = createClient()

  useEffect(() => {
    loadInvoices()
    loadBusiness()
    loadClients()
  }, [])

  const loadInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('invoices')
        .select(`*, clients (name, email)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setInvoices(data || [])
      setFilteredInvoices(data || [])
    }
    setLoading(false)
  }

  const loadBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setBusiness(data)
    }
  }

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('clients')
        .select('id, name, email, state')
        .eq('user_id', user.id)
      setClients(data || [])
    }
  }

  const exportCSV = async () => {
    const response = await fetch(`/api/export?userId=${await supabase.auth.getUser().then(res => res.data.user?.id)}&type=invoices`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-6">Loading invoices...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-500">Manage and send invoices</p>
        </div>
        <div className="flex gap-2">
          {clients.length > 0 && <QuickInvoiceForm clients={clients} onSuccess={loadInvoices} />}
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No invoices yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Number</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{invoice.invoice_number}</td>
                  <td className="px-4 py-3">{invoice.clients?.name}</td>
                  <td className="px-4 py-3">{new Date(invoice.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">${invoice.total?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{invoice.status || 'draft'}</span></td>
                  <td className="px-4 py-3 text-center"><a href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:underline">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
