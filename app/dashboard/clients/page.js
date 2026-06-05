'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import posthog from 'posthog-js'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
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

  const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ]

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setClients(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const clientData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      country: formData.country
    }
    
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.id)

      if (error) {
        toast.error('Error updating client')
      } else {
        posthog.capture('client_updated', { client_id: editingClient.id })
        toast.success('Client updated!')
        setShowModal(false)
        loadClients()
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert({ ...clientData, user_id: user.id })

      if (error) {
        toast.error('Error creating client')
      } else {
        posthog.capture('client_created')
        toast.success('Client added!')
        setShowModal(false)
        loadClients()
      }
    }
  }

  const deleteClient = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('Error deleting client')
      } else {
        posthog.capture('client_deleted', { client_id: id })
        toast.success('Client deleted')
        loadClients()
      }
    }
  }

  const taxRates = { 'NY': 8.875, 'CA': 8.25, 'TX': 6.25, 'FL': 6.0, 'IL': 8.25, 'WA': 9.8, 'MA': 6.25 }

  if (loading) {
    return <div className="text-center py-12">Loading clients...</div>
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          onClick={() => {
            setEditingClient(null)
            setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', country: 'US' })
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No clients yet</p>
          <button onClick={() => setShowModal(true)} className="text-blue-600 mt-2">Add your first client</button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.state || '-'}</td>
                  <td className="px-4 py-3">{taxRates[client.state] ? `${taxRates[client.state]}%` : '-'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => {
                        setEditingClient(client)
                        setFormData(client)
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" required />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded-lg" required />
              <input type="tel" placeholder="Phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Address" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="City" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full p-2 border rounded-lg" />
              
              <select value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full p-2 border rounded-lg" required>
                <option value="">Select State *</option>
                {US_STATES.map(state => (<option key={state.code} value={state.code}>{state.code} - {state.name}</option>))}
              </select>
              
              <input type="text" placeholder="Zip Code" value={formData.zip_code || ''} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Country" value={formData.country || 'US'} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full p-2 border rounded-lg" />
              
              <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-800">💡 Tax calculated automatically based on state</div>
              
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                {editingClient ? 'Update Client' : 'Create Client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
