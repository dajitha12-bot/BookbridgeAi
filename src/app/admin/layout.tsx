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
  const user = await getMeAction();

  const activeUser = user || {
    id: session?.id || 'usr-admin',
    name: session?.name || 'Platform Admin',
    email: session?.email || 'admin@bookbridge.com',
    role: 'ADMIN',
    profile: {
      avatarUrl: null,
    },
  };

  return (
    <AuthProvider>
      <DashboardShell
        sessionUser={{
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          role: 'ADMIN',
          avatarUrl: activeUser.profile?.avatarUrl,
        }}
      >
        {children}
      </DashboardShell>
    </AuthProvider>
  );
}
