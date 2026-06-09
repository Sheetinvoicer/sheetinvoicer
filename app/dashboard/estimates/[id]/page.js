'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// All 10 currencies with symbols
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' }
};

export default function EstimateDetailPage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const router = useRouter();
  const [estimateId, setEstimateId] = useState(null);

  useEffect(() => {
    async function unwrapParams() {
      const unwrapped = await params;
      setEstimateId(unwrapped.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!estimateId) return;
    
    fetch(`/api/estimates/${estimateId}`)
      .then(res => res.json())
      .then(data => {
        setEstimate(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading estimate:', err);
        setLoading(false);
      });
  }, [estimateId]);

  async function convertToInvoice() {
    setConverting(true);
    try {
      const response = await fetch(`/api/estimates/${estimateId}/convert`, {
        method: 'POST'
      });
      const { invoice } = await response.json();
      router.push(`/dashboard/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error converting:', error);
      setConverting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading estimate...</div>;
  }

  if (!estimate) {
    return <div className="p-8 text-center">Estimate not found</div>;
  }

  // Get currency symbol
  const currencyInfo = CURRENCIES[estimate.currency] || { symbol: estimate.currency, name: '' };
  const formattedAmount = `${currencyInfo.symbol} ${Number(estimate.total || 0).toFixed(2)}`;
  const statusText = estimate.status || 'draft';
  const statusUpper = statusText.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Estimate {estimate.estimate_number}</h1>
          <p className="text-gray-600">
            Created on {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
        <div className="flex gap-3">
          {estimate.status !== 'converted' && (
            <button
              onClick={convertToInvoice}
              disabled={converting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {converting ? 'Converting...' : 'Convert to Invoice →'}
            </button>
          )}
          <Link href="/dashboard/estimates" className="bg-gray-600 text-white px-4 py-2 rounded-lg">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="font-semibold">Client</h2>
          <p>{estimate.clients?.name || 'N/A'}</p>
          <p className="text-gray-600">{estimate.clients?.email || 'N/A'}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold">Status</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            estimate.status === 'converted' ? 'bg-green-100 text-green-800' :
            estimate.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {statusUpper}
          </span>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold">Amount</h2>
          <p className="text-3xl font-bold">{formattedAmount}</p>
          <p className="text-sm text-gray-500">{currencyInfo.name}</p>
        </div>

        {estimate.notes && (
          <div className="mb-4">
            <h2 className="font-semibold">Notes</h2>
            <p className="text-gray-600">{estimate.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
