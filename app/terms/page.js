'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-6 max-w-4xl mx-auto w-full">
        <Link href="/" className="text-2xl font-bold text-blue-600">SheetInvoicer</Link>
      </nav>
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6 text-gray-600 dark:text-gray-400">
          <p>Last updated: June 1, 2026</p>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By using SheetInvoicer, you agree to these Terms of Service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Account Responsibility</h2>
            <p>You are responsible for your account security and all activities under it.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Contact</h2>
            <p>Questions? Email legal@sheetinvoicer.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
