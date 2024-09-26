export interface Appointment {
  id: number;
  time: string;
  phoneNumber: string | null;
  booked: boolean;
  userId: number | null;
}

export interface User {
  id: number;
  phoneNumber: string | null;
  telegramId: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface Notification {
  id: number;
  message: string;
  userId: number;
  createdAt: Date;
}