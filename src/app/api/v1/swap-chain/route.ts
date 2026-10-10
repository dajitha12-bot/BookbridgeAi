import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '../../../../lib/auth/apiAuth';
import { findSwapChains } from '../../../../lib/utils/swapChainAlgorithm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/swap-chain
 * Executes Tarjan's / DFS cycle detection to discover multi-party circular book exchange rings.
 * Secured via x-api-key or Authorization: Bearer <jwt>
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Unauthorized' },
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
      chains: swapChains,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Swap chain cycle discovery failed' },
      { status: 500 }
    );
  }
}
