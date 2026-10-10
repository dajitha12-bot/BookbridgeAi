import { NextResponse } from "next/server";
import { getAllWishlistItems } from "../../../lib/db/wishlist";
async function GET() {
  const items = await getAllWishlistItems();
  return NextResponse.json({ success: true, count: items.length, items });
}
export {
  GET
};
