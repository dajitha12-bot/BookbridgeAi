import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import ChatClient from './ChatClient';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <ChatClient currentUserId={session.id} />;
}
