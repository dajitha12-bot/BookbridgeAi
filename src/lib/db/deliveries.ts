import { readCollection, writeCollection, generateId } from './dbHelper';
import { Delivery, DeliveryStaff } from '../../types';

const DELIVERIES_FILE = 'deliveries.json';
const STAFF_FILE = 'deliveries-staff.json'; // Representing delivery staff in JSON DB

export async function getAllDeliveries(): Promise<Delivery[]> {
  return readCollection<Delivery>(DELIVERIES_FILE);
}

export async function getDeliveryById(id: string): Promise<Delivery | null> {
  const deliveries = await getAllDeliveries();
  return deliveries.find(d => d.id === id) || null;
}

export async function getDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
  const deliveries = await getAllDeliveries();
  return deliveries.find(d => d.orderId === orderId) || null;
}

export async function getDeliveriesByStaff(staffId: string): Promise<Delivery[]> {
  const deliveries = await getAllDeliveries();
  return deliveries.filter(d => d.staffId === staffId);
}

export async function createDelivery(deliveryData: Omit<Delivery, 'id' | 'updatedAt'>): Promise<Delivery> {
  const deliveries = await getAllDeliveries();

  const newDelivery: Delivery = {
    ...deliveryData,
    id: generateId(),
    updatedAt: new Date().toISOString(),
  };

  deliveries.push(newDelivery);
  writeCollection(DELIVERIES_FILE, deliveries);

  return newDelivery;
}

export async function updateDelivery(id: string, updates: Partial<Omit<Delivery, 'id' | 'updatedAt'>>): Promise<Delivery | null> {
  const deliveries = await getAllDeliveries();
  const idx = deliveries.findIndex(d => d.id === id);
  if (idx === -1) return null;

  deliveries[idx] = {
    ...deliveries[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeCollection(DELIVERIES_FILE, deliveries);
  return deliveries[idx];
}

// --- DELIVERY STAFF ---

export async function getAllDeliveryStaff(): Promise<DeliveryStaff[]> {
  return readCollection<DeliveryStaff>(STAFF_FILE);
}

export async function getDeliveryStaffById(userId: string): Promise<DeliveryStaff | null> {
  const staff = await getAllDeliveryStaff();
  return staff.find(s => s.userId === userId) || null;
}

export async function createDeliveryStaff(staffData: DeliveryStaff): Promise<DeliveryStaff> {
  const staffList = await getAllDeliveryStaff();
  staffList.push(staffData);
  writeCollection(STAFF_FILE, staffList);
  return staffData;
}

export async function updateDeliveryStaff(userId: string, updates: Partial<Omit<DeliveryStaff, 'userId'>>): Promise<DeliveryStaff | null> {
  const staffList = await getAllDeliveryStaff();
  const idx = staffList.findIndex(s => s.userId === userId);
  if (idx === -1) return null;

  staffList[idx] = {
    ...staffList[idx],
    ...updates,
  };

  writeCollection(STAFF_FILE, staffList);
  return staffList[idx];
}
