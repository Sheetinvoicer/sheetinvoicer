'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-6 max-w-4xl mx-auto w-full">
        <Link href="/" className="text-2xl font-bold text-blue-600">SheetInvoicer</Link>
      </nav>
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-gray-600 dark:text-gray-400">
          <p>Last updated: June 1, 2026</p>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Collection</h2>
            <p>We collect account and business information to provide our invoicing service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Security</h2>
            <p>Your data is encrypted and stored securely.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact</h2>
            <p>Questions? Email privacy@sheetinvoicer.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
