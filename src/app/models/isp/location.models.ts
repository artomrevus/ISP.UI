import { FullHouse } from "./house.models";
import { FullLocationType } from "./location-type.models";

export interface FullLocation {
    id: number;
    locationTypeId: number;
    houseId: number;
    apartmentNumber?: number;
    locationType: FullLocationType;
    house: FullHouse;
}

export interface LocationDto {
    id: number;
    locationTypeId: number;
    houseId: number;
    apartmentNumber?: number;
}

export interface AddLocationDto {
    locationTypeId: number;
    houseId: number;
    apartmentNumber?: number;
}

export interface LocationFilterParameters {
    cityIds: number[];
    streetIds: number[];
    houseIds: number[];
    locationTypeIds: number[];
}

export interface LocationSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface LocationPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}
