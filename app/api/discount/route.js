import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json()
    
    // Simple hardcoded discounts
    const discounts = {
      'WELCOME10': { type: 'percentage', value: 10 },
      'SAVE20': { type: 'fixed', value: 20 },
      'LAUNCH25': { type: 'percentage', value: 25 }
    }
    
    const discount = discounts[code.toUpperCase()]
    
    if (!discount) {
      return NextResponse.json({ success: false, error: 'Invalid discount code' })
    }
    
    let discountAmount = 0
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100
    } else {
      discountAmount = Math.min(discount.value, subtotal)
    }
    
    return NextResponse.json({
      success: true,
      discountAmount: discountAmount.toFixed(2),
      total: (subtotal - discountAmount).toFixed(2)
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
