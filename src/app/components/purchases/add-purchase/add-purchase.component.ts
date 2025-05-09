import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {FullSupplier} from "../../../models/isp/supplier.models";
import {FullEquipment} from "../../../models/isp/equipment.models";
import {SuppliersService} from "../../../services/isp/suppliers.service";
import {EquipmentsService} from "../../../services/isp/equipments.service";
import {Guid} from "js-guid";
import {DateFormatterService} from "../../../services/common/date-formatter.service";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AddPurchaseDto, PurchaseDto} from "../../../models/isp/purchase.models";
import {PurchaseStatusesService} from "../../../services/isp/purchase-statuses.service";
import {FullPurchaseStatus, PurchaseStatus} from "../../../models/isp/purchase-statuses.models";
import {PurchasesService} from "../../../services/isp/purchases.service";
import {AddPurchaseEquipmentDto, PurchaseEquipmentDto} from "../../../models/isp/purchase-equipments.models";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {AddUserActivityDto} from "../../../models/monitoring/activity.models";
import {firstValueFrom} from "rxjs";
import {VacancyDto} from "../../../models/isp/vacancy.models";
import {MonitoringService} from "../../../services/monitoring/monitoring.service";


@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './add-purchase.component.html',
  styleUrl: './add-purchase.component.css'
})
export class AddPurchaseComponent implements OnInit {
  purchaseForm!: FormGroup;
  suppliers: FullSupplier[] = [];
  availableEquipment: FullEquipment[] = [];
  purchaseStatuses: FullPurchaseStatus[] = [];
  totalPrice = 0;

  constructor(
      private fb: FormBuilder,
      private purchasesService: PurchasesService,
      private suppliersService: SuppliersService,
      private equipmentsService: EquipmentsService,
      private dateFormatter: DateFormatterService,
      private authEmployeeService: AuthEmployeeService,
      private purchaseStatusesService: PurchaseStatusesService,
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      private monitoringService: MonitoringService,
      private dialogRef: MatDialogRef<AddPurchaseComponent>
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadEquipments();
    this.loadPurchaseStatuses();
    this.initForm();
  }

  get equipmentsFormArray(): FormArray {
    return this.purchaseForm.get('equipments') as FormArray;
  }

  async loadSuppliers() {
    this.suppliers = await this.suppliersService.getFull();
  }

  async loadEquipments() {
    this.availableEquipment = await this.equipmentsService.getFull();
  }

  async loadPurchaseStatuses() {
    this.purchaseStatuses = await this.purchaseStatusesService.get();
  }

  initForm(): void {
    this.purchaseForm = this.fb.group({
      supplierId: ['', Validators.required],
      date: [new Date(), Validators.required],
      equipments: this.fb.array([])
    });

    this.addEquipment();
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

  async createPurchase() {
    if (this.purchaseForm.valid && this.equipmentsFormArray.length > 0) {
      const formValue = this.purchaseForm.value;

      // Get login
      const employeeLoginData = this.authEmployeeService.getLogin();
      if (!employeeLoginData){
        console.error('Login data not found.');
        return;
      }

      const purchaseNumber = Guid.newGuid().toString();
      const purchaseStatus = this.purchaseStatuses.find(
          x => x.purchaseStatusName === PurchaseStatus.REQUESTED);

      if (!purchaseStatus) {
        console.error('Purchase status not found.');
        return;
      }

      const newPurchase: AddPurchaseDto = {
        supplierId: formValue.supplierId,
        employeeId: +employeeLoginData.employeeId,
        purchaseStatusId: purchaseStatus.id,
        number: purchaseNumber,
        totalPrice: this.totalPrice,
        date: this.dateFormatter.formatDate(formValue.date),
      };

      const createdPurchase = await this.purchasesService.create(newPurchase);
      const purchaseEquipments = await this.createPurchaseEquipments(createdPurchase.id, formValue.equipments);

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Закупки',
        action: 'Створення закупки',
        details: this.formatCreateActivityDetails(createdPurchase, purchaseEquipments)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));

      this.dialogRef.close(createdPurchase.id);
    }
  }

   async createPurchaseEquipments(purchaseId: number, equipments: any): Promise<PurchaseEquipmentDto[]> {
    let purchaseEquipments: PurchaseEquipmentDto[] = [];
    for(const equipment of equipments) {
      const purchaseEquipment: AddPurchaseEquipmentDto = {
        purchaseId: purchaseId,
        equipmentId: equipment.equipmentId,
        purchaseEquipmentAmount: equipment.amount,
        price: equipment.price * equipment.amount
      }

      purchaseEquipments.push(await this.purchaseEquipmentsService.create(purchaseEquipment));
    }

    return purchaseEquipments;
  }

  formatCreateActivityDetails(purchase: PurchaseDto, purchaseEquipments: PurchaseEquipmentDto[]): string {
    let details = `Створена закупка:\n`;

    details += ` - Номер закупки: ${purchase.number}.\n`
    details += ` - Дата закупки: ${purchase.date}.\n`

    const purchaseStatus = this.purchaseStatuses.find(x => x.id === purchase.purchaseStatusId);
    if (!purchaseStatus) {
      throw new Error('Purchase status not found.');
    }

    details += ` - Статус закупки: ${purchaseStatus.purchaseStatusName}.\n`;

    const supplier = this.suppliers.find(x => x.id === purchase.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found.');
    }

    details += ` - Постачальник: ${supplier.name}.\n`;

    details += ` - Обладнання:\n`

    for (const purchaseEquipment of purchaseEquipments) {
      const equipment = this.availableEquipment.find(x => x.id === purchaseEquipment.equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found.');
      }

      details += `  - Назва: ${equipment.name}. Кількість: ${purchaseEquipment.purchaseEquipmentAmount}. Ціна: ${purchaseEquipment.price}.\n`;
    }

    details += ` - Ціна закупки: ${purchase.totalPrice}.\n`

    return details;
  }

}