import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {FullPurchaseEquipment, PurchaseEquipmentDto} from "../../../models/isp/purchase-equipments.models";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {EquipmentDto} from "../../../models/isp/equipment.models";
import {EquipmentsService} from "../../../services/isp/equipments.service";
import { EquipmentPlacementListComponent } from '../equipment-placement-list/equipment-placement-list.component';
import {PurchasesService} from "../../../services/isp/purchases.service";
import {FullPurchase} from "../../../models/isp/purchase.models";
import {AddEquipmentPlacementComponent} from "../add-equipment-placement/add-equipment-placement.component";
import {EquipmentPlacementsService} from "../../../services/isp/equipment-placements.service";
import {firstValueFrom} from "rxjs";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AuthRoles} from "../../../models/auth/auth-roles.model";

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
  @Input() purchase!: FullPurchase;
  @Input() purchaseEquipments!: FullPurchaseEquipment[];
  @Input() isPurchaseDelivered = false;

  equipments: EquipmentDto[] = [];

  employeeRole: string = '';
  AuthRoles = AuthRoles;

  constructor(
      private equipmentsService: EquipmentsService,
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      private purchasesService: PurchasesService,
      private equipmentPlacementsService: EquipmentPlacementsService,
      private authEmployeeService: AuthEmployeeService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployeeRole();
    this.loadEquipments();
  }

  async loadEmployeeRole() {
    const login = this.authEmployeeService.getLogin();
    if (login) {
      this.employeeRole = login.role;
    }
  }

  async loadEquipments(): Promise<void> {
    this.equipments = await this.equipmentsService.get();
  }

  async addPlacement(purchaseEquipment: FullPurchaseEquipment) {
    const dialogRef = this.dialog.open(AddEquipmentPlacementComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'equipment-placement-dialog',
      data: { purchaseEquipment },
      disableClose: true
    });

    const createdPlacementId = await firstValueFrom(dialogRef.afterClosed());

    const createdPlacement = await this.equipmentPlacementsService.getByIdFull(createdPlacementId);
    purchaseEquipment.equipmentPlacements = [
      ...(purchaseEquipment.equipmentPlacements || []),
      createdPlacement
    ];
  }

  async deletePurchaseEquipment(purchaseEquipmentId: number) {
    // Delete purchase equipment
    await this.purchaseEquipmentsService.delete(purchaseEquipmentId);

    // Get deleted purchase equipment
    const deletedPurchaseEquipment = this.purchaseEquipments.find(
        x => x.id === purchaseEquipmentId);
    if (!deletedPurchaseEquipment) {
      return;
    }

    // Update purchase
    this.purchase.totalPrice -= deletedPurchaseEquipment.price;
    await this.purchasesService.update(this.purchase);

    // Remove purchase equipment
    this.purchaseEquipments = this.purchaseEquipments.filter(x => x.id !== purchaseEquipmentId);
  }
}