export interface FullClientStatus {
    id: number;
    clientStatusName: string;
}

export interface ClientStatusDto {
    id: number;
    clientStatusName: string;
}

export enum ClientStatus {
  ACTIVE = 'Active',
  BLOCKED = 'Blocked'
}