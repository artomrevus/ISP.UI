import { FullEmployeePosition } from "./employee-position.models";
import { FullVacancyStatus } from "./vacancy-status.models";

export interface FullVacancy {
    id: number;
    vacancyStatusId: number;
    employeePositionId: number;
    monthRate: number;
    description: string;
    number: string;
    appearanceDate: string;
    vacancyStatus: FullVacancyStatus;
    employeePosition: FullEmployeePosition;
}


export interface VacancyDto {
    id: number;
    vacancyStatusId: number;
    employeePositionId: number;
    monthRate: number;
    description: string;
    number: string;
    appearanceDate: string;
}

export interface AddVacancyDto {
    vacancyStatusId: number;
    employeePositionId: number;
    monthRate: number;
    description: string;
    number: string;
    appearanceDate: string;
}
