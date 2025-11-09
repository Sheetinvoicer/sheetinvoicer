import { NextResponse } from 'next/server';

export async function POST(request) {
  let response;
  
  try {
    console.log('=== API START ===');
    
    // Get the request body as text first to avoid JSON parsing issues
    const bodyText = await request.text();
    console.log('Raw body length:', bodyText.length);
    
    if (!bodyText) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }
    
    // Try to parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(bodyText);
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON: ' + parseError.message }, { status: 400 });
    }
    
    const { csvData, fieldMapping, businessInfo } = parsedData;
    console.log('JSON parsed successfully');
    
    // Basic validation
    if (!businessInfo || !businessInfo.name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }
    
    console.log('Validation passed');
    
    // Success response
    response = NextResponse.json({ 
      success: true, 
      message: 'All steps completed!',
      business: businessInfo.name,
      hasData: !!csvData
    });
    
  } catch (error) {
    console.error('=== FINAL CATCH ERROR ===', error);
    response = NextResponse.json(
      { error: 'Critical failure: ' + error.message },
      { status: 500 }
    );
  }
  
  console.log('=== API END ===');
  return response;
}
