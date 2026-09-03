import { NextResponse } from 'next/server';
import { getAllReviews } from '../../../lib/db/reviews';

export async function GET() {
  const reviews = await getAllReviews();
  return NextResponse.json({ success: true, count: reviews.length, reviews });
}
