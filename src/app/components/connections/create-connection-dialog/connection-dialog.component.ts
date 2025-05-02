import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-connection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title class="title">{{ data.title }}</h2>
    <mat-dialog-content class="connection-dialog-content">
      <div class="card-row">
        <span class="label-input">Дата підключення:</span>
        <mat-form-field appearance="outline" class="selection">
          <input matInput [matDatepicker]="connectionDatePicker" [(ngModel)]="connectionData.connectionDate">
          <mat-datepicker-toggle matSuffix [for]="connectionDatePicker"></mat-datepicker-toggle>
          <mat-datepicker #connectionDatePicker></mat-datepicker>
        </mat-form-field>
      </div>
      
      <div class="card-row">
        <span class="label-input">Тариф на підключення:</span>
        <mat-form-field appearance="outline" class="selection">
          <mat-label>Виберіть тариф</mat-label>
          <mat-select [(ngModel)]="connectionData.connectionTariff">
            <mat-option *ngFor="let connectionTariff of activeConnectionTariffs" [value]="connectionTariff">
              {{ connectionTariff.name }} - {{ connectionTariff.price | currency }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    
      <div class="card-row">
        <span class="label-input">Обладнання для підключення:</span>
        <div class="selection">
          <mat-form-field appearance="outline" class="equipment-select">
            <mat-label>Виберіть обладнання</mat-label>
            <mat-select [(ngModel)]="selectedOfficeEquipment">
              <mat-option *ngFor="let officeEquipment of officeEquipments" [value]="officeEquipment">
                {{ officeEquipment.equipment.name }} - {{ officeEquipment.equipment.price | currency }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="equipment-quantity">
            <mat-label>Кількість</mat-label>
            <input matInput type="number" min="1" [(ngModel)]="selectedOfficeEquipmentAmount">
          </mat-form-field>
          
          <button mat-mini-fab color="primary" (click)="addConnectionEquipment()" [disabled]="!selectedOfficeEquipment">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>
      
      <!-- Відображення вибраного обладнання -->
      <div class="selected-equipment" *ngIf="connectionData.connectionEquipments.length > 0">
        <h4>Вибране обладнання:</h4>
        <mat-list>
          <mat-list-item *ngFor="let connectionEquipment of connectionData.connectionEquipments; let i = index" class="equipment-item">
            <div class="equipment-info">
              <span class="equipment-name">{{ connectionEquipment.officeEquipment.equipment.name }}</span>
              <span class="equipment-details">
                {{ connectionEquipment.connectionEquipmentAmount }} шт. x {{ connectionEquipment.officeEquipment.equipment.price| currency }} = 
                {{ connectionEquipment.connectionEquipmentAmount * connectionEquipment.officeEquipment.equipment.price | currency }}
              </span>
            </div>
            <button mat-icon-button color="warn" (click)="removeEquipment(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-list-item>
        </mat-list>
        
        <div class="total-price">
          <strong>Загальна вартість обладнання:</strong> 
          {{ calculateTotalEquipmentPrice() | currency }}
        </div>
      </div>
      
      <div class="card-row">
        <span class="label">Загальна вартість підключення:</span>
        <div class="total-connection-price">
          {{ calculateTotalConnectionPrice() | currency }}
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="buttons-box">
      <button mat-button mat-dialog-close>Скасувати</button>
      <button mat-raised-button color="primary" 
              [disabled]="!connectionData.connectionTariff || !connectionData.connectionDate"
              (click)="saveConnection()">
        <mat-icon>save</mat-icon> Зберегти підключення
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title{
      margin-top: 24px;
      margin-bottom: 18px;
      display: flex;
      align-self: center;
    }

    .connection-dialog-content {
      width: 100%;
      height: 100%;
      padding: 32px;
      box-sizing: border-box;
    }
    
    .buttons-box{
      padding: 0px 32px 32px 0px;
    }
    
    .card-row {
      display: flex;
      margin-bottom: 16px;
      align-items: baseline;
      padding: 4px 0;
    }
    
    .label {
      font-weight: 500;
      margin-right: 8px;
      white-space: nowrap;
    }

    .label-input {
      font-weight: 500;
      margin-right: 24px;
      white-space: nowrap;
    }
    
    .selection {
      display: flex;
      align-items: baseline;
      gap: 8px;
      width: 100%;
    }
    
    .equipment-select {
      flex: 3;
    }
    
    .equipment-quantity {
      flex: 1;
      min-width: 80px;
    }
    
    .selected-equipment {
      margin-top: 16px;
      margin-bottom: 16px;
      padding: 16px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
    }
    
    .selected-equipment h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .equipment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      height: auto !important;
    }
    
    .equipment-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .equipment-name {
      font-weight: 500;
    }
    
    .equipment-details {
      font-size: 0.9em;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .total-price {
      margin-top: 16px;
      text-align: right;
      font-size: 1.1em;
    }
    
    .total-connection-price {
      font-size: 1.2em;
      font-weight: 500;
      color: #3f51b5;
    }
    
    mat-dialog-actions {
      padding: 16px 0 0;
    }
  `]
})
export class ConnectionDialogComponent implements OnInit {

  // Connection data
  connectionData: any = {
    connectionDate: new Date(),
    connectionTariff: null,
    connectionEquipments: []
  };
  
  // Selected
  selectedOfficeEquipment: any = null;
  selectedOfficeEquipmentAmount: number = 1;
  
  // Parent component data
  activeConnectionTariffs: any[] = [];
  officeEquipments: any[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<ConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  
  ngOnInit(): void {
    this.activeConnectionTariffs = this.data.activeConnectionTariffs || [];
    this.officeEquipments = this.data.officeEquipments || [];
  
    if(!this.data.icr.connection){
      return;
    }

    this.connectionData.connectionDate = this.data.icr.connection.connectionDate;
    this.connectionData.connectionEquipments = JSON.parse(JSON.stringify(this.data.icr.connection.connectionEquipments));
    
    const connectionTariff = this.activeConnectionTariffs.find(x => x.id === this.data.icr.connection.connectionTariff.id);
    if(!connectionTariff){
      this.activeConnectionTariffs.push(this.data.icr.connection.connectionTariff)
      this.connectionData.connectionTariff = this.data.icr.connection.connectionTariff;
    } else{
      this.connectionData.connectionTariff = connectionTariff;
    }
  }
  
  addConnectionEquipment(): void {
    if (!this.selectedOfficeEquipment || this.selectedOfficeEquipmentAmount < 1) return;
    
    const existingIndex = this.connectionData.connectionEquipments.findIndex(
      (item: any) => item.officeEquipment.id === this.selectedOfficeEquipment.id
    );
    
    if (existingIndex !== -1) {
      this.connectionData.connectionEquipments[existingIndex].connectionEquipmentAmount += this.selectedOfficeEquipmentAmount;
    } else {
      this.connectionData.connectionEquipments.push({
        officeEquipment: this.selectedOfficeEquipment,
        connectionEquipmentAmount: this.selectedOfficeEquipmentAmount
      });
    }
    
    this.selectedOfficeEquipmentAmount = 1;
  }
  
  removeEquipment(index: number): void {
    if (index >= 0 && index < this.connectionData.connectionEquipments.length) {
      this.connectionData.connectionEquipments.splice(index, 1);
    }
  }
  
  calculateTotalEquipmentPrice(): number {
    return this.connectionData.connectionEquipments.reduce((total: number, item: any) => {
      return total + (item.officeEquipment.equipment.price * item.connectionEquipmentAmount);
    }, 0);
  }
  
  calculateTotalConnectionPrice(): number {
    let total = 0;
    
    if (this.connectionData.connectionTariff) {
      total += this.connectionData.connectionTariff.price;
    }
    
    total += this.calculateTotalEquipmentPrice();
    
    return total;
  }
  
  saveConnection(): void {
    const result = {
      connectionDate: this.connectionData.connectionDate,
      connectionTariffId: this.connectionData.connectionTariff.id,
      totalPrice: this.calculateTotalConnectionPrice(),
      connectionEquipments: this.connectionData.connectionEquipments.map((item: any) => ({
        officeEquipmentId: item.officeEquipment.id,
        connectionEquipmentAmount: item.connectionEquipmentAmount
      }))
    };
    
    this.dialogRef.close(result);
  }
}