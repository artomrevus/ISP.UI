export interface FullCity {
    id: number;
    cityName: string;
}

export interface CityDto {
    id: number;
    cityName: string;
}


export interface AddCityDto {
    cityName: string;
}

export interface CityFilterParameters {
    cityNameContains?: string;
}

export interface CitySortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface CityPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}
