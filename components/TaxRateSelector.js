'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function TaxRateSelector({ selectedTaxId, onTaxChange, amount }) {
  const [taxRates, setTaxRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [calculatedTax, setCalculatedTax] = useState({ rate: 0, amount: 0, total: 0 })
  const supabase = createClient()

  useEffect(() => {
    loadTaxRates()
  }, [])

  useEffect(() => {
    calculateTax()
  }, [selectedTaxId, amount])

  const loadTaxRates = async () => {
    try {
      const response = await fetch('/api/tax-rates')
      const { data } = await response.json()
      setTaxRates(data || [])
      
      // Select default tax rate if none selected
      if (!selectedTaxId && data?.length) {
        const defaultTax = data.find(t => t.is_default) || data[0]
        if (defaultTax && onTaxChange) {
          onTaxChange(defaultTax.id, defaultTax.percentage)
        }
      }
    } catch (error) {
      console.error('Error loading tax rates:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTax = () => {
    const selectedTax = taxRates.find(t => t.id === selectedTaxId)
    const rate = selectedTax?.percentage || 0
    const taxAmount = (amount * rate) / 100
    const total = amount + taxAmount
    
    setCalculatedTax({ rate, amount: taxAmount, total })
    
    if (onTaxChange) {
      onTaxChange(selectedTaxId, rate, taxAmount, total)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading tax rates...</div>
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tax Rate
      </label>
      <select
        value={selectedTaxId || ''}
        onChange={(e) => {
          const taxId = e.target.value
          const tax = taxRates.find(t => t.id === taxId)
          if (onTaxChange) {
            onTaxChange(taxId, tax?.percentage || 0)
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
          text-gray-900 dark:text-white bg-white dark:bg-gray-700"
      >
        <option value="">Select tax rate...</option>
        {taxRates.map((tax) => (
          <option key={tax.id} value={tax.id}>
            {tax.name} ({tax.percentage}%) {tax.country_code ? `- ${tax.country_code}` : ''}
          </option>
        ))}
      </select>
      
      {selectedTaxId && amount > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({calculatedTax.rate}%):</span>
            <span>${calculatedTax.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
            <span>Total:</span>
            <span>${calculatedTax.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
