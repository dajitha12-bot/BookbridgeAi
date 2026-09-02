import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth/session';
import { getMeAction } from '../../actions/authActions';
import DashboardShell from '../../components/DashboardShell';
import { AuthProvider } from '../../components/AuthProvider';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?role=admin');
  }

  const user = await getMeAction();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?role=admin');
  }

  return (
    <AuthProvider>
      <DashboardShell sessionUser={{ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.profile?.avatarUrl }}>
        {children}
      </DashboardShell>
    </AuthProvider>
  );
}
