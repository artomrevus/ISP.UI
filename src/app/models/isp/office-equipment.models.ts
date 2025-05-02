import { FullEquipment } from "./equipment.models";
import { FullOffice } from "./office.models";

export interface FullOfficeEquipment {
  id: number;
  officeId: number;
  equipmentId: number;
  officeEquipmentAmount: number;
  office: FullOffice;
  equipment: FullEquipment;
}

export interface OfficeEquipmentDto {
    id: number;
    officeId: number;
    equipmentId: number;
    officeEquipmentAmount: number;
  }