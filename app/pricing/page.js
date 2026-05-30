'use client'

import { useState } from 'react'
import { Check, X, Zap, Rocket, Sparkles, TrendingUp, CreditCard, Users, FileText, Download, Repeat, Mail, Shield, BarChart } from 'lucide-react'

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(null)
  const [hoveredPlan, setHoveredPlan] = useState(null)

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
        { name: 'API Access', included: false },
        { name: 'Custom Branding', included: false }
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
        { name: 'API Access', included: false },
        { name: 'Custom Branding', included: false }
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
        { name: 'Email Support', included: true, highlight: true },
        { name: 'Team Members', value: '5 seats', included: true },
        { name: 'API Access', included: true },
        { name: 'Custom Branding', included: true }
      ]
    }
  ]

  const allFeatures = [
    { name: 'Invoices per month', icon: FileText, key: 'invoices' },
    { name: 'CSV Bulk Import', icon: Upload, key: 'csv' },
    { name: 'Multi-PDF Download', icon: Download, key: 'multipdf' },
    { name: 'Recurring Invoices', icon: Repeat, key: 'recurring' },
    { name: 'Stripe Payments', icon: CreditCard, key: 'stripe' },
    { name: 'Client Management', icon: Users, key: 'clients' },
    { name: 'Email Support', icon: Mail, key: 'email' },
    { name: 'Team Members', icon: Users, key: 'team' },
    { name: 'API Access', icon: BarChart, key: 'api' },
    { name: 'Custom Branding', icon: Shield, key: 'branding' }
  ]

  const getFeatureValue = (plan, featureKey) => {
    const feature = plan.features.find(f => {
      if (featureKey === 'invoices') return f.name === 'Invoices per month'
      if (featureKey === 'csv') return f.name === 'CSV Bulk Import'
      if (featureKey === 'multipdf') return f.name === 'Multi-PDF Download'
      if (featureKey === 'recurring') return f.name === 'Recurring Invoices'
      if (featureKey === 'stripe') return f.name === 'Stripe Payments'
      if (featureKey === 'clients') return f.name === 'Client Management'
      if (featureKey === 'email') return f.name === 'Email Support'
      if (featureKey === 'team') return f.name === 'Team Members'
      if (featureKey === 'api') return f.name === 'API Access'
      if (featureKey === 'branding') return f.name === 'Custom Branding'
      return null
    })
    return feature
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Start for free, upgrade when you need more. No hidden fees.
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 mt-8 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              billing === 'monthly' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              billing === 'yearly' 
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = billing === 'monthly' ? plan.price : plan.priceYearly
            const period = billing === 'monthly' ? 'month' : 'year'
            
            return (
              <div
                key={plan.name}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : 'hover:scale-105 hover:shadow-2xl'
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
                    <span className="text-sm opacity-80">/{period}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
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
                    onClick={() => handleSubscribe(plan.name, plan.priceId)}
                    disabled={loading === plan.name}
                    className={`mt-8 w-full text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                      plan.price === 0
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-xl'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.name ? 'Processing...' : plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Compare All Features</h2>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to manage your invoicing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center p-4 text-gray-900 dark:text-white font-semibold">
                      {plan.name}
                      {plan.popular && <span className="block text-xs text-blue-500">Most Popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, idx) => {
                  const FeatureIcon = feature.icon
                  return (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FeatureIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">{feature.name}</span>
                        </div>
                      </td>
                      {plans.map((plan) => {
                        const featureData = getFeatureValue(plan, feature.key)
                        const isIncluded = featureData?.included || false
                        const value = featureData?.value
                        return (
                          <td key={plan.name} className="text-center p-4">
                            {isIncluded ? (
                              <div className="flex flex-col items-center gap-1">
                                <Check className="w-5 h-5 text-green-500" />
                                {value && <span className="text-xs text-gray-500">{value}</span>}
                              </div>
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why SheetInvoicer is Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CSV Bulk Import</h3>
              <p className="text-gray-600 dark:text-gray-400">Convert spreadsheets to invoices in 60 seconds</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Multi-PDF Download</h3>
              <p className="text-gray-600 dark:text-gray-400">Download all invoices as one PDF</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free Forever Plan</h3>
              <p className="text-gray-600 dark:text-gray-400">No credit card required to start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
