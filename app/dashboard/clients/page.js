'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading clients...</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your client relationships</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          + Add Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">👤</div>
              <Link href={`/dashboard/clients/${client.id}`} className="text-blue-600 dark:text-blue-400 text-sm">
                Edit →
              </Link>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{client.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-1">{client.email}</p>
            {client.phone && <p className="text-gray-500 dark:text-gray-400 text-sm">{client.phone}</p>}
            {client.country && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">📍 {client.country}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
