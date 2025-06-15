export interface FullInternetTariffStatus {
    id: number;
    internetTariffStatusName: string;
}

export interface InternetTariffStatusDto {
    id: number;
    internetTariffStatusName: string;
}

export enum InternetTariffStatus {
  ACTIVE = 'Active',
  OUTDATED = 'Outdated'
}