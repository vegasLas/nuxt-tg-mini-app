export interface OpenWindow {
  date: Date;
  isDisabled: boolean;
  slots: { show: string; time: Date, bookedAppointmentId: number | null }[];
}


export interface Appointment {
  id: number;
  name: string;
  phoneNumber: string;
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
  chatId: string | null;
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



export interface CalendarAttribute {
  key: string | number;
  content: string | Partial<Content | Profile<Partial<Content>>>;
  highlight: boolean | string | Partial<Highlight | Profile<Partial<Highlight>>>;
  dot: boolean | string | Partial<Dot | Profile<Partial<Dot>>>;
  bar: boolean | string | Partial<Bar | Profile<Partial<Bar>>>;
  popover: PopoverConfig;
  // dates: DateRangeSource[];
  customData: any;
  order: number;
}

interface Profile<T> {
  start: T;
  base: T;
  end: T;
  startEnd?: T;
}

interface Content {
  key: string | number;
  color: string;
  class: string | any[];
  style: Record<string, any>;
}

interface Highlight {
  key: string | number;
  color: string;
  class: string | any[];
  style: Record<string, any>;
  contentClass: string | any[];
  contentStyle: Record<string, any>;
  fillMode: 'solid' | 'light' | 'outline';
}

interface Dot {
  key: string | number;
  color: string;
  class: string | any[];
  style: Record<string, any>;
}

interface Bar {
  key: string | number;
  color: string;
  class: string | any[];
  style: Record<string, any>;
}

type PopoverConfig = Partial<{
  label: string;
  customData: any;
  visibility: 'click' | 'hover' | 'hover-focus' | 'focus';
  hideIndicator: boolean;
  isInteractive: boolean;
}>;
