'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CSVUploader from '@/components/CSVUploader'
import ColumnMapper from '@/components/ColumnMapper'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { canCreateInvoice } from '@/lib/subscription'
import { generateInvoiceNumber } from '@/lib/invoiceNumber'

// Quick Single Invoice Component
function QuickInvoiceForm() {
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [clients, setClients] = useState([])
  const [showNewClient, setShowNewClient] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name, email')
      .order('name')
    setClients(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login first')
        setLoading(false)
        return
      }

      let finalClientId = clientId

      // Create new client if needed
      if (showNewClient || !clientId) {
        if (!clientName || !clientEmail) {
          toast.error('Please enter client name and email')
          setLoading(false)
          return
        }

        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ user_id: user.id, name: clientName, email: clientEmail })
          .select()
          .single()

        if (clientError) {
          toast.error('Error creating client')
          setLoading(false)
          return
        }
        finalClientId = newClient.id
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(user.id)

      // Create invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: finalClientId,
          invoice_number: invoiceNumber,
          description: description,
          total: parseFloat(amount),
          subtotal: parseFloat(amount),
          due_date: dueDate,
          status: 'draft'
        })
        .select()
        .single()

      if (error) {
        toast.error('Error creating invoice')
      } else {
        toast.success('Invoice created successfully!')
        router.push(`/dashboard/invoices/${invoice.id}`)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Invoice</h2>
      <p className="text-gray-500 text-sm mb-4">Create a single invoice in seconds</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Client *</label>
          
          {!showNewClient ? (
            <div className="flex gap-2">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Select existing client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowNewClient(true)
                  setClientId('')
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                New Client
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name *"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Client Email *"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewClient(false)
                  setClientName('')
                  setClientEmail('')
                }}
                className="text-sm text-blue-600"
              >
                ← Select existing client
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Web Design Services"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  )
}

// Main CSV Bulk Upload Wizard
function CSVWizard() {
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
      
      let createdCount = 0
      
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
            .insert({ user_id: user.id, name: clientName, email: clientEmail })
            .select()
            .single()
          clientId = newClient?.id
        }
        
        if (clientId) {
          const invoiceNumber = await generateInvoiceNumber(user.id)
          
          const { error } = await supabase
            .from('invoices')
            .insert({
              user_id: user.id,
              client_id: clientId,
              invoice_number: invoiceNumber,
              status: 'draft',
              subtotal: amount,
              total: amount
            })
          
          if (!error) createdCount++
        }
      }
      
      toast.success(`${createdCount} invoices created successfully!`)
      setTimeout(() => {
        router.push('/dashboard/invoices')
      }, 1500)
    } catch (error) {
      toast.error('Error creating invoices: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Invoices (CSV)</h2>
      <p className="text-gray-500 text-sm mb-4">Upload CSV to create multiple invoices at once</p>
      
      <div className="flex mb-6 border-b">
        <div className={`pb-2 px-3 ${step >= 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 1: Upload CSV
        </div>
        <div className={`pb-2 px-3 ${step >= 2 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 2: Map Columns
        </div>
        <div className={`pb-2 px-3 ${step >= 3 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}>
          Step 3: Review & Create
        </div>
      </div>
      
      {step === 1 && <CSVUploader onDataLoaded={handleDataLoaded} />}
      {step === 2 && csvData && (
        <ColumnMapper columns={columns} sampleData={csvData.slice(0, 3)} onMappingComplete={handleMappingComplete} />
      )}
      {step === 3 && mapping && csvData && (
        <div>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-900 font-medium">{csvData.length} invoices to create</p>
          </div>
          <button
            onClick={handleGenerateInvoices}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Creating...' : `Create ${csvData.length} Invoice${csvData.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Invoice</h1>
      <p className="text-gray-500 mb-6">Choose how to create your invoice</p>
      
      <QuickInvoiceForm />
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">OR</span>
        </div>
      </div>
      
      <CSVWizard />
    </div>
  )
}
