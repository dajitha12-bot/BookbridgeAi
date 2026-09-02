import { readCollection, writeCollection, generateId } from './dbHelper';
import { Payment } from '../../types';

const PAYMENTS_FILE = 'payments.json';

export async function getAllPayments(): Promise<Payment[]> {
  return readCollection<Payment>(PAYMENTS_FILE);
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const payments = await getAllPayments();
  return payments.find(p => p.id === id) || null;
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const payments = await getAllPayments();
  return payments.find(p => p.orderId === orderId) || null;
}

export async function createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
  const payments = await getAllPayments();

  const newPayment: Payment = {
    ...paymentData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  payments.push(newPayment);
  writeCollection(PAYMENTS_FILE, payments);

  return newPayment;
}

export async function updatePayment(id: string, updates: Partial<Omit<Payment, 'id' | 'createdAt'>>): Promise<Payment | null> {
  const payments = await getAllPayments();
  const idx = payments.findIndex(p => p.id === id);
  if (idx === -1) return null;

  payments[idx] = {
    ...payments[idx],
    ...updates,
  };

  writeCollection(PAYMENTS_FILE, payments);
  return payments[idx];
}
