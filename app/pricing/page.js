'use client'

import Link from 'next/link'
import { Check, X, Sparkles, Zap, Rocket, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly')
  
  const plans = [
    {
      name: 'Free',
      price: 0,
      priceYearly: 0,
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      badge: 'Perfect for starters',
      features: [
        { name: 'Invoices per month', value: '3', included: true },
        { name: 'CSV Bulk Import', value: 'Up to 10 rows', included: true },
        { name: 'Single PDF Download', included: true },
        { name: 'Client Management', included: true },
        { name: 'Multi-PDF Download', included: false },
        { name: 'Recurring Invoices', included: false },
        { name: 'Stripe Payments', included: false },
        { name: 'Email Support', included: false },
        { name: 'Team Members', included: false },
      ]
    },
    {
      name: 'Pro',
      price: 9,
      priceYearly: 90,
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      badge: 'Most Popular',
      popular: true,
      features: [
        { name: 'Invoices per month', value: 'Unlimited', included: true },
        { name: 'CSV Bulk Import', value: 'Unlimited rows', included: true, highlight: true },
        { name: 'Single PDF Download', included: true },
        { name: 'Client Management', included: true },
        { name: 'Multi-PDF Download', included: true, highlight: true },
        { name: 'Recurring Invoices', included: true },
        { name: 'Stripe Payments', included: true },
        { name: 'Email Support', included: true },
        { name: 'Team Members', included: false },
      ]
    },
    {
      name: 'Business',
      price: 29,
      priceYearly: 290,
      icon: Rocket,
      color: 'from-purple-500 to-purple-600',
      badge: 'Best Value',
      features: [
        { name: 'Invoices per month', value: 'Unlimited', included: true },
        { name: 'CSV Bulk Import', value: 'Unlimited rows', included: true, highlight: true },
        { name: 'Single PDF Download', included: true },
        { name: 'Client Management', included: true },
        { name: 'Multi-PDF Download', included: true, highlight: true },
        { name: 'Recurring Invoices', included: true },
        { name: 'Stripe Payments', included: true },
        { name: 'Email Support', included: true },
        { name: 'Team Members', value: '5 seats', included: true },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Start for free, upgrade when you need more. No hidden fees.
        </p>
        
        <div className="inline-flex items-center gap-4 mt-8 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full transition-all ${
              billing === 'monthly' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full transition-all ${
              billing === 'yearly' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const Icon = plan.icon
            const price = billing === 'monthly' ? plan.price : plan.priceYearly
            const period = billing === 'monthly' ? '/month' : '/year'
            
            return (
              <div
                key={idx}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                  <Icon className="w-12 h-12 mb-4 opacity-90" />
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="text-sm opacity-90 mt-1">{plan.badge}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-sm opacity-80">{period}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <span className={`text-gray-700 dark:text-gray-300 ${feature.highlight ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                            {feature.name}
                          </span>
                          {feature.value && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({feature.value})
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => {
                      if (plan.name === 'Free') {
                        window.location.href = '/signup'
                      } else {
                        // Call subscription API
                        fetch('/api/stripe/create-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: plan.name === 'Pro' 
                              ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
                              : process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
                            successUrl: window.location.origin + '/dashboard'
                            cancelUrl: window.location.origin + '/pricing'
                          })
                        })
                        .then(res => res.json())
                        .then(data => {
                          if (data.url) window.location.href = data.url
                          else alert('Error: ' + data.error)
                        })
                        .catch(err => alert('Error: ' + err.message))
                      }
                    }}
                    className={`mt-8 w-full text-center py-3 rounded-xl font-semibold transition-all ${
                      plan.price === 0
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-xl'
                    }`}
                  >
                    {plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why SheetInvoicer is Different
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">CSV Bulk Import</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convert spreadsheets to invoices in 60 seconds</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Multi-PDF Download</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download all invoices as one PDF</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">Free Forever Plan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No credit card required to start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
