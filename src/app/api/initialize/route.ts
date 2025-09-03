import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Only initialize in development mode and if environment variables are present
    if (process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      
      // Dynamic import to avoid build-time issues
      const { appInitializer } = await import('@/lib/app-initializer');
      await appInitializer.initialize();
      
      return NextResponse.json({ success: true, message: 'App initialized' });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Initialization skipped (production mode or missing env vars)' 
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}