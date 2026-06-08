'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import CurrencySelector from '@/components/CurrencySelector'

export default function CurrencySettingsPage() {
  const [currency, setCurrency] = useState('USD')
  const [autoConvert, setAutoConvert] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_currency_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setCurrency(data.default_currency || 'USD')
        setAutoConvert(data.auto_convert || false)
      }
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('user_currency_settings')
      .upsert({
        user_id: user.id,
        default_currency: currency,
        auto_convert: autoConvert,
      })
    
    if (error) {
      toast.error('Error saving settings')
    } else {
      toast.success('Currency settings saved!')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Currency Settings</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block font-semibold mb-2">Default Currency</label>
          <CurrencySelector
            value={currency}
            onChange={setCurrency}
            showConverted={false}
          />
          <p className="text-sm text-gray-500 mt-2">
            New invoices will use this currency by default
          </p>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h3 className="font-semibold">Auto Currency Conversion</h3>
            <p className="text-sm text-gray-500">Show USD equivalent for all invoices</p>
          </div>
          <button
            onClick={() => setAutoConvert(!autoConvert)}
            className={`px-4 py-2 rounded-lg ${autoConvert ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}
          >
            {autoConvert ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
