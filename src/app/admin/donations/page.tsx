import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDonationRequests } from '../../../lib/db/donations';
import { Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDonationsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const donations = await getAllDonationRequests();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Gift className="w-5.5 h-5.5 text-blue-600" />
            <span>Book Donations Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review donor submissions, manage book allocations, and track student claim status.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Donated Books: {donations.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <th className="p-4">Donation ID</th>
                <th className="p-4">Donor Name</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Target Recipient / Beneficiary</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No book donation submissions found.
                  </td>
                </tr>
              ) : (
                donations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{d.id}</td>
                    <td className="p-4 font-bold text-slate-800">{d.donorName || 'Ajitha Priya'}</td>
                    <td className="p-4 font-bold text-blue-600">{d.bookTitle || d.title || 'Engineering Textbook'}</td>
                    <td className="p-4 text-slate-600">{d.recipient || 'Underprivileged Student Foundation'}</td>
                    <td className="p-4 text-slate-500">{d.city || 'Chennai'}</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {d.status || 'AVAILABLE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
