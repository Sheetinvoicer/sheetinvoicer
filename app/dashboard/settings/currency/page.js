'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export default function CurrencySettingsPage() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('user_currency_settings').select('default_currency').eq('user_id', user.id).single();
      if (data) setSelectedCurrency(data.default_currency);
    }
  }

  async function saveSettings() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_currency_settings').upsert({
        user_id: user.id,
        default_currency: selectedCurrency
      });
    }
    setSaving(false);
    alert('Currency settings saved!');
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Currency Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Choose your default currency for invoices</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {currencies.map((curr) => (
            <motion.button
              key={curr.code}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCurrency(curr.code)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedCurrency === curr.code
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl font-bold">{curr.symbol}</div>
              <div className="text-sm font-medium">{curr.code}</div>
              <div className="text-xs opacity-75">{curr.name}</div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Currency Settings'}
        </button>
      </div>
    </div>
  );
}
