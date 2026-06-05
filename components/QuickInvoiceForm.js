'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Button from './Button'
import FormInput from './FormInput'
import Modal from './Modal'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'

export default function QuickInvoiceForm({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculatingTax, setCalculatingTax] = useState(false)
  const [clients, setClients] = useState([])
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

  useEffect(() => {
    loadClients()
  }, [])

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

  const calculateTaxWithStripe = async (amount, clientId) => {
    const client = clients.find(c => c.id === clientId)
    
    if (!client || !client.state) {
      setTaxAmount(0)
      setTaxRate(0)
      setTotal(amount - discountAmount)
      return
    }

    setCalculatingTax(true)
    try {
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
      
      if (data.success) {
        const tax = parseFloat(data.taxAmount)
        setTaxAmount(tax)
        setTaxRate(data.taxRate || 0)
        setTotal(amount + tax - discountAmount)
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
    
    const invoiceNumber = await generateInvoiceNumber(user.id)
    
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Client *</label>
            <select
              value={formData.client_id}
              onChange={handleClientChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              required
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email} {client.state ? `(${client.state})` : ''}
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
              placeholder="Discount code"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
            <button
              onClick={applyDiscount}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Apply
            </button>
          </div>
          
          {calculatingTax ? (
            <div className="text-gray-600 dark:text-gray-400">Calculating tax...</div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
                <span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium text-green-700 dark:text-green-400">Discount ({discountCode}):</span>
                  <span className="font-bold text-green-700 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tax ({taxRate}%):</span>
                  <span className="font-bold text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                <span className="font-bold text-gray-800 dark:text-gray-200">Total:</span>
                <span className="font-extrabold text-xl text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <button onClick={removeDiscount} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium mt-2">
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
