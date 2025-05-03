import { FullEquipment } from "./equipment.models";
import { FullOffice } from "./office.models";

export interface OfficeEquipmentDto {
    id: number;
    officeId: number;
    equipmentId: number;
    officeEquipmentAmount: number;
}

export interface AddOfficeEquipmentDto {
    officeId: number;
    equipmentId: number;
    officeEquipmentAmount: number;
}

export interface FullOfficeEquipment extends OfficeEquipmentDto {
    // Relations
    office: FullOffice;
    equipment: FullEquipment;
}