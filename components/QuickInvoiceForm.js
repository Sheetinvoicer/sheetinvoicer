'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Button from './Button'
import FormInput from './FormInput'
import Modal from './Modal'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'

export default function QuickInvoiceForm({ clients, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [discountType, setDiscountType] = useState('')
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    notes: ''
  })
  const supabase = createClient()

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    
    const response = await fetch('/api/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: discountCode, subtotal: parseFloat(formData.amount) || 0 }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      setDiscountAmount(parseFloat(data.discountAmount))
      setTotal(parseFloat(data.total))
      toast.success(`Discount applied: -$${data.discountAmount}`)
    } else {
      toast.error(data.error)
      setDiscountAmount(0)
      setTotal(parseFloat(formData.amount) || 0)
    }
  }

  const removeDiscount = () => {
    setDiscountAmount(0)
    setDiscountCode('')
    setTotal(parseFloat(formData.amount) || 0)
    toast.success('Discount removed')
  }

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0
    setSubtotal(amount)
    setTotal(amount - discountAmount)
    setFormData({ ...formData, amount: e.target.value })
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
    
    const { error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber,
        subtotal: parseFloat(formData.amount) || 0,
        discount_amount: discountAmount,
        discount_code: discountCode || null,
        total: total,
        notes: formData.notes,
        status: 'draft'
      })
    
    setLoading(false)
    
    if (error) {
      toast.error('Error creating invoice: ' + error.message)
    } else {
      toast.success(`Invoice ${invoiceNumber} created with ${discountAmount > 0 ? `$${discountAmount} discount!` : ''}`)
      setIsOpen(false)
      setFormData({ client_id: '', amount: '', notes: '' })
      setSubtotal(0)
      setDiscountAmount(0)
      setDiscountCode('')
      setTotal(0)
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
            onChange={handleAmountChange}
            required
            placeholder="0.00"
          />
          
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Discount code (WELCOME10, SAVE20, LAUNCH25)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
            <button
              onClick={applyDiscount}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply
            </button>
          </div>
          
          {discountAmount > 0 && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>${parseFloat(formData.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountCode}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-green-200">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button onClick={removeDiscount} className="text-xs text-red-500 hover:text-red-700 mt-1">
                Remove discount
              </button>
            </div>
          )}
          
          <FormInput
            label="Notes (Optional)"
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Invoice notes..."
          />
          
          <div className="text-xs text-gray-500">
            💰 Try discount codes: WELCOME10 (10% off), SAVE20 ($20 off), LAUNCH25 (25% off)
          </div>
        </div>
      </Modal>
    </>
  )
}
