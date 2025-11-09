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

    let result;
    const responseText = await response.text();
    
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Invalid response from server: ' + responseText);
    }
    
    if (response.ok) {
      alert('Invoices sent successfully!');
      setCurrentStep(4); // Success step
    } else {
      alert('Error sending invoices: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error sending invoices: ' + error.message);
  }
};
