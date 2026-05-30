'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Zap, Rocket, TrendingUp } from 'lucide-react'

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(null)

  const handleSubscribe = async (planName, priceId) => {
    if (planName === 'Free') {
      window.location.href = '/signup'
      return
    }

    setLoading(planName)
    
    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          successUrl: window.location.origin + '/dashboard',
          cancelUrl: window.location.origin + '/pricing'
        })
      })
      
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error: ' + data.error)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: 0,
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      features: ['3 invoices/month', 'CSV upload', 'Single PDF']
    },
    {
      name: 'Pro',
      price: 9,
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      popular: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      features: ['Unlimited invoices', 'CSV bulk import', 'Multi-PDF', 'Recurring', 'Stripe payments']
    },
    {
      name: 'Business',
      price: 29,
      icon: Rocket,
      color: 'from-purple-500 to-purple-600',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
      features: ['Everything in Pro', 'Team members (5)', 'API access', 'Priority support']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Simple Pricing</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Start free, upgrade when you need more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && <div className="bg-blue-500 text-white text-center py-1 text-sm">MOST POPULAR</div>}
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <plan.icon className="w-12 h-12 mb-4" />
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-sm">/month</span>}
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.name, plan.priceId)}
                  disabled={loading === plan.name}
                  className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading === plan.name ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
