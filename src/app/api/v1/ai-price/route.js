import { NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../lib/auth/apiAuth";
import { predictFairPrice } from "../../../../lib/ai/pricePrediction";
export const dynamic = "force-dynamic";
async function POST(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const result = await predictFairPrice({
      title: body.title || "Computer Science Textbook",
      category: body.category || "Programming",
      originalPrice: Number(body.originalPrice || body.mrp || 1e3),
      purchaseDate: body.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      condition: body.condition || "GOOD",
      edition: Number(body.edition || 1),
      isbn: body.isbn
    });
    return NextResponse.json({
      success: true,
      authType: auth.authType,
      data: result
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Pricing evaluation failed" },
      { status: 500 }
    );
  }
}
async function GET(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Operating Systems Concepts";
  const category = searchParams.get("category") || "Computer Science";
  const mrp = Number(searchParams.get("mrp") || 1200);
  const condition = searchParams.get("condition") || "VERY_GOOD";
  const edition = Number(searchParams.get("edition") || 2);
  try {
    const result = await predictFairPrice({
      title,
      category,
      originalPrice: mrp,
      condition,
      edition
    });
    return NextResponse.json({
      success: true,
      authType: auth.authType,
      data: result
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Pricing evaluation failed" },
      { status: 500 }
    );
  }
}
export {
  GET,
  POST};
