'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import MultiInvoicePDF from '@/components/MultiInvoicePDF'
import InvoiceFilter from '@/components/InvoiceFilter'
import QuickInvoiceForm from '@/components/QuickInvoiceForm'

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

  const handleFilter = (filters) => {
    let filtered = [...invoices]
    
    if (filters.status) {
      filtered = filtered.filter(inv => inv.status === filters.status)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.created_at) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(inv => new Date(inv.created_at) <= new Date(filters.dateTo))
    }
    if (filters.minAmount) {
      filtered = filtered.filter(inv => inv.total >= parseFloat(filters.minAmount))
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(inv => inv.total <= parseFloat(filters.maxAmount))
    }
    
    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and send invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {clients.length > 0 && (
            <QuickInvoiceForm clients={clients} onSuccess={loadInvoices} />
          )}
          {invoices.length > 0 && business && (
            <PDFDownloadLink
              document={<MultiInvoicePDF invoices={filteredInvoices} business={business} />}
              fileName={`invoices-${new Date().toISOString().split('T')[0]}.pdf`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {({ loading }) => loading ? 'Generating...' : '📄 Download All'}
            </PDFDownloadLink>
          )}
          <Link
            href="/dashboard/invoices/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Invoice
          </Link>
        </div>
      </div>

      <InvoiceFilter onFilter={handleFilter} />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
          <span className="text-6xl mb-4 block">📄</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first invoice by uploading a CSV</p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Invoice #</th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Client</th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">
                      <Link 
                        href={`/dashboard/invoices/${invoice.id}`} 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{invoice.clients?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.clients?.email}</div>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white">${Number(invoice.total).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)} dark:${invoice.status === 'paid' ? 'bg-green-900 text-green-300' : invoice.status === 'sent' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
