"use server";
import { getSession } from "../lib/auth/session";
import { createUser, getUserByEmail } from "../lib/db/users";
import {
  getDeliveryById,
  getDeliveryByOrderId,
  getDeliveriesByStaff,
  createDelivery,
  updateDelivery,
  getAllDeliveryStaff,
  getDeliveryStaffById,
  createDeliveryStaff,
  updateDeliveryStaff
} from "../lib/db/deliveries";
import { getOrderById, updateOrder } from "../lib/db/orders";
import { getBookById, updateBook } from "../lib/db/books";
import { getPaymentByOrderId, updatePayment } from "../lib/db/payments";
import { createNotification } from "../lib/db/notifications";
import { createStaffEarning, getStaffEarningsByStaff, getStaffEarningsSummary } from "../lib/db/staffEarnings";
import { createTrackingEvent } from "../lib/db/trackingEvents";
import { hashPassword } from "../lib/auth/hash";
import { revalidatePath } from "next/cache";
async function registerDeliveryStaffAction(formData) {
  try {
    const existing = await getUserByEmail(formData.email);
    if (existing) {
      return { success: false, error: "User with this email already exists." };
    }
    const passwordHash = await hashPassword(formData.password);
    const newUser = await createUser(
      {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        passwordHash,
        role: "DELIVERY_STAFF"
      },
      {
        city: formData.city,
        area: formData.area,
        address: formData.address,
        pincode: formData.pincode,
        latitude: 13.0827,
        longitude: 80.2707
      }
    );
    const newStaff = await createDeliveryStaff({
      id: `ds-${Date.now()}`,
      userId: newUser.id,
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      area: formData.area,
      pincode: formData.pincode,
      serviceArea: formData.serviceArea,
      availability: true,
      activeDeliveries: 0
    });
    await createNotification(
      "usr-admin1",
      "New Delivery Staff Registered",
      `Delivery Staff ${formData.name} (${formData.serviceArea}) registered and is available for delivery assignments.`,
      "SYSTEM"
    );
    return { success: true, userId: newUser.id, staffId: newStaff.id };
  } catch (error) {
    console.error("Delivery staff registration error:", error);
    return { success: false, error: error.message || "Failed to register delivery staff." };
  }
}
async function assignDeliveryStaffAction(orderId, staffUserId) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized. Only Admin can assign delivery staff." };
    }
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: "Order not found." };
    const staff = await getDeliveryStaffById(staffUserId);
    if (!staff) return { success: false, error: "Delivery staff member not found." };
    let delivery = await getDeliveryByOrderId(orderId);
    const deliveryFee = order.deliveryMethod === "DELIVERY" ? order.deliveryCharge || 40 : 0;
    if (delivery) {
      delivery = await updateDelivery(delivery.id, {
        staffId: staff.userId,
        status: "ASSIGNED",
        deliveryCharge: deliveryFee
      });
    } else {
      delivery = await createDelivery({
        orderId: order.id,
        staffId: staff.userId,
        status: "ASSIGNED",
        deliveryCharge: deliveryFee,
        deliveryAddress: order.deliveryAddress || "Home Address",
        pickupAddress: order.pickupLocation || "Seller Address"
      });
    }
    await updateOrder(orderId, {
      orderStatus: "CONFIRMED"
    });
    await updateDeliveryStaff(staff.userId, {
      activeDeliveries: (staff.activeDeliveries || 0) + 1
    });
    await createTrackingEvent({
      orderId: order.id,
      deliveryId: delivery?.id,
      status: "ASSIGNED",
      stageName: "Delivery Staff Assigned",
      locationName: staff.serviceArea,
      description: `Admin confirmed order and assigned delivery staff ${staff.name} (${staff.phone}).`
    });
    await createNotification(
      order.buyerId,
      "Delivery Staff Assigned!",
      `Admin confirmed your order #${orderId}. Assigned delivery staff: ${staff.name} (Phone: ${staff.phone}).`,
      "ORDER"
    );
    await createNotification(
      staff.userId,
      "New Delivery Assigned!",
      `You have been assigned order #${orderId}. Pickup location: ${order.pickupLocation || "Seller Address"}.`,
      "ORDER"
    );
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/tracking");
    revalidatePath("/staff");
    return { success: true, deliveryId: delivery?.id, staffName: staff.name };
  } catch (error) {
    console.error("Assign delivery staff error:", error);
    return { success: false, error: error.message || "Failed to assign staff." };
  }
}
async function updateDeliveryStatusByStaffAction(deliveryId, newStatus) {
  try {
    const session = await getSession();
    if (!session || session.role !== "DELIVERY_STAFF" && session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized." };
    }
    const delivery = await getDeliveryById(deliveryId);
    if (!delivery) return { success: false, error: "Delivery record not found." };
    const order = await getOrderById(delivery.orderId);
    if (!order) return { success: false, error: "Order not found." };
    const book = await getBookById(order.bookId);
    let orderStatus = order.orderStatus;
    let stageName = newStatus.replace("_", " ");
    let description = `Delivery status updated to ${stageName}.`;
    if (newStatus === "ACCEPTED") {
      orderStatus = "CONFIRMED";
      stageName = "Order Accepted by Courier";
      description = "Courier accepted the delivery assignment and is heading to seller location.";
    } else if (newStatus === "REACHED_SELLER") {
      orderStatus = "CONFIRMED";
      stageName = "Courier Reached Seller";
      description = "Courier arrived at seller location for book collection.";
    } else if (newStatus === "PICKED_UP") {
      orderStatus = "IN_TRANSIT";
      stageName = "Order Packed & Picked Up";
      description = "Book verified, packed, and picked up from seller.";
      if (book) await updateBook(book.id, { status: "RESERVED" });
    } else if (newStatus === "IN_TRANSIT") {
      orderStatus = "IN_TRANSIT";
      stageName = "In Transit";
      description = "Package is currently in transit to destination hub.";
    } else if (newStatus === "OUT_FOR_DELIVERY") {
      orderStatus = "IN_TRANSIT";
      stageName = "Out for Delivery";
      description = "Courier is out for final delivery to buyer destination address.";
    } else if (newStatus === "DELIVERED") {
      orderStatus = "DELIVERED";
      stageName = "Delivered";
      description = "Package successfully handed over to buyer. Delivery completed!";
      if (book) await updateBook(book.id, { status: "SOLD" });
      await updateOrder(order.id, {
        orderStatus: "DELIVERED",
        paymentStatus: "PAID"
      });
      const payment = await getPaymentByOrderId(order.id);
      if (payment) {
        await updatePayment(payment.id, { status: "PAID" });
      }
      const charge = delivery.deliveryCharge || 40;
      const earningAmt = Math.round(charge * 0.5);
      await createStaffEarning({
        staffId: delivery.staffId || session.id,
        deliveryId: delivery.id,
        orderId: order.id,
        deliveryCharge: charge,
        earningAmount: earningAmt
      });
      const staffRecord = await getDeliveryStaffById(delivery.staffId || session.id);
      if (staffRecord) {
        await updateDeliveryStaff(staffRecord.userId, {
          activeDeliveries: Math.max(0, (staffRecord.activeDeliveries || 1) - 1)
        });
      }
    }
    await updateDelivery(delivery.id, {
      status: newStatus
    });
    await updateOrder(order.id, {
      orderStatus
    });
    await createTrackingEvent({
      orderId: order.id,
      deliveryId: delivery.id,
      status: newStatus,
      stageName,
      description
    });
    await createNotification(
      order.buyerId,
      `Delivery Update: ${stageName}`,
      `Order #${order.id} update: ${description}`,
      "ORDER"
    );
    await createNotification(
      order.sellerId,
      `Delivery Update: ${stageName}`,
      `Order #${order.id} for "${book?.title || "Book"}" status: ${description}`,
      "ORDER"
    );
    revalidatePath("/dashboard/tracking");
    revalidatePath("/staff");
    revalidatePath("/staff/assigned");
    revalidatePath("/staff/earnings");
    revalidatePath("/admin/orders");
    return { success: true, status: newStatus, stageName };
  } catch (error) {
    console.error("Update delivery status error:", error);
    return { success: false, error: error.message || "Failed to update delivery status." };
  }
}
async function advanceScheduledDeliveryStageAction(orderId) {
  try {
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: "Order not found." };
    const delivery = await getDeliveryByOrderId(orderId);
    const deliveryStages = [
      "ASSIGNED",
      "ACCEPTED",
      "REACHED_SELLER",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];
    const currentStatus = delivery?.status || "ASSIGNED";
    const currentIndex = deliveryStages.indexOf(currentStatus);
    const nextIndex = currentIndex < deliveryStages.length - 1 ? currentIndex + 1 : currentIndex;
    const nextStatus = deliveryStages[nextIndex];
    if (currentStatus === "DELIVERED") {
      return { success: true, message: "Order is already completed and delivered!", status: "DELIVERED" };
    }
    if (!delivery || !delivery.staffId) {
      const staffList = await getAllDeliveryStaff();
      const staffId = staffList.length > 0 ? staffList[0].userId : "usr-staff1";
      await assignDeliveryStaffAction(orderId, staffId);
    }
    const updatedDelivery = await getDeliveryByOrderId(orderId);
    if (updatedDelivery) {
      return updateDeliveryStatusByStaffAction(updatedDelivery.id, nextStatus);
    }
    return { success: false, error: "Could not advance stage." };
  } catch (error) {
    console.error("Advance scheduled delivery stage error:", error);
    return { success: false, error: error.message || "Failed to advance stage." };
  }
}
async function getStaffDashboardDataAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== "DELIVERY_STAFF") {
      return { success: false, error: "Unauthorized." };
    }
    const staff = await getDeliveryStaffById(session.id);
    const deliveries = await getDeliveriesByStaff(session.id);
    const earningsSummary = await getStaffEarningsSummary(session.id);
    const earningsList = await getStaffEarningsByStaff(session.id);
    const pendingDeliveries = deliveries.filter((d) => d.status === "ASSIGNED" || d.status === "ACCEPTED" || d.status === "REACHED_SELLER");
    const activeDeliveries = deliveries.filter((d) => d.status === "PICKED_UP" || d.status === "IN_TRANSIT" || d.status === "OUT_FOR_DELIVERY");
    const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED");
    return {
      success: true,
      data: {
        staff,
        summary: {
          todaysDeliveries: completedDeliveries.filter((d) => new Date(d.updatedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString()).length,
          pendingDeliveries: pendingDeliveries.length + activeDeliveries.length,
          completedDeliveries: completedDeliveries.length,
          todaysEarnings: earningsSummary.today,
          weeklyEarnings: earningsSummary.week,
          monthlyEarnings: earningsSummary.month,
          totalEarnings: earningsSummary.total
        },
        deliveries,
        pendingDeliveries,
        activeDeliveries,
        completedDeliveries,
        earningsList
      }
    };
  } catch (error) {
    console.error("Get staff dashboard error:", error);
    return { success: false, error: error.message || "Failed to load staff data." };
  }
}
export {
  advanceScheduledDeliveryStageAction,
  assignDeliveryStaffAction,
  getStaffDashboardDataAction,
  registerDeliveryStaffAction,
  updateDeliveryStatusByStaffAction
};
