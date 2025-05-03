export enum PurchaseStatus {
    REQUESTED = 'Requested',
    APPROVED = 'Approved',
    IN_TRANSIT = 'In Transit',
    DELIVERED = 'Delivered',
    CANCELED = 'Canceled'
}

export interface FullPurchaseStatus {
    id: number;
    purchaseStatusName: string;
}

export interface PurchaseStatusDto {
    id: number;
    purchaseStatusName: string;
}