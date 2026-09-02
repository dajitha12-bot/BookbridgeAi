import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllBooks } from '../../../lib/db/books';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBooksPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <BookOpen className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Book Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit active book listings, resale values, and trade availabilities.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Books: {books.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Resale Expected</th>
                <th className="p-4">Condition</th>
                <th className="p-4">City</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 truncate max-w-[180px]">{b.title}</td>
                  <td className="p-4 truncate max-w-[120px]">{b.author}</td>
                  <td className="p-4">{b.category}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {b.donationAvailable ? (
                      <span className="text-indigo-600">FREE</span>
                    ) : (
                      `₹${b.expectedPrice}`
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-slate-100 text-slate-600 uppercase">
                      {b.condition.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{b.city}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                      b.status === 'RESERVED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
