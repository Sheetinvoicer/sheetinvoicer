'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoicePDF from '@/components/pdf/InvoicePDF'
import toast, { Toaster } from 'react-hot-toast'
import posthog from 'posthog-js'

export default function InvoiceDetailPage({ params }) {
  const [invoice, setInvoice] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceId, setInvoiceId] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingRefund, setProcessingRefund] = useState(false)
  const [processingEmail, setProcessingEmail] = useState(false)
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
      posthog.capture('invoice_status_updated', { invoice_id: invoiceId, new_status: newStatus })
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
        posthog.capture('invoice_deleted', { invoice_id: invoiceId })
        toast.success('Invoice deleted')
        router.push('/dashboard/invoices')
      }
    }
  }

  const handlePayment = async () => {
    setProcessingPayment(true)
    posthog.capture('invoice_payment_initiated', {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.total,
    })
    
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

  const sendEmail = async () => {
    setProcessingEmail(true)
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.clients?.email,
          subject: `Invoice ${invoice.invoice_number} from ${business?.business_name || 'SheetInvoicer'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Invoice ${invoice.invoice_number}</h2>
              <p>Dear ${invoice.clients?.name},</p>
              <p>Please find your invoice attached.</p>
              <p><strong>Amount Due:</strong> $${(invoice.total || 0).toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt'}</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pay Now</a>
            </div>
          `,
        }),
      })
      
      if (response.ok) {
        toast.success('Email sent successfully!')
      } else {
        toast.error('Failed to send email')
      }
    } catch (error) {
      toast.error('Email error')
    } finally {
      setProcessingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/dashboard/invoices" className="text-blue-600 mt-4 inline-block">
          Back to Invoices
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Link 
          href="/dashboard/invoices" 
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateStatus('sent')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark as Sent
          </button>
          <button
            onClick={() => updateStatus('paid')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Paid
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Invoice Title */}
          <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Invoice {invoice.invoice_number}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Created on {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              Status: {invoice.status || 'draft'}
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Client Information</h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white">
                <span className="font-medium text-gray-600 dark:text-gray-400">Name:</span> {invoice.clients?.name || 'N/A'}
              </p>
              <p className="text-gray-900 dark:text-white">
                <span className="font-medium text-gray-600 dark:text-gray-400">Email:</span> {invoice.clients?.email || 'N/A'}
              </p>
              {invoice.clients?.phone && (
                <p className="text-gray-900 dark:text-white">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Phone:</span> {invoice.clients.phone}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Invoice Details</h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white">
                <span className="font-medium text-gray-600 dark:text-gray-400">Amount:</span> 
                <span className="text-xl font-bold text-gray-900 dark:text-white ml-2">${(invoice.total || 0).toFixed(2)}</span>
              </p>
              {invoice.notes && (
                <p className="text-gray-900 dark:text-white">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Notes:</span> {invoice.notes}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/dashboard/invoices/${invoice.id}/edit`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Edit Invoice
            </Link>
            <button
              onClick={deleteInvoice}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Invoice
            </button>
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} business={business} />}
              fileName={`invoice-${invoice.invoice_number}.pdf`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
            </PDFDownloadLink>
            <button
              onClick={sendEmail}
              disabled={processingEmail}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {processingEmail ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {processingPayment ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
