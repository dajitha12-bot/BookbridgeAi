import { NextResponse } from 'next/server';
import { getAllOrders } from '../../../lib/db/orders';

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json({ success: true, count: orders.length, orders });
}
