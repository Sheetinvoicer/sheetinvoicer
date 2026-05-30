'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')
  const router = useRouter()
  const supabase = createClient()

  const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['3 invoices/month', 'CSV upload', 'Single PDF'] },
    { id: 'pro', name: 'Pro', price: 9, priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, features: ['Unlimited invoices', 'CSV bulk import', 'Multi-PDF', 'Recurring', 'Stripe payments'] },
    { id: 'business', name: 'Business', price: 29, priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID, features: ['Everything in Pro', 'Team members (5)', 'API access', 'Priority support'] }
  ]

  useEffect(() => {
    getUserPlan()
  }, [])

  const getUserPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      if (data?.plan) setCurrentPlan(data.plan)
    }
  }

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') {
      toast.success('You are on the Free plan')
      return
    }

    if (!plan.priceId) {
      toast.error('Subscription not configured. Please contact support.')
      return
    }

    setLoading(true)
    toast.loading('Redirecting to Stripe...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please log in first')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          userId: user.id,
          userEmail: user.email,
          returnUrl: window.location.origin
        })
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error creating subscription')
        setLoading(false)
      }
    } catch (error) {
      toast.error('Error: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Toaster />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Subscription Plans</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Choose the perfect plan for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
            {currentPlan === plan.id && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm">CURRENT PLAN</div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                {plan.price > 0 && <span className="text-gray-500">/month</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full py-2 rounded-lg font-semibold ${
                  currentPlan === plan.id
                    ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                    : plan.price === 0
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : currentPlan === plan.id ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
