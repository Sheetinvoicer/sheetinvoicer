import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata.userId
    const customerId = session.customer
    const subscriptionId = session.subscription

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    let planTier = 'free'
    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
      planTier = 'basic'
    }

    const supabase = createClient()

    await supabase
      .from('users')
      .update({
        plan_tier: planTier,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', userId)

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
      event: 'subscription_checkout_completed',
      properties: { plan_tier: planTier, price_id: priceId },
    })
    await posthog.shutdown()
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    await supabase
      .from('users')
      .update({
        plan_tier: 'free',
        stripe_subscription_id: null,
        subscription_status: 'canceled'
      })
      .eq('stripe_subscription_id', subscription.id)

    if (userData?.id) {
      const posthog = getPostHogClient()
      posthog.capture({
        distinctId: userData.id,
        event: 'subscription_canceled',
      })
      await posthog.shutdown()
    }
  }

  return Response.json({ received: true })
}