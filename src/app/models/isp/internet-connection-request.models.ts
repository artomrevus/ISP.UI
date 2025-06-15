import { FullClient } from "./client.models";
import { FullConnection } from "./connection.models";
import { FullInternetConnectionRequestStatus } from "./internet-connection-request-status.models";
import { FullInternetTariff } from "./internet-tariff.models";

export interface FullInternetConnectionRequest {
  id: number;
  clientId: number;
  internetTariffId: number;
  internetConnectionRequestStatusId: number;
  number: string;
  requestDate: string;
  client: FullClient;
  internetTariff: FullInternetTariff;
  internetConnectionRequestStatus: FullInternetConnectionRequestStatus;
  connection?: FullConnection
}

export interface InternetConnectionRequestDto {
  id: number;
  clientId: number;
  internetTariffId: number;
  internetConnectionRequestStatusId: number;
  number: string;
  requestDate: string;
}

export interface AddInternetConnectionRequestDto {
  clientId: number;
  internetTariffId: number;
  internetConnectionRequestStatusId: number;
  number: string;
  requestDate: string;
}