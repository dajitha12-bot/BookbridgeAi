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
  const user = await getMeAction();

  const activeUser = user || {
    id: session?.id || 'usr-user1',
    name: session?.name || 'Ajitha Priya',
    email: session?.email || 'ajitha@gmail.com',
    role: session?.role || 'USER',
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
          role: activeUser.role,
          avatarUrl: activeUser.profile?.avatarUrl,
        }}
      >
        {children}
      </DashboardShell>
    </AuthProvider>
  );
}
