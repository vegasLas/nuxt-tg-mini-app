export interface DisabledTime {
	id: string;
	date: string | null;
	slot: string | null;
	createdAt: Date;
	updatedAt: Date;
  }
  
  export interface CreateDisabledTimeInput {
	date?: Date;
	slot?: Date;
  }
  export interface OpenWindow {
	date: Date
	isDisabled: boolean
	slots: { show: string; time: Date, bookedAppointmentId: number | null }[]
  }