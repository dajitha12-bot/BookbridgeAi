import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { getAllUsers } from '../../../lib/db/users';
import { getAllDeliveries, getAllDeliveryStaff } from '../../../lib/db/deliveries';
import AdminOrdersClient from './AdminOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const orders = await getAllOrders();
  const books = await getAllBooks();
  const users = await getAllUsers();
  const deliveries = await getAllDeliveries();
  const staff = await getAllDeliveryStaff();

  const richOrders = orders.map((o: any) => {
    const book = books.find((b) => b.id === o.bookId);
    const buyer = users.find((u) => u.id === o.buyerId);
    const seller = users.find((u) => u.id === o.sellerId);
    const delivery = deliveries.find((d) => d.orderId === o.id);
    const assignedStaff = staff.find((s) => s.userId === delivery?.staffId);

    return {
      ...o,
      book,
      buyerName: buyer?.name || 'Buyer',
      sellerName: seller?.name || 'Seller',
      buyerCity: 'Chennai',
      buyerArea: 'Anna Nagar',
      sellerCity: 'Chennai',
      sellerArea: 'Adyar',
      deliveryCharge: o.deliveryCharge || (o.deliveryMethod === 'PICKUP' ? 0 : 60),
      assignedStaffName: assignedStaff?.name || (o.deliveryMethod === 'PICKUP' ? 'N/A (Pickup)' : 'Unassigned'),
    };
  });

  return (
    <AdminOrdersClient initialOrders={richOrders} staffList={staff} />
  );
}
