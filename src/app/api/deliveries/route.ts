import { NextResponse } from 'next/server';
import { getAllDeliveries } from '../../../lib/db/deliveries';

export const dynamic = 'force-dynamic';

export async function GET() {
  const deliveries = await getAllDeliveries();
  return NextResponse.json({ success: true, count: deliveries.length, deliveries });
}
