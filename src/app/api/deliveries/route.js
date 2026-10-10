import { NextResponse } from "next/server";
import { getAllDeliveries } from "../../../lib/db/deliveries";
const dynamic = "force-dynamic";
async function GET() {
  const deliveries = await getAllDeliveries();
  return NextResponse.json({ success: true, count: deliveries.length, deliveries });
}
export {
  GET,
  dynamic
};
