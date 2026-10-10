import { NextResponse } from "next/server";
import { getAllRentals } from "../../../lib/db/rentals";
async function GET() {
  const rentals = await getAllRentals();
  return NextResponse.json({ success: true, count: rentals.length, rentals });
}
export {
  GET
};
