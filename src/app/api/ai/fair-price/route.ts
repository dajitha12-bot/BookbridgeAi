import { NextRequest, NextResponse } from 'next/server';
import { calculateFairPrice } from '../../../../lib/ai/fairPrice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await calculateFairPrice(body);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'AI calculation failed' }, { status: 400 });
  }
}
