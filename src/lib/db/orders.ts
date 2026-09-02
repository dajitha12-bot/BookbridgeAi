import { readCollection, writeCollection, generateId } from './dbHelper';
import { Order } from '../../types';

const ORDERS_FILE = 'orders.json';

export async function getAllOrders(): Promise<Order[]> {
  return readCollection<Order>(ORDERS_FILE);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getAllOrders();
  return orders.find(o => o.id === id) || null;
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders.filter(o => o.buyerId === buyerId);
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders.filter(o => o.sellerId === sellerId);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const orders = await getAllOrders();

  const newOrder: Order = {
    ...orderData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  writeCollection(ORDERS_FILE, orders);

  return newOrder;
}

export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<Order | null> {
  const orders = await getAllOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    ...updates,
  };

  writeCollection(ORDERS_FILE, orders);
  return orders[idx];
}
