'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function ReminderSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    days_before_due: 3,
    days_after_due: [1, 3, 7, 14],
    reminder_time: '09:00:00',
    auto_mark_overdue: true,
    overdue_days: 30,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const response = await fetch(`/api/reminders?userId=${user.id}`)
      const { data } = await response.json()
      if (data) setSettings(data)
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, user_id: user.id }),
    })
    
    if (response.ok) {
      toast.success('Reminder settings saved!')
    } else {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Reminder Settings</h1>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold">Enable Auto Reminders</h3>
            <p className="text-sm text-gray-500">Send automatic payment reminders to clients</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`px-4 py-2 rounded-lg ${settings.enabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}
          >
            {settings.enabled ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block font-semibold mb-2">Days Before Due to Remind</label>
          <input
            type="number"
            value={settings.days_before_due}
            onChange={(e) => setSettings({ ...settings, days_before_due: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-lg"
            min="1"
            max="30"
          />
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block font-semibold mb-2">Days After Due to Remind</label>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 7, 14, 30].map(day => (
              <button
                key={day}
                onClick={() => {
                  const newDays = settings.days_after_due.includes(day)
                    ? settings.days_after_due.filter(d => d !== day)
                    : [...settings.days_after_due, day].sort((a,b) => a-b)
                  setSettings({ ...settings, days_after_due: newDays })
                }}
                className={`px-3 py-1 rounded-full text-sm ${settings.days_after_due.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {day} day{day > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
