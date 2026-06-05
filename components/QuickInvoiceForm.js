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
  const [calculatingTax, setCalculatingTax] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    notes: ''
  })
  const supabase = createClient()

  const calculateTaxWithStripe = async (amount, clientId) => {
    const client = clients.find(c => c.id === clientId)
    console.log('Calculating tax for client:', client?.name, 'State:', client?.state)
    
    if (!client || !client.state) {
      console.log('No state found, setting tax to 0')
      setTaxAmount(0)
      setTaxRate(0)
      setTotal(amount - discountAmount)
      return
    }

    setCalculatingTax(true)
    try {
      console.log('Calling tax API with state:', client.state)
      const response = await fetch('/api/stripe/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          country: 'US',
          state: client.state,
        }),
      })
      const data = await response.json()
      console.log('Tax API response:', data)
      
      if (data.success) {
        const tax = parseFloat(data.taxAmount)
        setTaxAmount(tax)
        setTaxRate(data.taxRate || 0)
        setTotal(amount + tax - discountAmount)
        console.log(`Tax calculated: ${tax} (${data.taxRate}%), Total: ${amount + tax - discountAmount}`)
      }
    } catch (error) {
      console.error('Tax calculation error:', error)
    } finally {
      setCalculatingTax(false)
    }
  }

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    
    const response = await fetch('/api/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: discountCode, subtotal: subtotal }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      const newDiscount = parseFloat(data.discountAmount)
      setDiscountAmount(newDiscount)
      setTotal(subtotal - newDiscount + taxAmount)
      toast.success(`Discount applied: -$${newDiscount.toFixed(2)}`)
    } else {
      toast.error(data.error)
    }
  }

  const removeDiscount = () => {
    setDiscountAmount(0)
    setDiscountCode('')
    setTotal(subtotal + taxAmount)
    toast.success('Discount removed')
  }

  const handleAmountChange = async (e) => {
    const amount = parseFloat(e.target.value) || 0
    setSubtotal(amount)
    setFormData({ ...formData, amount: e.target.value })
    
    if (formData.client_id) {
      await calculateTaxWithStripe(amount, formData.client_id)
    } else {
      setTotal(amount - discountAmount)
    }
  }

  const handleClientChange = async (e) => {
    const clientId = e.target.value
    setFormData({ ...formData, client_id: clientId })
    
    const amount = parseFloat(formData.amount) || 0
    if (clientId && amount > 0) {
      await calculateTaxWithStripe(amount, clientId)
    } else {
      setTaxAmount(0)
      setTaxRate(0)
      setTotal(amount - discountAmount)
    }
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
    
    console.log('Saving invoice with tax:', { subtotal, taxAmount, taxRate, discountAmount, total })
    
    const { error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber,
        subtotal: subtotal,
        tax_amount: taxAmount,
        tax_rate_percentage: taxRate,
        discount_amount: discountAmount,
        discount_code: discountCode || null,
        total: total,
        notes: formData.notes,
        status: 'draft'
      })
    
    setLoading(false)
    
    if (error) {
      toast.error('Error creating invoice: ' + error.message)
      console.error('Insert error:', error)
    } else {
      toast.success(`Invoice ${invoiceNumber} created!`)
      setIsOpen(false)
      setFormData({ client_id: '', amount: '', notes: '' })
      setSubtotal(0)
      setTaxAmount(0)
      setTaxRate(0)
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
              onChange={handleClientChange}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              required
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email} {client.state ? `(${client.state})` : '(No state - 0% tax)'}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
            <button
              onClick={applyDiscount}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply
            </button>
          </div>
          
          {calculatingTax ? (
            <div className="text-sm text-gray-500">Calculating tax...</div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountCode}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <button onClick={removeDiscount} className="text-xs text-red-500 hover:text-red-700 mt-1">
                  Remove discount
                </button>
              )}
            </div>
          )}
          
          <FormInput
            label="Notes (Optional)"
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Invoice notes..."
          />
        </div>
      </Modal>
    </>
  )
}
