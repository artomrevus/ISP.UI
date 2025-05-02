import { FullCity } from "./city.models";

export interface FullOffice {
  id: number;
  cityId: number;
  address: string;
  phoneNumber: string;
  email: string;
  city: FullCity;
}

export interface OfficeDto {
    id: number;
    cityId: number;
    address: string;
    phoneNumber: string;
    email: string;
  }