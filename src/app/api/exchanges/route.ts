import { NextResponse } from 'next/server';
import { getAllExchanges } from '../../../lib/db/exchanges';

export async function GET() {
  const exchanges = await getAllExchanges();
  return NextResponse.json({ success: true, count: exchanges.length, exchanges });
}
