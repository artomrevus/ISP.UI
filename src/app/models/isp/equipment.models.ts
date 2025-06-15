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

export interface AddEquipmentDto {
  equipmentTypeId: number;
  price: number;
  name: string;
}

export interface EquipmentFilterParameters {
  equipmentTypeIds: number[];
  nameContains?: string;
  priceFrom?: number;
  priceTo?: number;
}

export interface EquipmentSortOptions {
  sortBy?: string;
  ascending: boolean;
}

export interface EquipmentPaginationOptions {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
}