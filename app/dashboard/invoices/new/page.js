'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CSVUploader from '@/components/CSVUploader'
import ColumnMapper from '@/components/ColumnMapper'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
// import posthog from 'posthog-js'
import { canCreateInvoice } from '@/lib/subscription'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'

export default function NewInvoiceWizard() {
  const [step, setStep] = useState(1)
  const [csvData, setCsvData] = useState(null)
  const [columns, setColumns] = useState([])
  const [mapping, setMapping] = useState(null)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDataLoaded = (data, fields) => {
    setCsvData(data)
    setColumns(fields)
    setStep(2)
  }

  const handleMappingComplete = (mappingConfig) => {
    setMapping(mappingConfig)
    setStep(3)
  }

  const handleGenerateInvoices = async () => {
    setProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { allowed, message } = await canCreateInvoice(user.id, csvData.length)
      if (!allowed) {
        toast.error(message)
        setProcessing(false)
        return
      }
      
      for (const row of csvData) {
        const clientName = row[mapping.name]
        const clientEmail = row[mapping.email]
        const amount = parseFloat(row[mapping.amount])
        
        if (!clientName || !clientEmail || isNaN(amount)) continue
        
        let clientId = null
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', clientEmail)
          .single()
        
        if (existingClient) {
          clientId = existingClient.id
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              user_id: user.id,
              name: clientName,
              email: clientEmail
            })
            .select()
            .single()
          clientId = newClient?.id
        }
        
        if (clientId) {
          // Generate auto-incrementing invoice number for each invoice
          const invoiceNumber = await generateInvoiceNumber(user.id)
          
          await supabase
            .from('invoices')
            .insert({
              user_id: user.id,
              client_id: clientId,
              invoice_number: invoiceNumber,
              status: 'draft',
              subtotal: amount,
              total: amount
            })
        }
      }
      
      // posthog.capture('invoice_created', { invoice_count: csvData.length, method: 'csv_upload' })
      toast.success('Invoices created successfully!')
      setTimeout(() => {
        router.push('/dashboard/invoices')
      }, 1500)
    } catch (error) {
      // // posthog.captureException(error, { event: 'invoice_create_error' })
      toast.error('Error creating invoices: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoices</h1>
      <p className="text-gray-600 mb-8">Upload CSV and generate invoices in bulk</p>
      
      <div className="flex mb-8 border-b">
        <div className={`pb-3 px-4 ${step >= 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 1: Upload CSV
        </div>
        <div className={`pb-3 px-4 ${step >= 2 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 2: Map Columns
        </div>
        <div className={`pb-3 px-4 ${step >= 3 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 3: Review & Create
        </div>
      </div>
      
      <div className="max-w-2xl">
        {step === 1 && (
          <CSVUploader onDataLoaded={handleDataLoaded} />
        )}
        
        {step === 2 && csvData && (
          <ColumnMapper
            columns={columns}
            sampleData={csvData.slice(0, 3)}
            onMappingComplete={handleMappingComplete}
          />
        )}
        
        {step === 3 && mapping && csvData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-900 font-medium">{csvData.length} invoices to create</p>
              <p className="text-sm text-gray-500 mt-1">Invoice numbers will be auto-generated (e.g., INV-000001, INV-000002, etc.)</p>
            </div>
            <button
              onClick={handleGenerateInvoices}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Creating...' : `Create ${csvData.length} Invoice${csvData.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
