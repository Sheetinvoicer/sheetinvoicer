'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function ClientPortalPage({ params }) {
  const [token, setToken] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  
  // Unwrap params (it's a Promise in Next.js 16)
  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params;
      setToken(unwrappedParams.token);
    }
    unwrapParams();
  }, [params]);
  
  // Fetch invoice when token is available
  useEffect(() => {
    if (!token) return;
    
    fetch(`/api/portal/invoice?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInvoice(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);
  
  const handlePayment = async () => {
    setPaying(true);
    
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        successUrl: `${window.location.origin}/dashboard/invoices/${invoice.id}`,
        cancelUrl: window.location.href
      })
    });
    
    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <p className="mt-4 text-gray-600">Please contact the business owner.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
          <p className="text-gray-600">#{invoice.invoice_number}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="font-semibold text-gray-700">Invoice Details</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-medium">{invoice.clients?.name || 'N/A'}</p>
              <p className="text-gray-600">{invoice.clients?.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-3xl font-bold text-gray-900">
                  {invoice.currency} {Number(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
            
            {invoice.status !== 'paid' ? (
              <button
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {paying ? 'Processing...' : 'Pay Now'}
              </button>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                  ✓ This invoice has been paid. Thank you!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
