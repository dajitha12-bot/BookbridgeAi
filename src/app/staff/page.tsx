import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth/session';
import { getDeliveryStaffById, getDeliveriesByStaff } from '../../lib/db/deliveries';
import { getOrderById } from '../../lib/db/orders';
import { getBookById } from '../../lib/db/books';
import { getUserById } from '../../lib/db/users';
import DeliveryDashboardView from '../../components/dashboard/DeliveryDashboardView';

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') {
    redirect('/login?role=staff');
  }

  const staff = await getDeliveryStaffById(session.id);
  if (!staff) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-200 text-red-600 text-sm">
        Error: Delivery staff account details not found. Please contact the administrator.
      </div>
    );
  }

  const dbDeliveries = await getDeliveriesByStaff(session.id);

  const deliveries = await Promise.all(
    dbDeliveries.map(async (delivery) => {
      const order = await getOrderById(delivery.orderId);
      let book = null;
      let buyer = null;
      let seller = null;

      if (order) {
        book = await getBookById(order.bookId);
        buyer = await getUserById(order.buyerId);
        seller = await getUserById(order.sellerId);
      }

      return {
        ...delivery,
        order: order
          ? {
              ...order,
              book,
              buyer,
              seller,
            }
          : null,
      };
    })
  );

  const refetch = async () => {
    'use server';
  };

  return (
    <DeliveryDashboardView
      staff={staff as any}
      deliveries={deliveries as any}
      refetch={refetch}
    />
  );
}
