'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    tax_id: '',
    currency: 'USD',
    brand_color: '#2563eb'
  })
  const supabase = createClient()

  const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'AED', symbol: 'د.إ', name: 'Dirham' },
  ]

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setProfile({
          name: data.name || '',
          address: data.address || '',
          tax_id: data.tax_id || '',
          currency: data.currency || 'USD',
          brand_color: data.brand_color || '#2563eb'
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: user.id,
        ...profile
      })
    
    setLoading(false)
    
    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved successfully!')
    }
  }

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your business profile</p>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              value={profile.tax_id}
              onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select
              value={profile.currency}
              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={profile.brand_color}
                onChange={(e) => setProfile({ ...profile, brand_color: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600">{profile.brand_color}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Additional Settings Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
          <div className="space-y-3">
            <Link href="/dashboard/settings/currency" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div>
                <p className="font-medium">Currency Preferences</p>
                <p className="text-sm text-gray-500">Set your default currency for invoices</p>
              </div>
              <span className="text-blue-600">→</span>
            </Link>
            <Link href="/dashboard/settings/reminders" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div>
                <p className="font-medium">Reminder Settings</p>
                <p className="text-sm text-gray-500">Configure automatic payment reminders</p>
              </div>
              <span className="text-blue-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
