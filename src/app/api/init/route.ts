import { NextRequest, NextResponse } from 'next/server';
import { appInitializer } from '@/lib/app-initializer';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MONITOR_API_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Trigger initialization
    await appInitializer.initialize();
    
    return NextResponse.json({
      success: true,
      message: 'Initialization completed',
      status: appInitializer.getStatus()
    });
  } catch (error) {
    console.error('Error in init endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Initialization failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: appInitializer.getStatus(),
    message: 'Use POST method with authorization to trigger initialization'
  });
}