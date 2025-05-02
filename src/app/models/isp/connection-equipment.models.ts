import { FullConnection } from "./connection.models";
import { FullOfficeEquipment } from "./office-equipment.models";

export interface FullConnectionEquipment {
  id: number;
  connectionId?: number;
  officeEquipmentId: number;
  connectionEquipmentAmount: number;
  connection?: FullConnection;
  officeEquipment: FullOfficeEquipment;
}

export interface ConnectionEquipmentDto {
    id: number;
    connectionId: number;
    officeEquipmentId: number;
    connectionEquipmentAmount: number;
  }

  export interface AddConnectionEquipmentDto {
    connectionId: number;
    officeEquipmentId: number;
    connectionEquipmentAmount: number;
  }
