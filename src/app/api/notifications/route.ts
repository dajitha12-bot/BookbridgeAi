import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth/session';
import { getNotificationsByUser } from '../../../lib/db/notifications';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notifications = await getNotificationsByUser(session.id);
  return NextResponse.json({ success: true, count: notifications.length, notifications });
}
