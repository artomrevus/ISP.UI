import { FullClientStatus } from "./client-status.models";
import { FullLocation } from "./location.models";

export interface FullClient {
    id: number;
    clientStatusId: number;
    locationId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    registrationDate: string;
    clientStatus: FullClientStatus;
    location: FullLocation;
}

export interface ClientDto {
    id: number;
    clientStatusId: number;
    locationId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    registrationDate: string;
}

export interface AddClientDto {
    clientStatusId: number;
    locationId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    registrationDate: string;
}

export interface ClientFilterParameters {
    cityIds: number[];
    streetIds: number[];
    houseIds: number[];
    locationTypeIds: number[];
    locationIds: number[];
    clientStatusIds: number[];
    firstNameContains?: string;
    lastNameContains?: string;
    phoneNumberContains?: string;
    emailContains?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
}

export interface ClientSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface ClientPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}
