import { NextResponse } from 'next/server';
import { getAllWishlistItems } from '../../../lib/db/wishlist';

export async function GET() {
  const items = await getAllWishlistItems();
  return NextResponse.json({ success: true, count: items.length, items });
}
