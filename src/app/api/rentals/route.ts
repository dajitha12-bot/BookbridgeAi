import { NextResponse } from 'next/server';
import { getAllRentals } from '../../../lib/db/rentals';

export async function GET() {
  const rentals = await getAllRentals();
  return NextResponse.json({ success: true, count: rentals.length, rentals });
}
