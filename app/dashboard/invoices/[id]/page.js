'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
          returnUrl: window.location.href,
        }),
      })
      
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Error creating payment session')
      }
    } catch (error) {
      toast.error('Error starting payment')
      setProcessingPayment(false)
    }
  }

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund this payment? This action cannot be undone.')) {
      return
    }

    setProcessingRefund(true)
    try {
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Refund processed successfully!')
        updateStatus('refunded')
      } else {
        toast.error(data.error || 'Error processing refund')
      }
    } catch (error) {
      toast.error('Error processing refund')
    } finally {
      setProcessingRefund(false)
    }
  }

  const handleSendEmail = async () => {
    if (!invoice.clients?.email) {
      toast.error('Client has no email address')
      return
    }

    setProcessingEmail(true)
    toast.loading('Sending email...')

    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>Dear ${invoice.clients?.name},</p>
          <p>Please find invoice ${invoice.invoice_number} for your reference.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount Due:</strong> $${invoice.total?.toLocaleString()}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
          <p>Click the button below to view and pay this invoice:</p>
          <a href="https://sheetinvoicer.vercel.app/pay/${invoice.id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View & Pay Invoice</a>
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Thank you for your business!</p>
        </div>
      `

      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.clients.email,
          subject: `Invoice ${invoice.invoice_number} from ${business?.name || 'SheetInvoicer'}`,
          html: emailHtml,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Email sent successfully!')
        updateStatus('sent')
      } else {
        toast.error(data.error || 'Error sending email')
      }
    } catch (error) {
      toast.error('Error sending email')
    } finally {
      setProcessingEmail(false)
      toast.dismiss()
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>
  }

  return (
    <div className="p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4">Invoice {invoice.invoice_number}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <p className="mb-2"><strong>Client:</strong> {invoice.clients?.name}</p>
          <p className="mb-2"><strong>Email:</strong> {invoice.clients?.email}</p>
          <p className="mb-2"><strong>Amount:</strong> ${invoice.total}</p>
          <p className="mb-4"><strong>Notes:</strong> {invoice.notes || 'None'}</p>
          
          <div className="mb-4">
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
              invoice.status === 'refunded' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {invoice.status}
            </span>
          </div>
          
          {invoice.status !== 'paid' && invoice.status !== 'refunded' && (
            <div className="space-x-2 mb-4">
              <button
                onClick={() => updateStatus('sent')}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Mark as Sent
              </button>
              <button
                onClick={() => updateStatus('paid')}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Mark as Paid (Manual)
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 space-x-3 flex flex-wrap gap-2">
        <button 
          onClick={() => router.push('/dashboard/invoices')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>
        <button 
          onClick={() => router.push(`/dashboard/invoices/${invoiceId}/edit`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Edit
        </button>
        <button 
          onClick={deleteInvoice}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} business={business} />}
          fileName={`invoice-${invoice.invoice_number}.pdf`}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
        >
          {({ loading }) => loading ? 'Generating...' : 'Download PDF'}
        </PDFDownloadLink>
        
        <button
          onClick={handleSendEmail}
          disabled={processingEmail}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          {processingEmail ? 'Sending...' : 'Send Email'}
        </button>
        
        {invoice.status !== 'paid' && invoice.status !== 'refunded' && (
          <button
            onClick={handlePayment}
            disabled={processingPayment}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {processingPayment ? 'Processing...' : 'Pay Now'}
          </button>
        )}
        
        {invoice.status === 'paid' && (
          <button
            onClick={handleRefund}
            disabled={processingRefund}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {processingRefund ? 'Processing...' : 'Refund'}
          </button>
        )}
      </div>
    </div>
  )
}