import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('API called');
    
    // Step 1: Try to parse the request body
    const { csvData, fieldMapping, businessInfo } = await request.json();
    console.log('Request parsed successfully');

    // Step 2: Basic validation
    if (!businessInfo || !businessInfo.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    console.log('Data validated:', {
      businessName: businessInfo.name,
      rowCount: csvData?.length || 0
    });

    // Return success for now
    return NextResponse.json({ 
      success: true, 
      message: 'Request parsing works!',
      business: businessInfo.name,
      rows: csvData?.length || 0
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'API failed: ' + error.message },
      { status: 500 }
    );
  }
}
