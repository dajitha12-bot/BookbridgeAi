import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth/session";
import { getDeliveryStaffById, getDeliveriesByStaff } from "../../lib/db/deliveries";
import { getOrderById } from "../../lib/db/orders";
import { getBookById } from "../../lib/db/books";
import { getUserById } from "../../lib/db/users";
import DeliveryDashboardView from "../../components/dashboard/DeliveryDashboardView";
export const dynamic = "force-dynamic";
async function StaffDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") {
    redirect("/login?role=staff");
  }
  let staff = await getDeliveryStaffById(session.id);
  if (!staff) {
    const user = await getUserById(session.id);
    staff = {
      userId: session.id,
      name: user?.name || session.name || "Delivery Partner",
      phone: user?.phone || "9876543210",
      city: "Chennai",
      area: "Guindy",
      pincode: "600032",
      serviceArea: "Adyar, Mylapore, Velachery, Guindy, Chennai",
      availability: true,
      activeDeliveries: 0
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
        order: order ? {
          ...order,
          book,
          buyer,
          seller
        } : null
      };
    })
  );
  let finalDeliveries = deliveries;
  if (!finalDeliveries || finalDeliveries.length === 0) {
    finalDeliveries = [
      {
        id: "DEL-2026-9042",
        orderId: "ord-1",
        staffId: session.id,
        deliveryType: "ORDER",
        pickupAddress: "14, Luz Church Road, Mylapore, Chennai",
        deliveryAddress: "10, Kasturiba Nagar, Adyar, Chennai",
        status: "IN_TRANSIT",
        distanceKm: 5.2,
        deliveryCharge: 40,
        createdAt: "2026-10-13T09:30:00.000Z",
        updatedAt: "2026-10-13T10:15:00.000Z",
        order: {
          id: "ord-1",
          amount: 850,
          deliveryMethod: "DELIVERY",
          paymentStatus: "PAID",
          orderStatus: "IN_TRANSIT",
          createdAt: "2026-10-13T09:00:00.000Z",
          book: {
            id: "bk-1",
            title: "Artificial Intelligence: A Modern Approach (4th Edition)",
            author: "Stuart Russell & Peter Norvig",
            area: "Mylapore",
            city: "Chennai"
          },
          buyer: { id: "usr-user1", name: "Ajitha", phone: "9876543210" },
          seller: { id: "usr-user3", name: "Priya Patel", phone: "9876543211" }
        }
      },
      {
        id: "DEL-2026-9043",
        orderId: "ord-2",
        staffId: session.id,
        deliveryType: "ORDER",
        pickupAddress: "45, GST Road, Guindy, Chennai",
        deliveryAddress: "22, 2nd Main Road, Besant Nagar, Chennai",
        status: "ASSIGNED",
        distanceKm: 6.8,
        deliveryCharge: 50,
        createdAt: "2026-10-13T08:45:00.000Z",
        updatedAt: "2026-10-13T08:45:00.000Z",
        order: {
          id: "ord-2",
          amount: 1200,
          deliveryMethod: "DELIVERY",
          paymentStatus: "PAID",
          orderStatus: "ASSIGNED",
          createdAt: "2026-10-13T08:30:00.000Z",
          book: {
            id: "bk-2",
            title: "Java: The Complete Reference (13th Edition)",
            author: "Herbert Schildt",
            area: "Guindy",
            city: "Chennai"
          },
          buyer: { id: "usr-user", name: "Standard Reader", phone: "9876543212" },
          seller: { id: "usr-user2", name: "Karthik Raj", phone: "9876543213" }
        }
      },
      {
        id: "DEL-2026-8812",
        orderId: "ord-3",
        staffId: session.id,
        deliveryType: "ORDER",
        pickupAddress: "8, Bypass Road, Velachery, Chennai",
        deliveryAddress: "15, Lattice Bridge Road, Adyar, Chennai",
        status: "DELIVERED",
        distanceKm: 4.5,
        deliveryCharge: 35,
        createdAt: "2026-10-12T14:00:00.000Z",
        updatedAt: "2026-10-12T16:30:00.000Z",
        order: {
          id: "ord-3",
          amount: 700,
          deliveryMethod: "DELIVERY",
          paymentStatus: "PAID",
          orderStatus: "DELIVERED",
          createdAt: "2026-10-12T13:30:00.000Z",
          book: {
            id: "bk-3",
            title: "Clean Code: Agile Software Craftsmanship",
            author: "Robert C. Martin",
            area: "Velachery",
            city: "Chennai"
          },
          buyer: { id: "usr-user1", name: "Ajitha", phone: "9876543210" },
          seller: { id: "usr-user3", name: "Priya Patel", phone: "9876543211" }
        }
      }
    ];
  }
  const refetch = async () => {
    "use server";
  };
  return <DeliveryDashboardView
    staff={staff}
    deliveries={finalDeliveries}
    refetch={refetch}
  />;
}
export {
  StaffDashboardPage as default};
