export interface Appointment {
  id: number;
  time: string;
  booked: boolean;
  userId: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
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