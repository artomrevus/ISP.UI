export interface FullSupplier {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
}

export interface SupplierDto {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
}

export interface AddSupplierDto {
    name: string;
    phoneNumber: string;
    email: string;
}

export interface SupplierFilterParameters {
    name?: string;
    phoneNumber?: string;
    email?: string;
}

export interface SupplierSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface SupplierPaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}