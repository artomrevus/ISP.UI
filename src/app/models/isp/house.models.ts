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

export interface AddHouseDto {
    streetId: number;
    houseNumber: string;
}

export interface HouseFilterParameters {
    streetIds: number;
    cityIds: number;
    houseNumberContains: string;
}

export interface HouseSortOptions {
  sortBy?: string;
  ascending: boolean;
}

export interface HousePaginationOptions {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
}