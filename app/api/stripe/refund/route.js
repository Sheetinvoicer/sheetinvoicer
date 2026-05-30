import { NextResponse } from 'next/server'

export async function POST(request) {
  return NextResponse.json({ 
    success: false, 
    error: 'Refund endpoint - configure STRIPE_SECRET_KEY and use Stripe SDK' 
  })
}
