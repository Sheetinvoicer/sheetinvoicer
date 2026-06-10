import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Mock implementation - replace with actual password reset logic
    console.log(`Password reset requested for: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
