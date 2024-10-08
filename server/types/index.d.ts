export interface DisabledTime {
	id: string;
	date: Date;
	startTime: Date;
	endTime: Date;
	createdAt: Date;
	updatedAt: Date;
  }
  
  export interface CreateDisabledTimeInput {
	date: string;
	startTime: string;
	endTime: string;
  }