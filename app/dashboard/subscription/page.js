'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(null)
  const supabase = createClient()

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['10 invoices/month', 'CSV upload', 'Single PDF export', 'Client management']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      features: ['Unlimited invoices', 'Recurring invoices', 'Multi-PDF download', 'Stripe payments', 'Priority support']
    },
    {
      id: 'business',
      name: 'Business',
      price: 29,
      features: ['Everything in Pro', 'Team members (5)', 'API access', 'Custom branding', '24/7 support']
    }
  ]

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') {
      toast.success('You are on the Free plan!')
      return
    }
    
    setLoading(plan.id)
    toast.loading('Processing...')
    
    setTimeout(() => {
      toast.dismiss()
      toast.error('Stripe subscription coming soon!')
      setLoading(null)
    }, 1000)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Toaster position="top-right" />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Subscription Plans</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Choose the perfect plan for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-gray-500">/month</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.price === 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          All plans include CSV bulk import, PDF export, and client management.
          <br />
          Need help? <a href="mailto:support@sheetinvoicer.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@sheetinvoicer.com</a>
        </p>
      </div>
    </div>
  )
}
