export interface FullVacancyStatus {
    id: number;
    vacancyStatusName: string;
}

export interface VacancyStatusDto {
    id: number;
    vacancyStatusName: string;
}

export enum VacancyStatus {
    DRAFT = 'Draft',
    ACTIVE = 'Active',
    CLOSED = 'Closed',
    CANCELED = 'Canceled'
}