export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  available: number;
  description: string;
  image?: string;
}

export interface Rental {
  id: string;
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}