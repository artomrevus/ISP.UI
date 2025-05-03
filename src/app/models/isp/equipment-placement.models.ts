import {FullEmployee} from "./employee.models";
import {FullOfficeEquipment} from "./office-equipment.models";

export interface FullEquipmentPlacement extends EquipmentPlacementDto {
    // Relations
    employee?: FullEmployee;
    officeEquipment?: FullOfficeEquipment;
}

export interface EquipmentPlacementDto {
    id: number;
    employeeId: number;
    purchaseEquipmentId: number;
    officeEquipmentId: number;
    equipmentPlacementAmount: number;
    date: string;
}

export interface AddEquipmentPlacementDto {
    employeeId: number;
    purchaseEquipmentId: number;
    officeEquipmentId: number;
    equipmentPlacementAmount: number;
    date: string;
}