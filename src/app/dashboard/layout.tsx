import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth/session';
import { getMeAction } from '../../actions/authActions';
import DashboardShell from '../../components/DashboardShell';
import { AuthProvider } from '../../components/AuthProvider';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await getMeAction();
  if (!user) {
    redirect('/login');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
  }
  if (user.role === 'DELIVERY_STAFF') {
    redirect('/staff');
  }

  return (
    <AuthProvider>
      <DashboardShell sessionUser={{ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.profile?.avatarUrl }}>
        {children}
      </DashboardShell>
    </AuthProvider>
  );
}
