import { NextResponse } from "next/server";
import { calculateFairPrice } from "../../../../lib/ai/fairPrice";
async function POST(req) {
  try {
    const body = await req.json();
    const result = await calculateFairPrice(body);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || "AI calculation failed" }, { status: 400 });
  }
}
export {
  POST
};
