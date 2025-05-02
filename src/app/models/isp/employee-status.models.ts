export enum EmployeeStatus {
  ACTIVE = 'Active',
  ONLEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export interface FullEmployeeStatus {
  id: number;
  employeeStatusName: string;
}

export interface EmployeeStatusDto {
  id: number;
  employeeStatusName: string;
}