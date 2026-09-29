import { getSession } from '../../../../lib/auth/session';
import { redirect } from 'next/navigation';
import IntegrationsClient from './IntegrationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminIntegrationsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return <IntegrationsClient />;
}
