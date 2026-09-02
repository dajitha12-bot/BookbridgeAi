import { getSession } from '../../../lib/auth/session';
import { getAllUsers } from '../../../lib/db/users';
import { getAllBooks } from '../../../lib/db/books';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllExchanges } from '../../../lib/db/exchanges';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ dateFilter?: string }>
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login?role=admin');

  const { dateFilter = 'ALL_TIME' } = await searchParams;

  // 1. Fetch collections
  const users = await getAllUsers();
  const books = await getAllBooks();
  const orders = await getAllOrders();
  const exchanges = await getAllExchanges();
  const deliveries = await getAllDeliveries();

  // 2. Filter by date bounds
  let filterDateLimit: Date | null = null;
  if (dateFilter === 'TODAY') {
    filterDateLimit = new Date();
    filterDateLimit.setHours(0, 0, 0, 0);
  } else if (dateFilter === 'WEEK') {
    filterDateLimit = new Date();
    filterDateLimit.setDate(filterDateLimit.getDate() - 7);
  } else if (dateFilter === 'MONTH') {
    filterDateLimit = new Date();
    filterDateLimit.setMonth(filterDateLimit.getMonth() - 1);
  }

  function filterByDate(createdAtStr: string) {
    if (!filterDateLimit) return true;
    return new Date(createdAtStr) >= filterDateLimit;
  }

  const usersFiltered = users.filter(u => filterByDate(u.createdAt));
  const booksFiltered = books.filter(b => filterByDate(b.createdAt));
  const ordersFiltered = orders.filter(o => filterByDate(o.createdAt));
  const exchangesFiltered = exchanges.filter(e => filterByDate(e.createdAt));
  const deliveriesFiltered = deliveries.filter(d => filterByDate(d.updatedAt)); // Using updatedAt for deliveries

  const usersCount = usersFiltered.length;
  const booksCount = booksFiltered.length;
  const ordersCount = ordersFiltered.length;
  const exchangesCount = exchangesFiltered.length;

  // 3. Category grouping counts
  const categoryMap = new Map<string, number>();
  booksFiltered.forEach((b) => {
    categoryMap.set(b.category, (categoryMap.get(b.category) || 0) + 1);
  });
  const booksGrouped = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));
  booksGrouped.sort((a, b) => b.count - a.count);

  // 4. Order status grouping counts
  const statusMap = new Map<string, number>();
  ordersFiltered.forEach((o) => {
    statusMap.set(o.orderStatus, (statusMap.get(o.orderStatus) || 0) + 1);
  });
  const ordersGrouped = Array.from(statusMap.entries()).map(([orderStatus, count]) => ({
    orderStatus,
    count,
  }));
  ordersGrouped.sort((a, b) => b.count - a.count);

  // 5. Earnings calculation
  const paidOrders = ordersFiltered.filter(o => o.paymentStatus === 'PAID');
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <BarChart3 className="w-5.5 h-5.5 text-sky-500" />
            <span>Platform Reports & Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit platform growth, exchange activities, and logistics metrics.</p>
        </div>

        {/* Date Filter selector */}
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white text-xs font-semibold text-slate-600">
          {[
            { label: 'All Time', val: 'ALL_TIME' },
            { label: 'Today', val: 'TODAY' },
            { label: 'Last 7 Days', val: 'WEEK' },
            { label: 'Last 30 Days', val: 'MONTH' },
          ].map((filter) => (
            <a
              key={filter.val}
              href={`/admin/reports?dateFilter=${filter.val}`}
              className={`px-3.5 py-1.5 border-r last:border-0 border-slate-200 hover:bg-slate-50 ${
                dateFilter === filter.val ? 'bg-sky-50 text-sky-600' : ''
              }`}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>

      {/* Grid of Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'New Users', value: usersCount, desc: 'Registered accounts' },
          { label: 'Listed Books', value: booksCount, desc: 'Total listings' },
          { label: 'Purchases', value: ordersCount, desc: 'Total orders' },
          { label: 'Completed Swaps', value: exchangesCount, desc: 'Book exchanges' },
          { label: 'Total Earnings', value: `₹${revenue}`, desc: 'Demo revenue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
            <div className="text-lg font-bold text-slate-800">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Grouped Reports breakdown tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book category shares */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Book Counts by Category</h2>
          {booksGrouped.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">No listings recorded in this duration.</div>
          ) : (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
                <thead>
                  <tr className="font-bold text-slate-400">
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Listings Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booksGrouped.map((bg, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-slate-800">{bg.category}</td>
                      <td className="py-2.5 text-right font-bold text-slate-700">{bg.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order status shares */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Order Volumes by Status</h2>
          {ordersGrouped.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">No orders recorded in this duration.</div>
          ) : (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
                <thead>
                  <tr className="font-bold text-slate-400">
                    <th className="pb-2">Order Status</th>
                    <th className="pb-2 text-right">Transactions Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersGrouped.map((og, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-slate-800">{og.orderStatus}</td>
                      <td className="py-2.5 text-right font-bold text-slate-700">{og.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
