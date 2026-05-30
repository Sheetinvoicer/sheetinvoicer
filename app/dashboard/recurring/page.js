'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function RecurringPage() {
  const [recurring, setRecurring] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    client_id: '',
    frequency: 'monthly',
    amount: '',
    description: '',
    next_send_date: ''
  })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Load recurring invoices
      const { data: recurringData } = await supabase
        .from('recurring_invoices')
        .select('*, clients(name, email)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setRecurring(recurringData || [])
      
      // Load clients for dropdown
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
      
      setClients(clientsData || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const templateData = {
      amount: parseFloat(formData.amount),
      description: formData.description
    }
    
    if (editingItem) {
      // Update existing
      const { error } = await supabase
        .from('recurring_invoices')
        .update({
          client_id: formData.client_id,
          frequency: formData.frequency,
          template_data: templateData,
          next_send_date: formData.next_send_date
        })
        .eq('id', editingItem.id)
      
      if (error) {
        toast.error('Error updating recurring invoice')
      } else {
        toast.success('Recurring invoice updated!')
        setShowModal(false)
        loadData()
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('recurring_invoices')
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          frequency: formData.frequency,
          template_data: templateData,
          next_send_date: formData.next_send_date,
          is_active: true
        })
      
      if (error) {
        toast.error('Error creating recurring invoice')
      } else {
        toast.success('Recurring invoice created!')
        setShowModal(false)
        loadData()
      }
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('recurring_invoices')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    
    if (error) {
      toast.error('Error updating status')
    } else {
      toast.success(currentStatus ? 'Paused' : 'Activated')
      loadData()
    }
  }

  const deleteRecurring = async (id) => {
    if (confirm('Are you sure you want to delete this recurring invoice?')) {
      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('Error deleting')
      } else {
        toast.success('Deleted')
        loadData()
      }
    }
  }

  const openAddModal = () => {
    setEditingItem(null)
    const today = new Date()
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1))
    setFormData({
      client_id: '',
      frequency: 'monthly',
      amount: '',
      description: '',
      next_send_date: nextMonth.toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      client_id: item.client_id,
      frequency: item.frequency,
      amount: item.template_data?.amount || '',
      description: item.template_data?.description || '',
      next_send_date: item.next_send_date?.split('T')[0] || ''
    })
    setShowModal(true)
  }

  const getFrequencyLabel = (freq) => {
    switch(freq) {
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      default: return freq
    }
  }

  return (
    <div>
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Invoices</h1>
          <p className="text-gray-600">Automatically send invoices on a schedule</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Recurring
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : recurring.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <span className="text-6xl mb-4 block">🔄</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring invoices</h3>
          <p className="text-gray-500 mb-4">Create automated invoices for regular clients</p>
          <button
            onClick={openAddModal}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Recurring Invoice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recurring.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.clients?.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Paused'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getFrequencyLabel(item.frequency)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Client: {item.clients?.email}
                  </p>
                  <p className="text-gray-900 font-medium">
                    Amount: ${item.template_data?.amount}
                  </p>
                  {item.template_data?.description && (
                    <p className="text-gray-500 text-sm mt-1">
                      {item.template_data.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Next send: {new Date(item.next_send_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleStatus(item.id, item.is_active)}
                    className={`px-3 py-1 rounded text-sm ${
                      item.is_active 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {item.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRecurring(item.id)}
                    className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Recurring Invoice */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Recurring Invoice' : 'Create Recurring Invoice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="Monthly retainer, Subscription fee, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Send Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.next_send_date}
                  onChange={(e) => setFormData({ ...formData, next_send_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                  required
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
                  {editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}