import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const emailService = new EmailService();
    
    // Send test email
    const success = await emailService.sendTestEmail(user.email || '');

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${user.email}`,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send test email'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to send test email',
    note: 'Requires authentication'
  });
}