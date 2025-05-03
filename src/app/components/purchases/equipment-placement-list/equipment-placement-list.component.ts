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
import {FullEquipmentPlacement} from '../../../models/isp/equipment-placement.models';
import {FullOffice} from "../../../models/isp/office.models";
import {OfficeEquipmentsService} from "../../../services/isp/office-equipments.service";
import {OfficesService} from "../../../services/isp/offices.service";
import {MatSelectModule} from "@angular/material/select";
import {PurchaseEquipmentsService} from "../../../services/isp/purchase-equipments.service";
import {OfficeEquipmentDto} from "../../../models/isp/office-equipment.models";


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
  @Input() purchaseEquipmentId!: number;
  
  placements: FullEquipmentPlacement[] = [];
  offices: FullOffice[] = [];
  displayedColumns: string[] = ['office', 'date', 'amount', 'edit'];
  
  editingPlacementId: number | null = null;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private equipmentPlacementsService: EquipmentPlacementsService,
    private officesService: OfficesService,
    private officesEquipmentsService: OfficeEquipmentsService,
    private purchaseEquipmentsService:  PurchaseEquipmentsService,
  ) {}

  ngOnInit(): void {
    this.loadPlacements();
    this.loadOffices();
    this.initForm();
  }

  async loadPlacements(): Promise<void> {
    this.placements = await this.equipmentPlacementsService.getByPurchaseEquipmentFull(this.purchaseEquipmentId);
  }

  async loadOffices(): Promise<void> {
    this.offices = await this.officesService.getFull();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      equipmentPlacementAmount: [null, [Validators.required]],
      date: [new Date(), Validators.required],
      officeId: [null, [Validators.required]],
    });
  }

  startEditing(placement: FullEquipmentPlacement): void {
    this.editingPlacementId = placement.id;
    this.editForm.patchValue({
      equipmentPlacementAmount: placement.equipmentPlacementAmount,
      date: new Date(placement.date),
      officeId: placement.officeEquipment?.officeId
    });
  }

  cancelEditing(): void {
    this.editingPlacementId = null;
  }

  async savePlacement(): Promise<void> {
    if (this.editForm.valid && this.editingPlacementId) {
      const formValue = this.editForm.value;

      // Find placement
      let placementToUpdate = this.placements.find(x => x.id === this.editingPlacementId);

      if (!placementToUpdate || !placementToUpdate.officeEquipment) {
        console.error('Placement or its data not found.');
        return;
      }

      // Placement data
      const newOfficeId = formValue.officeId;
      const oldOfficeId = placementToUpdate.officeEquipment.officeId;
      const equipmentId = placementToUpdate.officeEquipment.equipmentId;
      const newPlacementAmount = formValue.equipmentPlacementAmount;
      const oldPlacementAmount = placementToUpdate.equipmentPlacementAmount;
      const newDate = this.formatDate(formValue.date)

      await this.EnsureEnoughPurchaseEquipmentToPlace(placementToUpdate.id, newPlacementAmount);

      // Find office equipment
      let placementOfficeEquipment = await this.officesEquipmentsService.get(newOfficeId, equipmentId);
      if (!placementOfficeEquipment) {
        placementOfficeEquipment = await this.officesEquipmentsService.create({
          officeId: newOfficeId,
          equipmentId: equipmentId,
          officeEquipmentAmount: 0
        });
      }

      // Updated placement office equipment
      await this.updatePlacementOfficeEquipment(placementOfficeEquipment, newOfficeId, oldOfficeId, equipmentId, newPlacementAmount, oldPlacementAmount);

      // Set updated values
      placementToUpdate.officeEquipmentId = placementOfficeEquipment.id;
      placementToUpdate.date = newDate;
      placementToUpdate.equipmentPlacementAmount = newPlacementAmount;

      // Update
      await this.equipmentPlacementsService.update(placementToUpdate);

      // Finish update
      this.editingPlacementId = null;
    }
  }

  async EnsureEnoughPurchaseEquipmentToPlace(placementToUpdateId: number, newPlacementAmount: number): Promise<void> {
    const purchaseEquipment = await this.purchaseEquipmentsService.getById(this.purchaseEquipmentId);

    let totalPlacementsCount = 0;
    for (let equipmentPlacement of this.placements.filter(x => x.id !== placementToUpdateId)) {
      totalPlacementsCount += equipmentPlacement.equipmentPlacementAmount;
    }

    totalPlacementsCount += newPlacementAmount;

    if (totalPlacementsCount > purchaseEquipment.purchaseEquipmentAmount) {
      alert('Не можна розмістити більше обладнання, ніж закуплено.');
      throw new Error('Cant be placed more than in purchase equipment.');
    }
  }

  async updatePlacementOfficeEquipment(
      placementOfficeEquipment: OfficeEquipmentDto,
      newOfficeId: number,
      oldOfficeId: number,
      equipmentId: number,
      newPlacementAmount: number,
      oldPlacementAmount: number)
  {
    if (newOfficeId === oldOfficeId) {
      await this.updateOfficeSamePlacementOfficeEquipment(
          placementOfficeEquipment, newPlacementAmount, oldPlacementAmount);
    } else {
      await this.updateOfficeChangedPlacementOfficeEquipment(
          placementOfficeEquipment, oldOfficeId, equipmentId, newPlacementAmount, oldPlacementAmount);
    }
  }

  async updateOfficeSamePlacementOfficeEquipment(
      placementOfficeEquipment: OfficeEquipmentDto,
      newPlacementAmount: number,
      oldPlacementAmount: number)
  {
    const officeEquipmentAmount = placementOfficeEquipment.officeEquipmentAmount;
    const officeEquipmentDiff = oldPlacementAmount - newPlacementAmount;

    if (placementOfficeEquipment.officeEquipmentAmount < officeEquipmentDiff){
      alert(`Не можна виконати цю дію. В обраному офісі залишилося ${officeEquipmentAmount} од. обраного обладнання.`);
      throw new Error('Cant perform action. In selected office not enough equipment.');
    }

    placementOfficeEquipment.officeEquipmentAmount -= officeEquipmentDiff;
    await this.officesEquipmentsService.update(placementOfficeEquipment);
  }

  async updateOfficeChangedPlacementOfficeEquipment(
      placementOfficeEquipment: OfficeEquipmentDto,
      oldOfficeId: number,
      equipmentId: number,
      newPlacementAmount: number,
      oldPlacementAmount: number)
  {
    let prevOfficeEquipment= await this.officesEquipmentsService.get(oldOfficeId, equipmentId);
    if (!prevOfficeEquipment) {
      throw new Error('Office equipment not found.');
    }

    if (prevOfficeEquipment.officeEquipmentAmount < oldPlacementAmount) {
      alert(`Не можна виконати цю дію. В обраному офісі залишилося ${prevOfficeEquipment.officeEquipmentAmount} од. обраного обладнання.`);
      throw new Error('Cant perform action. In selected office not enough equipment.');
    }

    placementOfficeEquipment.officeEquipmentAmount += newPlacementAmount;
    await this.officesEquipmentsService.update(placementOfficeEquipment);

    prevOfficeEquipment.officeEquipmentAmount -= oldPlacementAmount;
    await this.officesEquipmentsService.update(prevOfficeEquipment);
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
    const officeEquipment = await this.officesEquipmentsService.getById(placement.officeEquipmentId);

    if (officeEquipment.officeEquipmentAmount < placement.equipmentPlacementAmount) {
      alert(`Не можна виконати цю дію. В обраному офісі залишилося ${officeEquipment.officeEquipmentAmount} од. обраного обладнання.`);
      throw new Error('Cant perform action. In selected office not enough equipment.');
    }

    await this.equipmentPlacementsService.delete(placement.id);
    this.placements = this.placements.filter(x => x.id !== placement.id);
  }
}