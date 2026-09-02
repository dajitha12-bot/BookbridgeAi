import { getSession } from '../../../lib/auth/session';
import { getRequestsByUser } from '../../../lib/db/bookRequests';
import RequestsClient from '../../../components/dashboard/RequestsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RequestsPage({
  searchParams
}: {
  searchParams: Promise<{ newTitle?: string }>
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { newTitle } = await searchParams;

  const requests = await getRequestsByUser(session.id);
  
  // Sort descending by timestamp
  requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <RequestsClient 
      initialRequests={requests} 
      prefilledTitle={newTitle || ''} 
    />
  );
}
