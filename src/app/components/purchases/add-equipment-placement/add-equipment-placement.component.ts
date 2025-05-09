import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {EquipmentPlacementsService} from "../../../services/isp/equipment-placements.service";
import {DateFormatterService} from "../../../services/common/date-formatter.service";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AddEquipmentPlacementDto, EquipmentPlacementDto} from "../../../models/isp/equipment-placement.models";
import {FullPurchaseEquipment} from "../../../models/isp/purchase-equipments.models";
import {EmployeesService} from "../../../services/isp/employees.service";
import {OfficeEquipmentsService} from "../../../services/isp/office-equipments.service";
import {AddUserActivityDto} from "../../../models/monitoring/activity.models";
import {firstValueFrom} from "rxjs";
import {MonitoringService} from "../../../services/monitoring/monitoring.service";
import {EquipmentDto, FullEquipment} from "../../../models/isp/equipment.models";
import {EquipmentsService} from "../../../services/isp/equipments.service";
import {PurchasesService} from "../../../services/isp/purchases.service";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {OfficesService} from "../../../services/isp/offices.service";


@Component({
  selector: 'app-add-equipment-placement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-equipment-placement.component.html',
  styleUrl: './add-equipment-placement.component.css'
})
export class AddEquipmentPlacementComponent implements OnInit {
  placementForm!: FormGroup;

  constructor(
      private fb: FormBuilder,
      private equipmentPlacementsService: EquipmentPlacementsService,
      private authEmployeeService: AuthEmployeeService,
      private dateFormatter: DateFormatterService,
      private employeesService: EmployeesService,
      private officeEquipmentsService: OfficeEquipmentsService,
      private monitoringService: MonitoringService,
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      private equipmentsService: EquipmentsService,
      private officesService: OfficesService,
      private formBuilder: FormBuilder,
      private dialogRef: MatDialogRef<AddEquipmentPlacementComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { purchaseEquipment: FullPurchaseEquipment }
  ) {}

  ngOnInit(): void {
    this.placementForm = this.fb.group({
      equipmentPlacementAmount: ['', [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required]
    });
  }

  async addPlacement() {
    if (this.placementForm.valid) {
      const formValue = this.placementForm.value;

      // Get login
      const employeeLoginData = this.authEmployeeService.getLogin();
      if (!employeeLoginData){
        console.error('Login data not found.');
        return;
      }

      // Get employee
      const employee = await this.employeesService.getById(+employeeLoginData.employeeId);

      // Declare constants
      const employeeId = employee.id;
      const officeId = employee.officeId;
      const equipmentId = this.data.purchaseEquipment.equipmentId;
      const purchaseEquipmentId = this.data.purchaseEquipment.id;
      const placementAmount = formValue.equipmentPlacementAmount;

      this.ensureEnoughPurchaseEquipmentToPlace(placementAmount);

      let officeEquipment = await this.officeEquipmentsService.get(officeId, equipmentId);

      if (!officeEquipment){
        officeEquipment = await this.officeEquipmentsService.create({
          officeId: officeId,
          equipmentId: equipmentId,
          officeEquipmentAmount: 0
        });
      }

      officeEquipment.officeEquipmentAmount += placementAmount;
      await this.officeEquipmentsService.update(officeEquipment);

      const newPlacement: AddEquipmentPlacementDto = {
        employeeId: employeeId,
        purchaseEquipmentId: purchaseEquipmentId,
        officeEquipmentId: officeEquipment.id,
        equipmentPlacementAmount: placementAmount,
        date: this.dateFormatter.formatDate(formValue.date)
      };

      const equipmentPlacement = await this.equipmentPlacementsService.create(newPlacement);

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Розміщення',
        action: 'Створення розміщення',
        details: await this.formatCreateActivityDetails(equipmentPlacement)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));

      this.dialogRef.close(equipmentPlacement.id);
    }
  }

  ensureEnoughPurchaseEquipmentToPlace(amountToAdd: number) {
    if (!this.data.purchaseEquipment.equipmentPlacements) {
      console.error('Equipment placements undefined.');
      return;
    }

    let totalPlacementsCount = 0;
    for (let equipmentPlacement of this.data.purchaseEquipment.equipmentPlacements) {
      totalPlacementsCount += equipmentPlacement.equipmentPlacementAmount;
    }

    if (totalPlacementsCount + amountToAdd > this.data.purchaseEquipment.purchaseEquipmentAmount) {
      alert(`Не можна розмістити більше обладнання, ніж закуплено. Ви ще можете розмістити максимум ${this.data.purchaseEquipment.purchaseEquipmentAmount - totalPlacementsCount} од. цього обладнання.`);
      throw new Error('Cant be placed more than in purchase equipment.');
    }
  }

  async formatCreateActivityDetails(equipmentPlacement: EquipmentPlacementDto) {
    let details = `Створене розміщення:\n`;

    details += ` - Дата розміщення: ${equipmentPlacement.date}.\n`

    const officeEquipment = await this.officeEquipmentsService.getById(equipmentPlacement.officeEquipmentId);
    const office = await this.officesService.getByIdFull(officeEquipment.officeId);

    details += ` - Офіс: ${office.address} (${office.city.cityName}).\n`;

    const purchaseEquipment = await this.purchaseEquipmentsService.getById(equipmentPlacement.purchaseEquipmentId);
    const equipment = await firstValueFrom(this.equipmentsService.getById(purchaseEquipment.equipmentId));

    details += ` - Назва обладнання: ${equipment.name}.\n`;
    details += ` - Кількість обладнання: ${equipmentPlacement.equipmentPlacementAmount}.\n`
    details += ` - Ціна обладнання: $${purchaseEquipment.price}.\n`

    return details;
  }
}