'use client';
import { useState } from 'react';
import InvoiceWizard from './components/InvoiceWizard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SheetInvoicer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your spreadsheet into professional invoices in one click. 
            No more manual data entry. Just upload, map, and send.
          </p>
        </div>

        {/* Main Component */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <InvoiceWizard />
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-2xl mb-3">📤</div>
            <h3 className="font-semibold text-lg mb-2">Upload CSV</h3>
            <p className="text-gray-600">Simply upload your spreadsheet export</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-green-600 text-2xl mb-3">✏️</div>
            <h3 className="font-semibold text-lg mb-2">Map Fields</h3>
            <p className="text-gray-600">Connect your columns to invoice fields</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-purple-600 text-2xl mb-3">✉️</div>
            <h3 className="font-semibold text-lg mb-2">Send & Relax</h3>
            <p className="text-gray-600">Professional PDFs delivered automatically</p>
          </div>
        </div>
      </div>
    </main>
  );
}
