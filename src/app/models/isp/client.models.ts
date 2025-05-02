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