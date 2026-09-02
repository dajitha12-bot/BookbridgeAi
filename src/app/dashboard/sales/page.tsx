import { getSession } from '../../../lib/auth/session';
import { getUserSalesAction } from '../../../actions/orderActions';
import SalesClient from '../../../components/dashboard/SalesClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let salesList: any[] = [];
  const res = await getUserSalesAction();
  if (res.success && res.sales) {
    salesList = res.sales;
  }

  return <SalesClient initialSales={salesList} />;
}
