'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(null)
  const [proPriceId, setProPriceId] = useState(null)
  const [businessPriceId, setBusinessPriceId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    console.log('Pro Price ID:', process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)
    console.log('Business Price ID:', process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID)
    setProPriceId(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)
    setBusinessPriceId(process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID)
  }, [])

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: null,
      features: ['5 invoices/month', 'CSV upload', 'Single PDF export', 'Client management']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      priceId: proPriceId,
      features: ['Unlimited invoices', 'Recurring invoices', 'Multi-PDF download', 'Stripe payments', 'Priority support']
    },
    {
      id: 'business',
      name: 'Business',
      price: 29,
      priceId: businessPriceId,
      features: ['Everything in Pro', 'Team members (5)', 'API access', 'Custom branding', '24/7 support']
    }
  ]

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') {
      toast.success('You are on the Free plan!')
      return
    }
    
    if (!plan.priceId) {
      toast.error('Subscription not configured. Missing price ID.')
      return
    }
    
    setLoading(plan.id)
    
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard/subscription/success`,
          cancelUrl: `${window.location.origin}/dashboard/subscription`,
        }),
      })
      
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to create subscription')
      }
    } catch (error) {
      toast.error('Error processing subscription')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-center mb-8">Subscription Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-gray-500">/month</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
                className="w-full py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading === plan.id ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
