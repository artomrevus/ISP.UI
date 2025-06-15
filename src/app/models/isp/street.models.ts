import { FullCity } from "./city.models";

export interface FullStreet {
    id: number;
    cityId: number;
    streetName: string;
    city: FullCity;
}

export interface StreetDto {
    id: number;
    cityId: number;
    streetName: string;
}

export interface AddStreetDto {
    cityId: number;
    streetName: string;
}

export interface StreetFilterParameters {
    cityIds: number[];
    streetNameContains?: string;
}

export interface StreetSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface StreetPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}