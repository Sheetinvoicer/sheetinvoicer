'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'Office Supplies', 'Software', 'Marketing', 'Travel', 'Meals',
  'Rent', 'Utilities', 'Legal', 'Accounting', 'Other'
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_deductible: true,
  })
  const supabase = createClient()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const response = await fetch(`/api/expenses?userId=${user.id}`)
      const { data } = await response.json()
      setExpenses(data || [])
      const total = (data || []).reduce((sum, e) => sum + e.amount, 0)
      setTotalExpenses(total)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      user_id: user.id,
    }
    
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    })
    
    if (response.ok) {
      toast.success(editingExpense ? 'Expense updated!' : 'Expense added!')
      setShowModal(false)
      loadExpenses()
    }
  }

  const deleteExpense = async (id) => {
    if (confirm('Delete this expense?')) {
      await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      toast.success('Expense deleted')
      loadExpenses()
    }
  }

  if (loading) return <div className="p-6">Loading expenses...</div>

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-gray-500">Total: <span className="font-bold text-lg">${totalExpenses.toFixed(2)}</span></p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], is_deductible: true }); setShowModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No expenses yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t">
                  <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{expense.category}</td>
                  <td className="px-4 py-3">{expense.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button onClick={() => deleteExpense(expense.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr><td colSpan="3" className="px-4 py-3 text-right">Total:</td><td className="px-4 py-3 text-right">${totalExpenses.toFixed(2)}</td><td></td></tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Add Expense</h2><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg" required>
                <option value="">Select Category</option>{EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border rounded-lg" required />
              <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_deductible} onChange={(e) => setFormData({...formData, is_deductible: e.target.checked})} /> Tax Deductible</label>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Add Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
