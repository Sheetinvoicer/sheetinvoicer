'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import MultiInvoicePDF from '@/components/MultiInvoicePDF'
import InvoiceFilter from '@/components/InvoiceFilter'
import QuickInvoiceForm from '@/components/QuickInvoiceForm'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function InvoicesPage() {
  const { t } = useTranslation()
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [clients, setClients] = useState([])
  const supabase = createClient()

  // ... rest of your existing code ...
  // Just add {t('key')} where you need translations

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        {t('invoices.new')}
      </button>
    </div>
  )
}
