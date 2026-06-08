'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, Download, Edit, Trash2, X } from 'lucide-react'

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

const COUNTRIES = [
  { code: 'US', name: 'United States', hasStates: true },
  { code: 'GB', name: 'United Kingdom', hasStates: false },
  { code: 'CA', name: 'Canada', hasStates: true },
  { code: 'AU', name: 'Australia', hasStates: false },
  { code: 'DE', name: 'Germany', hasStates: false },
  { code: 'FR', name: 'France', hasStates: false },
  { code: 'ES', name: 'Spain', hasStates: false },
  { code: 'IT', name: 'Italy', hasStates: false },
  { code: 'NL', name: 'Netherlands', hasStates: false },
  { code: 'AE', name: 'UAE', hasStates: false },
  { code: 'SG', name: 'Singapore', hasStates: false },
  { code: 'JP', name: 'Japan', hasStates: false },
  { code: 'CN', name: 'China', hasStates: false },
  { code: 'IN', name: 'India', hasStates: false },
  { code: 'BR', name: 'Brazil', hasStates: false },
  { code: 'MX', name: 'Mexico', hasStates: false },
]

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setClients(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const clientData = { ...formData, country: selectedCountry }
    
    if (editingClient) {
      await supabase.from('clients').update(clientData).eq('id', editingClient.id)
      toast.success('Client updated!')
    } else {
      await supabase.from('clients').insert({ ...clientData, user_id: user.id })
      toast.success('Client added!')
    }
    setShowModal(false)
    loadClients()
  }

  const deleteClient = async (id) => {
    if (confirm('Delete this client?')) {
      await supabase.from('clients').delete().eq('id', id)
      toast.success('Client deleted')
      loadClients()
    }
  }

  const exportCSV = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const response = await fetch(`/api/export?userId=${user.id}&type=clients`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getCountryName = (code) => {
    const country = COUNTRIES.find(c => c.code === code)
    return country?.name || code
  }

  if (loading) return <div className="p-6">Loading clients...</div>

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Download size={18} /> Export CSV</button>
          <button onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US' }); setSelectedCountry('US'); setShowModal(true) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Client</button>
        </div>
      </div>

      {clients.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-lg">No clients yet</div> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Country</th><th className="px-4 py-3 text-left">State</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{getCountryName(client.country)}</td>
                  <td className="px-4 py-3">{client.state || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => { setEditingClient(client); setFormData(client); setSelectedCountry(client.country || 'US'); setShowModal(true) }} className="text-blue-600"><Edit size={18} /></button>
                    <button onClick={() => deleteClient(client.id)} className="text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">{editingClient ? 'Edit Client' : 'Add Client'}</h2><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <input type="text" placeholder="Phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg" />
              
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full p-2 border rounded-lg">
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              
              {selectedCountry === 'US' && (
                <select value={formData.state || ''} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Select State</option>
                  {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                </select>
              )}
              
              <input type="text" placeholder="Address" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="City" value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Zip Code" value={formData.zip || ''} onChange={(e) => setFormData({...formData, zip: e.target.value})} className="w-full p-2 border rounded-lg" />
              
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">{editingClient ? 'Update' : 'Add'} Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
