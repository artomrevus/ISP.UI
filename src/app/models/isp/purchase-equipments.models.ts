import {FullEquipment} from "./equipment.models";
import {FullEquipmentPlacement} from "./equipment-placement.models";

export interface PurchaseEquipmentDto {
    id: number;
    purchaseId: number;
    equipmentId: number;
    purchaseEquipmentAmount: number;
    price: number;
}

export interface AddPurchaseEquipmentDto {
    purchaseId: number;
    equipmentId: number;
    purchaseEquipmentAmount: number;
    price: number;
}

export interface FullPurchaseEquipment extends PurchaseEquipmentDto {
    // Relations
    equipment?: FullEquipment;
    equipmentPlacements?: FullEquipmentPlacement[];
}