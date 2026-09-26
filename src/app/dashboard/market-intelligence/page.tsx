import { getSession } from '../../../lib/auth/session';
import { getMarketIntelligenceSummary } from '../../../lib/ai/marketIntelligence';
import MarketIntelligenceClient from './MarketIntelligenceClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MarketIntelligencePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const summary = await getMarketIntelligenceSummary();

  return <MarketIntelligenceClient initialSummary={summary} />;
}
