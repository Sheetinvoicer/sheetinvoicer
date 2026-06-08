'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ClientDetailPage() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadClient()
  }, [id])

  const loadClient = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      router.push('/dashboard/clients')
    } else {
      setClient(data)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!client) return <div className="p-6">Client not found</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/dashboard/clients" className="flex items-center gap-2 text-blue-600 mb-6">
        <ArrowLeft size={18} /> Back to Clients
      </Link>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{client.name}</h1>
        
        <div className="space-y-3">
          <div><strong>Email:</strong> {client.email}</div>
          <div><strong>Phone:</strong> {client.phone || '-'}</div>
          <div><strong>Address:</strong> {client.address || '-'}</div>
          <div><strong>City:</strong> {client.city || '-'}</div>
          <div><strong>State:</strong> {client.state || '-'}</div>
          <div><strong>Zip Code:</strong> {client.zip_code || '-'}</div>
          <div><strong>Country:</strong> {client.country || 'US'}</div>
        </div>
      </div>
    </div>
  )
}
