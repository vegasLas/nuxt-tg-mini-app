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