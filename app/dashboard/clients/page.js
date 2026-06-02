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
    address: ''
  })
  const supabase = createClient()

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
    
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
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
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })

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

  const openEditModal = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || ''
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingClient(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
    setShowModal(true)
  }

  return (
    <div>
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Manage your clients and customers</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Client
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <span className="text-6xl mb-4 block">👥</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-4">Add your first client to start creating invoices</p>
          <button
            onClick={openAddModal}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-gray-700 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Phone</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Address</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{client.name}</td>
                    <td className="p-4 text-gray-600">{client.email}</td>
                    <td className="p-4 text-gray-600">{client.phone || '-'}</td>
                    <td className="p-4 text-gray-600">{client.address || '-'}</td>
                    <td className="p-4 space-x-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}