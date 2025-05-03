import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {PurchaseDto} from "../../../models/isp/purchase.models";
import {SupplierDto} from "../../../models/isp/supplier.models";
import {PurchaseStatus, PurchaseStatusDto} from "../../../models/isp/purchase-statuses.models";
import {PurchasesService} from "../../../services/isp/purchases.service";
import {PurchaseStatusesService} from "../../../services/isp/purchase-statuses.service";
import {SuppliersService} from "../../../services/isp/suppliers.service";
import {PurchaseEquipmentListComponent} from "../purchase-equipment-list/purchase-equipment-list.component";

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
  @Input() purchase!: PurchaseDto;
  @Output() statusChange = new EventEmitter<{ purchaseId: number, newStatusId: number }>();
  @Output() purchaseUpdated = new EventEmitter<void>();

  isEditing = false;
  editForm!: FormGroup;

  suppliers: SupplierDto[] = [];
  statuses: PurchaseStatusDto[] = [];
  PurchaseStatus = PurchaseStatus;

  constructor(
      private fb: FormBuilder,
      private purchasesService: PurchasesService,
      private purchaseStatusesService: PurchaseStatusesService,
      private suppliersService: SuppliersService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadStatuses();
    this.initForm();
  }

  async loadSuppliers(): Promise<void> {
    this.suppliers = await this.suppliersService.get();
  }

  async loadStatuses(): Promise<void> {
    this.statuses = await this.purchaseStatusesService.get();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      supplierId: [this.purchase.supplierId, Validators.required],
      date: [new Date(this.purchase.date), Validators.required]
    });
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.initForm();
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  async saveChanges(): Promise<void> {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;

      // Format date to string (YYYY-MM-DD)
      const dateString = `${formValue.date.year}-${formValue.date.month}-${formValue.date.day}`;

      // Set new data
      this.purchase.supplierId = formValue.supplierId;
      this.purchase.date = dateString;

      // Update
      await this.purchasesService.update(this.purchase);

      // Finish update
      this.isEditing = false;
      this.purchaseUpdated.emit();
    }
  }

  changeStatus(newStatusName: string): void {
    const newStatus = this.statuses.find(x => x.purchaseStatusName === newStatusName);

    if (!newStatus) {
      console.error('Purchase status not found.');
      return;
    }

    this.statusChange.emit({
      purchaseId: this.purchase.id,
      newStatusId: newStatus.id
    });
  }

  getStatusName(): string {
    const status = this.statuses.find(x => x.id === this.purchase.purchaseStatusId);
    return status ? status.purchaseStatusName : 'Unknown';
  }

  getStatusClass(): string {
    const statusName = this.getStatusName();

    switch (statusName) {
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

  getSupplier(): SupplierDto | undefined {
     return this.suppliers.find(x => x.id === this.purchase.supplierId);
  }
}
