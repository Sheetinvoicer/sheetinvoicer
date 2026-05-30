'use client'

import { useState } from 'react'
import PricingCard from '@/components/PricingCard'
import ComparisonTable from '@/components/ComparisonTable'

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
          priceId,
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
    { name: 'Free', price: 0, priceYearly: 0, popular: false, priceId: null, features: ['3 invoices/month', 'CSV upload (10 rows)', 'Single PDF', 'Client management'] },
    { name: 'Pro', price: 9, priceYearly: 90, popular: true, priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, features: ['Unlimited invoices', 'CSV bulk import (unlimited)', 'Multi-PDF download', 'Recurring invoices', 'Stripe payments', 'Email support'] },
    { name: 'Business', price: 29, priceYearly: 290, popular: false, priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID, features: ['Everything in Pro', '5 team members', 'API access', 'Custom branding', 'Priority support'] }
  ]

  const comparisonFeatures = [
    { name: 'Invoices per month', getValue: (plan) => plan.name === 'Free' ? '3/month' : 'Unlimited' },
    { name: 'CSV Bulk Import', getValue: (plan) => plan.name === 'Free' ? 'Up to 10 rows' : 'Unlimited rows' },
    { name: 'Multi-PDF Download', getValue: (plan) => plan.name !== 'Free' },
    { name: 'Recurring Invoices', getValue: (plan) => plan.name !== 'Free' },
    { name: 'Stripe Payments', getValue: (plan) => plan.name !== 'Free' },
    { name: 'Client Management', getValue: () => true },
    { name: 'Email Support', getValue: (plan) => plan.name === 'Business' ? 'Priority' : (plan.name === 'Pro' ? true : false) },
    { name: 'Team Members', getValue: (plan) => plan.name === 'Business' ? '5 seats' : (plan.name === 'Pro' ? false : false) },
    { name: 'API Access', getValue: (plan) => plan.name === 'Business' },
    { name: 'Custom Branding', getValue: (plan) => plan.name === 'Business' }
  ]

  const getPeriod = (plan) => billing === 'monthly' ? plan.price : plan.priceYearly
  const periodText = billing === 'monthly' ? 'month' : 'year'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Start for free, upgrade when you need more. No hidden fees.
        </p>
        <div className="inline-flex items-center gap-4 mt-8 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full transition-all ${billing === 'monthly' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full transition-all ${billing === 'yearly' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={getPeriod(plan)}
            period={periodText}
            features={plan.features}
            isPopular={plan.popular}
            ctaText={plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
            onSubscribe={() => handleSubscribe(plan.name, plan.priceId)}
            isLoading={loading === plan.name}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Compare All Features</h2>
        <ComparisonTable plans={plans} features={comparisonFeatures} />
      </div>
    </div>
  )
}
