import { getSession } from "../../../lib/auth/session";
import { getMarketIntelligenceSummary } from "../../../lib/ai/marketIntelligence";
import MarketIntelligenceClient from "./MarketIntelligenceClient";
import { redirect } from "next/navigation";
const dynamic = "force-dynamic";
async function MarketIntelligencePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const summary = await getMarketIntelligenceSummary();
  return <MarketIntelligenceClient initialSummary={summary} />;
}
export {
  MarketIntelligencePage as default,
  dynamic
};
