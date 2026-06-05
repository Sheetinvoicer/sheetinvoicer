import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { amount, country = 'US', state, zipCode, city } = await request.json()
    
    const taxCalculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: Math.round(amount * 100),
          tax_code: 'txcd_10000000',
          quantity: 1,
        },
      ],
      customer_details: {
        address: {
          country: country,
          state: state,
          postal_code: zipCode,
          city: city,
        },
        address_source: 'billing',
      },
    })
    
    const taxAmount = (taxCalculation.tax_amount_exclusive || 0) / 100
    const totalAmount = amount + taxAmount
    
    return NextResponse.json({
      success: true,
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      taxRate: taxCalculation.tax_rate_exclusive?.percentage || 0,
    })
  } catch (error) {
    console.error('Tax calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
