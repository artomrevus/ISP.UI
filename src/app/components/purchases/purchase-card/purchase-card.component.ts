import { Component, Input, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {FullPurchase} from "../../../models/isp/purchase.models";
import {SupplierDto} from "../../../models/isp/supplier.models";
import {PurchaseStatus, PurchaseStatusDto} from "../../../models/isp/purchase-statuses.models";
import {PurchasesService} from "../../../services/isp/purchases.service";
import {PurchaseStatusesService} from "../../../services/isp/purchase-statuses.service";
import {SuppliersService} from "../../../services/isp/suppliers.service";
import {PurchaseEquipmentListComponent} from "../purchase-equipment-list/purchase-equipment-list.component";
import {FullEquipment} from "../../../models/isp/equipment.models";
import {EquipmentsService} from "../../../services/isp/equipments.service";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {AddPurchaseEquipmentDto} from "../../../models/isp/purchase-equipments.models";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AuthRoles} from "../../../models/auth/auth-roles.model";
import {firstValueFrom} from "rxjs";
import {AddUserActivityDto} from "../../../models/monitoring/activity.models";
import {MonitoringService} from "../../../services/monitoring/monitoring.service";

@Component({
  selector: 'app-purchase-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PurchaseEquipmentListComponent
  ],
  templateUrl: './purchase-card.component.html',
  styleUrl: './purchase-card.component.css'
})
export class PurchaseCardComponent implements OnInit {
  @Input() purchase!: FullPurchase;

  isEditing = false;
  editForm!: FormGroup;

  suppliers: SupplierDto[] = [];
  statuses: PurchaseStatusDto[] = [];
  availableEquipment: FullEquipment[] = [];
  totalPrice = 0;
  PurchaseStatus = PurchaseStatus;

  employeeRole: string = '';
  AuthRoles_ = AuthRoles;

  constructor(
      private fb: FormBuilder,
      private purchasesService: PurchasesService,
      private purchaseStatusesService: PurchaseStatusesService,
      private suppliersService: SuppliersService,
      private equipmentsService: EquipmentsService,
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      private monitoringService: MonitoringService,
      private authEmployeeService: AuthEmployeeService,
  ) {}

  ngOnInit(): void {
    this.loadEmployeeRole();
    this.loadSuppliers();
    this.loadStatuses();
    this.loadEquipments();
    this.initForm();
  }

  async loadEmployeeRole() {
    const login = this.authEmployeeService.getLogin();
    if (login) {
      this.employeeRole = login.role;
    }
  }

  async loadSuppliers(): Promise<void> {
    this.suppliers = await this.suppliersService.get();
  }

  async loadStatuses(): Promise<void> {
    this.statuses = await this.purchaseStatusesService.get();
  }

