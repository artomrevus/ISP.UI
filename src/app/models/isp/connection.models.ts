import { FullConnectionEquipment } from "./connection-equipment.models";
import { FullConnectionTariff } from "./connection-tariff.models";
import { FullEmployee } from "./employee.models";

export interface FullConnection {
  id: number;
  internetConnectionRequestId: number;
  connectionTariffId: number;
  employeeId: number;
  totalPrice: number;
  connectionDate: string;
  connectionTariff: FullConnectionTariff;
  employee: FullEmployee;
  connectionEquipments: FullConnectionEquipment[]
}

export interface ConnectionDto {
    id: number;
    internetConnectionRequestId: number;
    connectionTariffId: number;
    employeeId: number;
    totalPrice: number;
    connectionDate: string;
}

export interface AddConnectionDto {
    internetConnectionRequestId: number;
    connectionTariffId: number;
    employeeId: number;
    totalPrice: number;
    connectionDate: string;
}