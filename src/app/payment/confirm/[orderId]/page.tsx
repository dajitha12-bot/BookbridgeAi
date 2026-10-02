import { getOrderForPaymentConfirmAction } from '../../../../actions/orderActions';
import PaymentConfirmClient from './PaymentConfirmClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PaymentConfirmPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const res = await getOrderForPaymentConfirmAction(orderId);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-rose-400">Order Not Found</h2>
          <p className="text-xs text-slate-400">
            {res.error || 'The payment confirmation request link is invalid or expired.'}
          </p>
          <Link
            href="/browse"
            className="inline-block px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return <PaymentConfirmClient initialData={res.data} />;
}
