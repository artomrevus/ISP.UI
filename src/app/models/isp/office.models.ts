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

export interface AddOfficeDto {
  cityId: number;
  address: string;
  phoneNumber: string;
  email: string;
}

export interface OfficeFilterParameters {
  cityIds: number[];
  addressContains?: string;
  phoneNumberContains?: string;
  emailContains?: string;
}

export interface OfficeSortOptions {
  sortBy?: string;
  ascending: boolean;
}

export interface OfficePaginationOptions {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
}
