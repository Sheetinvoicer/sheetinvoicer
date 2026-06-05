'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoicePDF from '@/components/pdf/InvoicePDF'
import toast, { Toaster } from 'react-hot-toast'

export default function InvoiceDetailPage({ params }) {
  const [invoice, setInvoice] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceId, setInvoiceId] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params
      setInvoiceId(unwrappedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    async function loadData() {
      if (!invoiceId) return
      
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .single()
      
      setInvoice(invoiceData)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: businessData } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setBusiness(businessData)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [invoiceId])

  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId)
    
    if (error) {
      toast.error('Error updating status')
    } else {
      toast.success(`Invoice marked as ${newStatus}`)
      const { data } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .single()
      setInvoice(data)
    }
  }

  const deleteInvoice = async () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
      
      if (error) {
        toast.error('Error deleting invoice')
      } else {
        toast.success('Invoice deleted')
        router.push('/dashboard/invoices')
      }
    }
  }

  const handlePayment = async () => {
    setProcessingPayment(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total,
          clientName: invoice.clients?.name,
          clientEmail: invoice.clients?.email,
          returnUrl: `${window.location.origin}/dashboard/invoices/${invoice.id}`,
        }),
      })
      
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      } else {
        toast.error('Failed to create payment session')
      }
    } catch (error) {
      toast.error('Payment error')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading invoice...</div>
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p>Invoice not found</p>
        <Link href="/dashboard/invoices" className="text-blue-600">Back to Invoices</Link>
      </div>
    )
  }

  const subtotal = invoice.subtotal || invoice.total || 0
  const taxAmount = invoice.tax_amount || 0
  const discountAmount = invoice.discount_amount || 0
  const total = invoice.total || 0

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Link href="/dashboard/invoices" className="text-blue-600 hover:text-blue-800">
          ← Back to Invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => updateStatus('sent')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Mark as Sent
          </button>
          <button onClick={() => updateStatus('paid')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Mark as Paid
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
              <p className="text-gray-500 mt-1">Created on {new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              Status: {invoice.status || 'draft'}
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h2 className="text-md font-semibold mb-3">Client Information</h2>
            <p><strong>Name:</strong> {invoice.clients?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {invoice.clients?.email || 'N/A'}</p>
          </div>

          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h2 className="text-md font-semibold mb-3">Invoice Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({invoice.discount_code}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({invoice.tax_rate_percentage || 0}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {invoice.notes && <p className="mt-2 pt-2"><strong>Notes:</strong> {invoice.notes}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href={`/dashboard/invoices/${invoice.id}/edit`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Edit Invoice
            </Link>
            <button onClick={deleteInvoice} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete Invoice
            </button>
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} business={business} />}
              fileName={`invoice-${invoice.invoice_number}.pdf`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
            >
              {({ loading }) => (loading ? 'Generating...' : 'Download PDF')}
            </PDFDownloadLink>
            {invoice.status !== 'paid' && (
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processingPayment ? 'Processing...' : 'Pay Now 💳'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
