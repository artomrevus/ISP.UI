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