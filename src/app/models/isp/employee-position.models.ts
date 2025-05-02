export enum EmployeePosition {
  WAREHOUSEWORKER = 'Warehouse Worker',
  OFFICEMANAGER = 'Office Manager',
  NETWORKTECHNICIAN = 'Network Technician',
  RECRUITER = 'Recruiter'
}

export interface FullEmployeePosition {
    id: number;
    employeePositionName: string;
  }

export interface EmployeePositionDto {
    id: number;
    employeePositionName: string;
  }