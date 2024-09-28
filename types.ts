export interface OpenWindow {
  date: Date;
  slots: string[];
}

export interface CalendarAttribute {
  dot: string;
  dates: Date;
  popover: {
    label: string;
  };
}

export type SelectedDate = string | null;
export type SelectedTime = string | null;


export interface Appointment {
  id: number;
  comment: string | null;
  time: string;
  booked: boolean;
  userId: number;
  user?: User;
}

export interface Admin {
  id: number;
  userId: number;
  user: User;
}

export interface User {
  id: number;
  phoneNumber: string | null;
  allowsWriteToPm: boolean;
  username: string | null;
  languageCode: string | null;
  admin: Admin | null;
  telegramId: number;
  appointments?: Appointment[];
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