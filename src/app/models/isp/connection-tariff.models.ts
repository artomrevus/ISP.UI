export interface FullConnectionTariff {
  id: number;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
}

export interface ConnectionTariffDto {
    id: number;
    name: string;
    price: number;
    startDate: string;
    endDate: string;
}

export interface AddConnectionTariffDto {
    name: string;
    price: number;
    startDate: string;
    endDate: string;
}

export interface ConnectionTariffFilterParameters {
    nameContains?: string;
    priceFrom?: number;
    priceTo?: number;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
}

export interface ConnectionTariffSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface ConnectionTariffPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}