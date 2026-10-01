import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth/session';
import { getOrCreateConversation, getConversationMessages, sendMessage, getUserConversations } from '../../../lib/db/chat';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const bookId = searchParams.get('bookId');
  const sellerId = searchParams.get('sellerId');

  if (conversationId) {
    const messages = await getConversationMessages(conversationId);
    return NextResponse.json({ messages });
  }

  if (bookId && sellerId) {
    const conv = await getOrCreateConversation(bookId, session.id, sellerId);
    const messages = await getConversationMessages(conv.id);
    return NextResponse.json({ conversation: conv, messages });
  }

  const conversations = await getUserConversations(session.id);
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { conversationId, message } = await request.json();
    if (!conversationId || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const newMessage = await sendMessage(conversationId, session.id, message);
    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
