import { FullOffice } from "./office.models";

export interface FullEmployee {
  id: number;
  employeePositionId: number;
  employeeStatusId: number;
  officeId: number;
  office: FullOffice;
  
  // From candidate
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface EmployeeDto {
    id: number;
    employeePositionId: number;
    employeeStatusId: number;
    officeId: number;
}

export interface AddEmployeeDto {
  employeePositionId: number;
  employeeStatusId: number;
  officeId: number;
}

export interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
