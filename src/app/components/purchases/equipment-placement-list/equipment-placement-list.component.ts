import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EquipmentPlacementsService } from '../../../services/isp/equipment-placements.service';
import {EquipmentPlacementDto, FullEquipmentPlacement} from '../../../models/isp/equipment-placement.models';
import {FullOffice} from "../../../models/isp/office.models";
import {OfficeEquipmentsService} from "../../../services/isp/office-equipments.service";
import {OfficesService} from "../../../services/isp/offices.service";
import {MatSelectModule} from "@angular/material/select";
import {OfficeEquipmentDto} from "../../../models/isp/office-equipment.models";
import {FullPurchaseEquipment} from "../../../models/isp/purchase-equipments.models";
import {AuthRoles} from "../../../models/auth/auth-roles.model";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AddUserActivityDto} from "../../../models/monitoring/activity.models";
import {firstValueFrom} from "rxjs";
import {MonitoringService} from "../../../services/monitoring/monitoring.service";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {EquipmentsService} from "../../../services/isp/equipments.service";

@Component({
  selector: 'app-equipment-placement-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './equipment-placement-list.component.html',
  styleUrl: './equipment-placement-list.component.css'
})
export class EquipmentPlacementListComponent implements OnInit {
  @Input() purchaseEquipment!: FullPurchaseEquipment;
  @Input() equipmentPlacements!: FullEquipmentPlacement[];

  offices: FullOffice[] = [];
  
  editingPlacementId: number | null = null;
  editForm!: FormGroup;

  employeeRole: string = '';
  AuthRoles = AuthRoles;

  constructor(
    private fb: FormBuilder,
    private equipmentPlacementsService: EquipmentPlacementsService,
    private officesService: OfficesService,
    private officesEquipmentsService: OfficeEquipmentsService,
    private authEmployeeService: AuthEmployeeService,
    private monitoringService: MonitoringService,
    private purchaseEquipmentsService: PurchaseEquipmentsService,
    private equipmentsService: EquipmentsService,
  ) {}

  ngOnInit(): void {
    this.loadEmployeeRole();
    this.loadOffices();
    this.initForm();
  }

  async loadEmployeeRole() {
    const login = this.authEmployeeService.getLogin();
    if (login) {
      this.employeeRole = login.role;
    }
  }

