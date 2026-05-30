import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { asyncHandler, ValidationError } from '@/lib/errors'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const POST = asyncHandler(async (request) => {
  const body = await request.json()
  const { invoiceId, invoiceNumber, amount, clientName, clientEmail, returnUrl } = body

  if (!invoiceId || !invoiceNumber || !amount || !clientName || !clientEmail) {
    throw new ValidationError('Missing required fields')
  }

  if (amount <= 0 || amount > 10000000) {
    throw new ValidationError('Invalid amount')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice ${invoiceNumber}`,
            description: `Payment for invoice #${invoiceNumber} from ${clientName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    client_reference_id: invoiceId,
    customer_email: clientEmail,
    metadata: { invoiceId, invoiceNumber },
  })

  return NextResponse.json({ url: session.url })
})
