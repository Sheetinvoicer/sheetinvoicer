import { NextResponse } from 'next/server'
import Stripe from 'stripe'
// import { getPostHogClient } from '@/lib/posthog-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.client_reference_id
      const planTier = session.metadata?.planTier
      const priceId = session.metadata?.priceId

      // const posthog = getPostHogClient()
      // posthog.capture({
      //   distinctId: userId,
      //   event: 'subscription_checkout_completed',
      //   properties: { plan_tier: planTier, price_id: priceId },
      // })
      // await posthog.shutdown()

      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const userId = subscription.metadata?.userId

      // const posthog = getPostHogClient()
      // posthog.capture({
      //   distinctId: userId,
      //   event: 'subscription_updated',
      //   properties: { status: subscription.status },
      // })
      // await posthog.shutdown()

      break
    }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
