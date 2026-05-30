'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (sessionId) {
      // Update user's plan (webhook will handle this, but we can also update here)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Toaster />
      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Subscription Successful!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Thank you for upgrading. Your account has been updated.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
