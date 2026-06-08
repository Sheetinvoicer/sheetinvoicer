'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    city: '', 
    state: '', 
    zip_code: '', 
    country: 'US' 
  })
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      console.log('Loaded clients:', data?.length)
      setClients(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Not logged in')
      return
    }
    
    const clientData = {
      user_id: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      zip_code: formData.zip_code || null,
      country: formData.country || 'US'
    }
    
    console.log('Inserting client:', clientData)
    
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      toast.error('Error: ' + error.message)
    } else {
      toast.success('Client added!')
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', country: 'US' })
      loadClients()
    }
  }

  if (loading) return <div className="p-6">Loading clients...</div>

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add Client</button>
      </div>
      
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">No clients yet</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Country</th><th className="px-4 py-3 text-left">State</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.phone || '-'}</td>
                  <td className="px-4 py-3">{client.country || 'US'}</td>
                  <td className="px-4 py-3">{client.state || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-red-600" onClick={async () => {
                      if (confirm('Delete this client?')) {
                        await supabase.from('clients').delete().eq('id', client.id)
                        toast.success('Deleted')
                        loadClients()
                      }
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Client</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" required />
              <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Zip Code" value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Save Client</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full bg-gray-300 py-2 rounded">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
