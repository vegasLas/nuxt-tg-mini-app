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