export enum ContractStatus {
    ACTIVE = 'Active',
    EXPIRED = 'Expired',
    CANCELED = 'Canceled'
}

export interface FullContractStatus {
    id: number;
    contractStatusName: string;
}

export interface ContractStatusDto {
    id: number;
    contractStatusName: string;
}