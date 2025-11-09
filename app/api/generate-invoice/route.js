import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('API called');
    
    // Just return a simple success message
    return NextResponse.json({ 
      success: true, 
      message: 'API is working!',
      test: 'This is a test response'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'API failed: ' + error.message },
      { status: 500 }
    );
  }
}
