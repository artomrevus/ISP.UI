import { FullEquipmentType } from "./equipment-type.models";

export interface FullEquipment {
  id: number;
  equipmentTypeId: number;
  price: number;
  name: string;
  equipmentType: FullEquipmentType;
}

export interface EquipmentDto {
    id: number;
    equipmentTypeId: number;
    price: number;
    name: string;
  }