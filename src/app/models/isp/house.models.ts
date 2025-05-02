import { FullStreet } from "./street.models";

export interface FullHouse {
    id: number;
    streetId: number;
    houseNumber: string;
    street: FullStreet;
}

export interface HouseDto {
    id: number;
    streetId: number;
    houseNumber: string;
}