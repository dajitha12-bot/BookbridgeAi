import { NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../lib/auth/apiAuth";
import { db } from "../../../../lib/db/sqliteDb";
export const dynamic = "force-dynamic";
async function GET(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const status = searchParams.get("status") || "AVAILABLE";
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
  let query = "SELECT * FROM books WHERE status = ?";
  const params = [status];
  if (category) {
    query += " AND category LIKE ?";
    params.push(`%${category}%`);
  }
  if (city) {
    query += " AND city LIKE ?";
    params.push(`%${city}%`);
  }
  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);
  const books = db.prepare(query).all(...params);
  return NextResponse.json({
    success: true,
    authType: auth.authType,
    client: auth.user?.name || auth.user?.email,
    count: books.length,
    data: books
  });
}
export {
  GET};
