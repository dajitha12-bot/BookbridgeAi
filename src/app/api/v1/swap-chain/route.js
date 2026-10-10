import { NextResponse } from "next/server";
import { authenticateApiRequest } from "../../../../lib/auth/apiAuth";
import { findSwapChains } from "../../../../lib/utils/swapChainAlgorithm";
export const dynamic = "force-dynamic";
async function GET(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const swapChains = await findSwapChains();
    return NextResponse.json({
      success: true,
      authType: auth.authType,
      algorithm: "Tarjan's Directed Graph Strongly Connected Cycle Detection (Barter Rings)",
      cycleCount: swapChains.length,
      chains: swapChains
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Swap chain cycle discovery failed" },
      { status: 500 }
    );
  }
}
export {
  GET};
