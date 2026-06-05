'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Button from './Button'
import FormInput from './FormInput'
import Modal from './Modal'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'
import TaxRateSelector from './TaxRateSelector'

export default function QuickInvoiceForm({ clients, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTaxId, setSelectedTaxId] = useState(null)
  const [taxRate, setTaxRate] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    notes: ''
  })
  const supabase = createClient()

  const handleTaxChange = (taxId, rate, taxAmt, total) => {
    setSelectedTaxId(taxId)
    setTaxRate(rate)
    setTaxAmount(taxAmt)
    setTotalAmount(total)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login first')
      setLoading(false)
      return
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle()
    
    const planType = profile?.plan?.toLowerCase() || 'free'
    
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (planType === 'free' && count >= 5) {
      toast.error(`Free plan limited to 5 invoices. You have ${count}/5. Upgrade to Pro.`)
      setLoading(false)
      return
    }
    
    const invoiceNumber = await generateInvoiceNumber(user.id)
    const finalTotal = totalAmount > 0 ? totalAmount : parseFloat(formData.amount) || 0
    
    const { error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber,
        total: finalTotal,
        subtotal: parseFloat(formData.amount) || 0,
        tax_rate_id: selectedTaxId,
        tax_rate_percentage: taxRate,
        tax_amount: taxAmount,
        notes: formData.notes,
        status: 'draft'
      })
    
    setLoading(false)
    
    if (error) {
      toast.error('Error creating invoice: ' + error.message)
    } else {
      toast.success(`Invoice ${invoiceNumber} created!`)
      setIsOpen(false)
      setFormData({ client_id: '', amount: '', notes: '' })
      setSelectedTaxId(null)
      setTaxRate(0)
      setTaxAmount(0)
      setTotalAmount(0)
      onSuccess()
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <Button onClick={() => setIsOpen(true)} variant="success" size="sm">
        ⚡ Quick Invoice
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Quick Create Invoice"
        onConfirm={handleSubmit}
        confirmText={loading ? "Creating..." : "Create Invoice"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              required
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>
          
          <FormInput
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            placeholder="0.00"
          />
          
          <TaxRateSelector
            selectedTaxId={selectedTaxId}
            onTaxChange={handleTaxChange}
            amount={parseFloat(formData.amount) || 0}
          />
          
          <FormInput
            label="Notes (Optional)"
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Invoice notes..."
          />
          
          <div className="text-xs text-gray-500">
            Invoice number will be auto-generated (e.g., INV-000001)
          </div>
        </div>
      </Modal>
    </>
  )
}