  async loadOffices(): Promise<void> {
    this.offices = await this.officesService.getFull();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      equipmentPlacementAmount: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), [Validators.required]]
    });
  }

  startEditing(placement: FullEquipmentPlacement): void {
    this.editingPlacementId = placement.id;
    this.editForm.patchValue({
      equipmentPlacementAmount: placement.equipmentPlacementAmount,
      date: new Date(placement.date)
    });
  }

  cancelEditing(): void {
    this.editingPlacementId = null;
  }

  async savePlacement(): Promise<void> {
    if (this.editForm.valid && this.editingPlacementId) {
      const formValue = this.editForm.value;

      // Find placement
      let placementToUpdate = this.equipmentPlacements.find(
          x => x.id === this.editingPlacementId);

      if (!placementToUpdate || !placementToUpdate.officeEquipment) {
        console.error('Placement or its data not found.');
        return;
      }

      // Placement data
      const newPlacementAmount = formValue.equipmentPlacementAmount;
      const oldPlacementAmount = placementToUpdate.equipmentPlacementAmount;
      const newDate = this.formatDate(formValue.date)

      this.EnsureEnoughPurchaseEquipmentToPlace(placementToUpdate.id, newPlacementAmount);

      // Updated placement office equipment
      await this.updatePlacementOfficeEquipment(placementToUpdate.officeEquipment, newPlacementAmount, oldPlacementAmount);

      // Set updated values
      placementToUpdate.date = newDate;
      placementToUpdate.equipmentPlacementAmount = newPlacementAmount;

      // Update
      await this.equipmentPlacementsService.update(placementToUpdate);

      // Finish update
      this.editingPlacementId = null;

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Розміщення',
        action: 'Оновлення',
        details: await this.formatUpdateActivityDetails(placementToUpdate)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));
    }
  }

  EnsureEnoughPurchaseEquipmentToPlace(placementToUpdateId: number, newPlacementAmount: number) {
    let totalPlacementsCount = 0;
    for (let equipmentPlacement of this.equipmentPlacements.filter(x => x.id !== placementToUpdateId)) {
      totalPlacementsCount += equipmentPlacement.equipmentPlacementAmount;
    }

    totalPlacementsCount += newPlacementAmount;

    if (totalPlacementsCount > this.purchaseEquipment.purchaseEquipmentAmount) {
      alert('Не можна розмістити більше обладнання, ніж закуплено.');
      throw new Error('Cant be placed more than in purchase equipment.');
    }
  }

  async updatePlacementOfficeEquipment(
      officeEquipment: OfficeEquipmentDto,
      newPlacementAmount: number,
      oldPlacementAmount: number)
  {
    const officeEquipmentAmount = officeEquipment.officeEquipmentAmount;
    const officeEquipmentDiff = oldPlacementAmount - newPlacementAmount;

    if (officeEquipment.officeEquipmentAmount < officeEquipmentDiff){
      alert(`Не можна виконати цю дію. В обраному офісі залишилося ${officeEquipmentAmount} од. обраного обладнання.`);
      throw new Error('Cant perform action. In selected office not enough equipment.');
    }

    officeEquipment.officeEquipmentAmount -= officeEquipmentDiff;
    await this.officesEquipmentsService.update(officeEquipment);
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

  async deletePlacement(placement: FullEquipmentPlacement) {
    if (!placement.officeEquipment){
      console.error('Placement office equipment not found.');
      return;
    }

    // Check is valid
    if (placement.officeEquipment.officeEquipmentAmount < placement.equipmentPlacementAmount) {
      alert(`Не можна виконати цю дію. В обраному офісі залишилося ${placement.officeEquipment.officeEquipmentAmount} од. обраного обладнання.`);
      throw new Error('Cant perform action. In selected office not enough equipment.');
    }

    // Update office equipment
    placement.officeEquipment.officeEquipmentAmount -= placement.equipmentPlacementAmount;
    await this.officesEquipmentsService.update(placement.officeEquipment);

    // Delete placement
    await this.equipmentPlacementsService.delete(placement.id);

    // Update data
    this.equipmentPlacements = this.equipmentPlacements.filter(x => x.id !== placement.id);
    this.purchaseEquipment.equipmentPlacements = this.equipmentPlacements;

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Розміщення',
      action: 'Видалення розміщення',
      details: await this.formatDeleteActivityDetails(placement)
    };

    await firstValueFrom(this.monitoringService.logActivity(activity));
  }

  async formatUpdateActivityDetails(equipmentPlacement: FullEquipmentPlacement) {
    let details = `Оновлене розміщення:\n`;

    details += ` - Дата розміщення: ${equipmentPlacement.date}.\n`

    const office = equipmentPlacement.officeEquipment?.office;
    details += ` - Офіс: ${office?.address} (${office?.city.cityName}).\n`;

    const purchaseEquipment = await this.purchaseEquipmentsService.getById(equipmentPlacement.purchaseEquipmentId);
    const equipment = await firstValueFrom(this.equipmentsService.getById(purchaseEquipment.equipmentId));

    details += ` - Назва обладнання: ${equipment.name}.\n`;
    details += ` - Кількість обладнання: ${equipmentPlacement.equipmentPlacementAmount}.\n`
    details += ` - Ціна обладнання: $${purchaseEquipment.price}.\n`

    return details;
  }

  private async formatDeleteActivityDetails(placement: FullEquipmentPlacement) {
    let details = `Видалене розміщення:\n`;

    details += ` - Дата розміщення: ${placement.date}.\n`

    const office = placement.officeEquipment?.office;
    details += ` - Офіс: ${office?.address} (${office?.city.cityName}).\n`;

    const purchaseEquipment = await this.purchaseEquipmentsService.getById(placement.purchaseEquipmentId);
    const equipment = await firstValueFrom(this.equipmentsService.getById(purchaseEquipment.equipmentId));

    details += ` - Назва обладнання: ${equipment.name}.\n`;
    details += ` - Кількість обладнання: ${placement.equipmentPlacementAmount}.\n`
    details += ` - Ціна обладнання: $${purchaseEquipment.price}.\n`

    return details;
  }
}