'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function EditInvoicePage({ params }) {
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [invoiceId, setInvoiceId] = useState(null)
  const [formData, setFormData] = useState({ notes: '', total: '' })
  const router = useRouter()
  const supabase = createClient()

  // Unwrap params Promise
  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params
      setInvoiceId(unwrappedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    async function loadInvoice() {
      if (!invoiceId) return
      
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()
      
      setInvoice(data)
      setFormData({ notes: data?.notes || '', total: data?.total || '' })
      setLoading(false)
    }
    
    loadInvoice()
  }, [invoiceId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('invoices')
      .update({
        total: parseFloat(formData.total),
        notes: formData.notes
      })
      .eq('id', invoiceId)
    
    if (error) {
      toast.error('Error saving invoice')
    } else {
      toast.success('Invoice updated!')
      router.push(`/dashboard/invoices/${invoiceId}`)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Invoice</h1>
      <p className="text-gray-600 mb-8">Update invoice details</p>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}