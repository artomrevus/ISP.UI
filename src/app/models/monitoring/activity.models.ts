export interface UserActivityDto {
  userId: string;
  employeeId?: string;
  userName: string;
  role: string;
  actionOn: string;
  action: string;
  timestamp: Date;
  details: string;
}

export interface AddUserActivityDto {
  actionOn: string;
  action: string;
  details: string;
}
  
export interface UserActivityFilterParameters {
  officeIds: number[];
  cityIds: number[];
  userNameContains?: string;
  roleContains?: string;
  actionOnContains?: string;
  actionContains?: string;
  startDateTime?: Date;
  endDateTime?: Date;
}
  