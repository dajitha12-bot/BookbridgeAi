import { getSession } from '../../../lib/auth/session';
import { getUserById, getProfileByUserId } from '../../../lib/db/users';
import ProfileForm from '../../../components/ProfileForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await getUserById(session.id);
  const profile = await getProfileByUserId(session.id);

  if (!user) redirect('/login');

  const detailedUser = {
    ...user,
    profile,
  };

  return <ProfileForm initialUser={detailedUser as any} />;
}
