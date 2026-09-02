import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllUsers } from '../../../lib/db/users';
import { Users as UsersIcon, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const users = await getAllUsers();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <UsersIcon className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform User Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit reader memberships, logins, and registered addresses.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Users: {users.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      u.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      u.role === 'DELIVERY_STAFF' ? 'bg-indigo-50 text-indigo-650' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-550">Tamil Nadu</td>
                  <td className="p-4 text-slate-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
