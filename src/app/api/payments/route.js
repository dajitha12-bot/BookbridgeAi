import { NextResponse } from "next/server";
import { getAllPayments } from "../../../lib/db/payments";
async function GET() {
  const payments = await getAllPayments();
  return NextResponse.json({ success: true, count: payments.length, payments });
}
export {
  GET
};
