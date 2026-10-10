"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getUserOrdersAction,
  getUserSalesAction,
  createOrderAction,
  confirmPickupAction
} from "../actions/orderActions";
function useOrders() {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchOrdersAndSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersRes = await getUserOrdersAction();
      const salesRes = await getUserSalesAction();
      if (ordersRes.success && ordersRes.orders) {
        setOrders(ordersRes.orders);
      } else if (ordersRes.error) {
        setError(ordersRes.error);
      }
      if (salesRes.success && salesRes.sales) {
        setSales(salesRes.sales);
      } else if (salesRes.error) {
        setError(salesRes.error);
      }
    } catch (e) {
      setError("Failed to fetch orders history.");
    } finally {
      setLoading(false);
    }
  }, []);
  const placeOrder = async (bookId, deliveryMethod, paymentMethod, demoDetails) => {
    setLoading(true);
    try {
      const res = await createOrderAction(bookId, deliveryMethod, paymentMethod, demoDetails);
      if (res.success) {
        await fetchOrdersAndSales();
      }
      return res;
    } catch (e) {
      return { success: false, error: e.message || "An error occurred." };
    } finally {
      setLoading(false);
    }
  };
  const confirmPickup = async (orderId) => {
    setLoading(true);
    try {
      const res = await confirmPickupAction(orderId);
      if (res.success) {
        await fetchOrdersAndSales();
      }
      return res;
    } catch (e) {
      return { success: false, error: e.message || "An error occurred." };
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrdersAndSales();
  }, [fetchOrdersAndSales]);
  return {
    orders,
    sales,
    loading,
    error,
    placeOrder,
    confirmPickup,
    refetch: fetchOrdersAndSales
  };
}
export {
  useOrders
};
