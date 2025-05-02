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