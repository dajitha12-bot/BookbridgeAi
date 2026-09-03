import { getSession } from '../../lib/auth/session';
import { getMeAction } from '../../actions/authActions';
import DashboardShell from '../../components/DashboardShell';
import { AuthProvider } from '../../components/AuthProvider';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = await getMeAction();

  const activeUser = user || {
    id: session?.id || 'usr-staff1',
    name: session?.name || 'Dhinesh Kumar',
    email: session?.email || 'dhinesh@delivery.com',
    role: 'DELIVERY_STAFF',
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
          role: 'DELIVERY_STAFF',
          avatarUrl: activeUser.profile?.avatarUrl,
        }}
      >
        {children}
      </DashboardShell>
    </AuthProvider>
  );
}
