import { FullInternetTariffStatus } from "./internet-tariff-status.models";
import { FullLocationType } from "./location-type.models";

export interface FullInternetTariff {
  id: number;
  internetTariffStatusId: number;
  locationTypeId: number;
  name: string;
  price: number;
  internetSpeedMbits: number;
  description: string;
  internetTariffStatus: FullInternetTariffStatus;
  locationType: FullLocationType;
}

export interface InternetTariffDto {
  id: number;
  internetTariffStatusId: number;
  locationTypeId: number;
  name: string;
  price: number;
  internetSpeedMbits: number;
  description: string;
}

export interface AddInternetTariffDto {
  internetTariffStatusId: number;
  locationTypeId: number;
  name: string;
  price: number;
  internetSpeedMbits: number;
  description: string;
}

export interface InternetTariffFilterParameters {
  locationTypeIds: number[];
  InternetTariffStatusIds: number[];
  nameContains?: string;
  priceFrom?: number;
  priceTo?: number;
  internetSpeedMbitsFrom?: number;
  internetSpeedMbitsTo?: number;
}

export interface InternetTariffSortOptions {
  sortBy?: string;
  ascending: boolean;
}

export interface InternetTariffPaginationOptions {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
}
