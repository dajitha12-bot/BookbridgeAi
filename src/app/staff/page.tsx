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

  let staff = await getDeliveryStaffById(session.id);
  if (!staff) {
    const user = await getUserById(session.id);
    staff = {
      userId: session.id,
      name: user?.name || session.name || 'Delivery Partner',
      phone: user?.phone || '9876543210',
      city: 'Chennai',
      area: 'Guindy',
      pincode: '600032',
      serviceArea: 'Adyar, Mylapore, Velachery, Guindy, Chennai',
      availability: true,
      activeDeliveries: 0,
    };
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