  async loadEquipments(): Promise<void> {
    this.availableEquipment = await this.equipmentsService.getFull();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      supplierId: [this.purchase.supplierId, Validators.required],
      date: [new Date(this.purchase.date), Validators.required],
      equipments: this.fb.array([])
    });
  }

  get equipmentsFormArray(): FormArray {
    return this.editForm.get('equipments') as FormArray;
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.initForm();
    this.loadPurchaseEquipments();
    this.updateTotalPrice();
  }

  loadPurchaseEquipments(): void {
    if (this.purchase.purchaseEquipments && this.purchase.purchaseEquipments.length > 0) {
      const equipmentsArray = this.editForm.get('equipments') as FormArray;

      // Clear existing form array
      while (equipmentsArray.length) {
        equipmentsArray.removeAt(0);
      }

      // Add each purchase equipment to form array
      this.purchase.purchaseEquipments.forEach(pe => {
        const equipment = this.availableEquipment.find(e => e.id === pe.equipmentId);
        const price = equipment ? equipment.price : 0;

        equipmentsArray.push(this.fb.group({
          equipmentId: [pe.equipmentId, Validators.required],
          amount: [pe.purchaseEquipmentAmount, [Validators.required, Validators.min(1)]],
          price: [price]
        }));
      });
    } else {
      // Add at least one empty equipment form
      this.addEquipment();
    }
  }

  addEquipment(): void {
    const equipmentForm = this.fb.group({
      equipmentId: ['', Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]],
      price: [0]
    });

    this.equipmentsFormArray.push(equipmentForm);
  }

  removeEquipment(index: number): void {
    this.equipmentsFormArray.removeAt(index);
    this.updateTotalPrice();
  }

  updatePrice(index: number): void {
    const equipmentControl = this.equipmentsFormArray.at(index);
    const equipmentId = equipmentControl.get('equipmentId')?.value;

    if (equipmentId) {
      const equipment = this.availableEquipment.find(e => e.id === equipmentId);
      if (equipment) {
        equipmentControl.get('price')?.setValue(equipment.price);
        this.updateTotalPrice();
      }
    }
  }

  updateTotalPrice(): void {
    this.totalPrice = 0;

    for (let i = 0; i < this.equipmentsFormArray.length; i++) {
      const control = this.equipmentsFormArray.at(i);
      const price = control.get('price')?.value || 0;
      const amount = control.get('amount')?.value || 0;

      this.totalPrice += price * amount;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  async saveChanges(): Promise<void> {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;

      // Set new data
      this.purchase.supplierId = formValue.supplierId;
      this.purchase.date = this.formatDate(formValue.date);
      this.purchase.totalPrice = this.totalPrice;

      // Update purchase
      await this.purchasesService.update(this.purchase);

      // Update purchase equipments
      await this.updatePurchaseEquipments(formValue.equipments);

      // Finish update
      this.isEditing = false;

      // Load updated
      this.purchase.supplier = await this.suppliersService.getByIdFull(this.purchase.supplierId);

      // Reload purchase to get updated equipment list
      const updatedPurchase = await this.purchasesService.getByIdFull(this.purchase.id);
      if (updatedPurchase) {
        this.purchase.purchaseEquipments = updatedPurchase.purchaseEquipments;
      }

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Закупки',
        action: 'Оновлення закупки',
        details: this.formatUpdateActivityDetails(this.purchase)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));
    }
  }

  private async updatePurchaseEquipments(equipments: any) {
    // First, delete all existing purchase equipments
    if (this.purchase.purchaseEquipments) {
      for (const pe of this.purchase.purchaseEquipments) {
        await this.purchaseEquipmentsService.delete(pe.id);
      }
    }

    // Then create new purchase equipments
    for (const equipment of equipments) {
      const purchaseEquipment: AddPurchaseEquipmentDto = {
        purchaseId: this.purchase.id,
        equipmentId: equipment.equipmentId,
        purchaseEquipmentAmount: equipment.amount,
        price: equipment.price * equipment.amount
      };

      await this.purchaseEquipmentsService.create(purchaseEquipment);
    }
  }

  async changeStatus(newStatusName: string) {
    // Find status to update
    const newStatus = this.statuses.find(x => x.purchaseStatusName === newStatusName);

    if (!newStatus) {
      console.error('Purchase status not found.');
      return;
    }

    // Set new data
    this.purchase.purchaseStatusId = newStatus.id;

    // Update
    await this.purchasesService.update(this.purchase);

    // Load updated
    this.purchase.purchaseStatus = await this.purchaseStatusesService.getByIdFull(this.purchase.purchaseStatusId);

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Закупки',
      action: 'Оновлення статусу закупки',
      details: this.formatUpdateStatusActivityDetails(this.purchase)
    };

    await firstValueFrom(this.monitoringService.logActivity(activity));
  }

  getStatusClass(): string {
    if (!this.purchase.purchaseStatus){
      console.error('Purchase status not found.');
      return '';
    }

    switch (this.purchase.purchaseStatus.purchaseStatusName) {
      case PurchaseStatus.REQUESTED:
        return 'status-requested';
      case PurchaseStatus.APPROVED:
        return 'status-approved';
      case PurchaseStatus.IN_TRANSIT:
        return 'status-in-transit';
      case PurchaseStatus.DELIVERED:
        return 'status-delivered';
      case PurchaseStatus.CANCELED:
        return 'status-canceled';
      default:
        return '';
    }
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected readonly AuthRoles = AuthRoles;

  private formatUpdateActivityDetails(purchase: FullPurchase) {
    let details = `Оновлена закупка:\n`;

    details += ` - Номер закупки: ${purchase.number}.\n`
    details += ` - Дата закупки: ${purchase.date}.\n`
    details += ` - Статус закупки: ${purchase.purchaseStatus?.purchaseStatusName}.\n`;
    details += ` - Постачальник: ${purchase.supplier?.name}.\n`;

    if (!purchase.purchaseEquipments) {
      throw new Error('Purchase equipments not found.');
    }

    details += ` - Обладнання:\n`

    for (const purchaseEquipment of purchase.purchaseEquipments) {
      details += `  - Назва: ${purchaseEquipment.equipment?.name}. Кількість: ${purchaseEquipment.purchaseEquipmentAmount}. Ціна: ${purchaseEquipment.price}.\n`;
    }

    details += ` - Ціна закупки: ${purchase.totalPrice}.\n`

    return details;
  }

  private formatUpdateStatusActivityDetails(purchase: FullPurchase) {
    return `Номер закупки: ${purchase.number}.\nНовий статус: ${purchase.purchaseStatus?.purchaseStatusName}.`;
  }
}