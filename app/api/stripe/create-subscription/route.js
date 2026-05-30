import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { priceId, planName, userId, userEmail, returnUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/dashboard/subscription`,
      metadata: {
        userId: userId,
        planName: planName,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
