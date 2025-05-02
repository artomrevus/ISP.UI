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

