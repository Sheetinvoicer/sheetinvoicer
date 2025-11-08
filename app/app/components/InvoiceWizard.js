'use client';
import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function InvoiceWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    address: '',
    taxId: ''
  });

  // Handle CSV file upload and parsing
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      // Simple CSV parsing
      const lines = csvText.split('\n');
      const parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setHeaders(parsedHeaders);
      setCsvData(parsedData);
      setCurrentStep(2);
    };
    reader.readAsText(file);
  }, []);

  // Handle field mapping changes
  const handleMappingChange = (csvHeader, invoiceField) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvHeader]: invoiceField
    }));
  };

  // Handle business info changes
  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate and send invoices
  const generateInvoices = async () => {
    try {
      // Prepare the data for the API
      const requestData = {
        csvData,
        fieldMapping,
        businessInfo
      };

      // Call our API route to generate and send invoices
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Invoices sent successfully!');
        setCurrentStep(4); // Success step
      } else {
        alert('Error sending invoices: ' + result.error);
      }
    } catch (error) {
      alert('Error sending invoices: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            <div className="text-sm mt-2 text-gray-600">
              {['Upload', 'Map', 'Send', 'Done'][step - 1]}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Upload CSV */}
      {currentStep === 1 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Upload Your Spreadsheet</h2>
          <p className="text-gray-600 mb-6">Export your data as CSV and upload it here</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {/* Step 2: Map Fields */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Map Your Columns</h2>
          <p className="text-gray-600 mb-6">Match your spreadsheet columns to invoice fields</p>
          
          <div className="grid gap-4 mb-6">
            {headers.map(header => (
              <div key={header} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium min-w-[150px]">{header}</span>
                <span className="text-gray-400">→</span>
                <select 
                  value={fieldMapping[header] || ''}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                >
                  <option value="">Select field...</option>
                  <option value="description">Description</option>
                  <option value="quantity">Quantity</option>
                  <option value="unitPrice">Unit Price</option>
                  <option value="amount">Amount</option>
                  <option value="clientName">Client Name</option>
                  <option value="clientEmail">Client Email</option>
                </select>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Preview Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    {headers.map(header => (
                      <th key={header} className="px-4 py-2 border-b">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      {headers.map(header => (
                        <td key={header} className="px-4 py-2 border-b">{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(3)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Continue to Business Info
          </button>
        </div>
      )}

      {/* Step 3: Business Info and Send */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Business Information</h2>
          <p className="text-gray-600 mb-6">This will appear on your invoices</p>
          
          <div className="grid gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={businessInfo.name}
                onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Company Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={businessInfo.address}
                onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your business address"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID/VAT Number
              </label>
              <input
                type="text"
                value={businessInfo.taxId}
                onChange={(e) => handleBusinessInfoChange('taxId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tax identification number"
              />
            </div>
          </div>

          <button
            onClick={generateInvoices}
            disabled={!businessInfo.name}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate & Send Invoices
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {currentStep === 4 && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Invoices Sent Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your professional invoices have been generated and sent to your clients.
          </p>
          <button
            onClick={() => {
              setCurrentStep(1);
              setCsvData([]);
              setHeaders([]);
              setFieldMapping({});
              setBusinessInfo({ name: '', address: '', taxId: '' });
            }}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create New Invoices
          </button>
        </div>
      )}
    </div>
  );
}
