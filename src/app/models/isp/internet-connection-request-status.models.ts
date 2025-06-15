export interface FullInternetConnectionRequestStatus {
  id: number;
  internetConnectionRequestStatusName: string;
}

export interface InternetConnectionRequestStatusDto {
  id: number;
  internetConnectionRequestStatusName: string;
}

export enum InternetConnectionRequestStatus {
  NEW = 'New',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected'
}