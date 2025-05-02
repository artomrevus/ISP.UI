import { FullContractStatus } from "./contract-status.models";
import { FullEmployee } from "./employee.models";

export interface FullContract {
    id: number;
    contractStatusId: number;
    employeeId: number;
    interviewId: number;
    number: string;
    monthRate: number;
    conclusionDate: string;
    startDate: string;
    endDate: string;
    contractStatus: FullContractStatus;
    employee: FullEmployee
}

export interface ContractDto {
    id: number;
    contractStatusId: number;
    employeeId: number;
    interviewId: number;
    number: string;
    monthRate: number;
    conclusionDate: string;
    startDate: string;
    endDate: string;
}

export interface AddContractDto {
    contractStatusId: number;
    employeeId: number;
    interviewId: number;
    number: string;
    monthRate: number;
    conclusionDate: string;
    startDate: string;
    endDate: string;
}