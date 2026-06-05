import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { amount, country, state } = await request.json()
    
    // Tax rates by state
    const taxRates = {
      'NY': 8.875,
      'CA': 8.25,
      'TX': 6.25,
      'FL': 6.0,
      'IL': 8.25,
      'WA': 9.8,
      'MA': 6.25,
      'PA': 6.0,
      'OH': 5.75,
      'GA': 4.0,
      'NC': 4.75,
      'MI': 6.0,
      'VA': 5.3,
      'CO': 2.9,
      'AZ': 5.6,
      'MD': 6.0,
      'TN': 7.0,
      'IN': 7.0,
      'MO': 4.225,
    }
    
    // Default rate if no state (or use 0 for no tax)
    const rate = taxRates[state] || 0
    const taxAmount = (amount * rate) / 100
    const totalAmount = amount + taxAmount
    
    return NextResponse.json({
      success: true,
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      taxRate: rate,
    })
  } catch (error) {
    console.error('Tax calculation error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
