import {FullPurchaseStatus} from "./purchase-statuses.models";
import {FullSupplier} from "./supplier.models";
import {FullEmployee} from "./employee.models";
import {FullPurchaseEquipment} from "./purchase-equipments.models";

export interface FullPurchase {
    id: number;
    purchaseStatusId: number;
    supplierId: number;
    employeeId: number;
    number: string;
    totalPrice: number;
    date: string;

    // Relations
    purchaseStatus?: FullPurchaseStatus;
    supplier?: FullSupplier;
    employee?: FullEmployee;
    purchaseEquipments?: FullPurchaseEquipment[];
}

export interface PurchaseDto {
    id: number;
    purchaseStatusId: number;
    supplierId: number;
    employeeId: number;
    number: string;
    totalPrice: number;
    date: string;
}

export interface AddPurchaseDto {
    purchaseStatusId: number;
    supplierId: number;
    employeeId: number;
    number: string;
    totalPrice: number;
    date: string;
}

export interface PurchaseFilterParameters {
    purchaseStatusIds: number[];
    supplierIds: number[];
    numberContains?: string;
    dateFrom?: string;
    dateTo?: string;
    totalPriceFrom?: number;
    totalPriceTo?: number;
    purchaseEquipmentsCountFrom?: number;
    purchaseEquipmentsCountTo?: number;
}

export interface PurchaseSortOptions {
    sortBy?: string;
    ascending: boolean;
}

export interface PurchasePaginationOptions {
    pageSize: number;
    pageNumber: number;
    totalItems: number;
}