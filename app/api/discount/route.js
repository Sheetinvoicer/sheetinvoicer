import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = createClient()
    const { code, userId, subtotal } = await request.json()
    
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()
    
    if (error || !discount) {
      return NextResponse.json({ success: false, error: 'Invalid or expired discount code' }, { status: 404 })
    }
    
    const now = new Date()
    if (discount.start_date && new Date(discount.start_date) > now) {
      return NextResponse.json({ success: false, error: 'Discount code not yet active' }, { status: 400 })
    }
    if (discount.end_date && new Date(discount.end_date) < now) {
      return NextResponse.json({ success: false, error: 'Discount code has expired' }, { status: 400 })
    }
    
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return NextResponse.json({ success: false, error: 'Discount code has reached its usage limit' }, { status: 400 })
    }
    
    const { count: userUsageCount } = await supabase
      .from('discount_usage')
      .select('*', { count: 'exact', head: true })
      .eq('discount_code_id', discount.id)
      .eq('user_id', userId)
    
    if (discount.per_user_limit && userUsageCount >= discount.per_user_limit) {
      return NextResponse.json({ success: false, error: 'You have already used this discount code' }, { status: 400 })
    }
    
    if (discount.min_subtotal && subtotal < discount.min_subtotal) {
      return NextResponse.json({ success: false, error: `Minimum subtotal of $${discount.min_subtotal} required` }, { status: 400 })
    }
    
    let discountAmount = 0
    if (discount.discount_type === 'percentage') {
      discountAmount = (subtotal * discount.discount_value) / 100
      if (discount.max_discount) {
        discountAmount = Math.min(discountAmount, discount.max_discount)
      }
    } else {
      discountAmount = Math.min(discount.discount_value, subtotal)
    }
    
    const finalTotal = subtotal - discountAmount
    
    return NextResponse.json({
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.discount_type,
        value: discount.discount_value,
        amount: discountAmount.toFixed(2),
        description: discount.description,
      },
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      total: finalTotal.toFixed(2),
    })
  } catch (error) {
    console.error('Discount error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
