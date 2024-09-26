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