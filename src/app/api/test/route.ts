import { NextResponse } from 'next/server';
import { generateMockCryptoData } from '@/lib/mock-crypto-data';

export async function GET() {
  try {
    const mockData = generateMockCryptoData(10);
    
    return NextResponse.json({
      success: true,
      message: 'Mock cryptocurrency data generated successfully',
      count: mockData.length,
      data: mockData.slice(0, 5), // Return first 5 for preview
    });
  } catch (error) {
    console.error('Error generating test data:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}