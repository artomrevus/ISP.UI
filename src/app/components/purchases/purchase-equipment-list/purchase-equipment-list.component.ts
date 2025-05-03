import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {PurchaseEquipmentDto} from "../../../models/isp/purchase-equipments.models";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {EquipmentDto} from "../../../models/isp/equipment.models";
import {EquipmentsService} from "../../../services/isp/equipments.service";
import { EquipmentPlacementListComponent } from '../equipment-placement-list/equipment-placement-list.component';

@Component({
  selector: 'app-purchase-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    EquipmentPlacementListComponent
  ],
  templateUrl: './purchase-equipment-list.component.html',
  styleUrl: './purchase-equipment-list.component.css'
})
export class PurchaseEquipmentListComponent implements OnInit {
  @Input() purchaseId!: number;
  @Input() isDelivered = false;

  purchaseEquipments: PurchaseEquipmentDto[] = [];
  equipments: EquipmentDto[] = [];

  constructor(
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      private equipmentsService: EquipmentsService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPurchaseEquipments();
    this.loadEquipments();
  }

  async loadPurchaseEquipments(): Promise<void> {
    this.purchaseEquipments = await this.purchaseEquipmentsService.getByPurchase(this.purchaseId);
  }

  async loadEquipments(): Promise<void> {
    this.equipments = await this.equipmentsService.get();
  }

  addPlacement(purchaseEquipmentId: number): void {
    // const dialogRef = this.dialog.open(AddEquipmentPlacementComponent, {
    //   width: '500px',
    //   data: { purchaseEquipmentId }
    // });
    //
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.loadPurchaseEquipments();
    //   }
    // });
  }

  getEquipment(equipmentId: number) : EquipmentDto | undefined {
    return this.equipments.find(x => x.id === equipmentId);
  }
}