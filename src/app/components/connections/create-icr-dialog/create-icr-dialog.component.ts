import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FullLocationType } from '../../../models/isp/location-type.models';
import { FullClient } from '../../../models/isp/client.models';
import { FullInternetTariff } from '../../../models/isp/internet-tariff.models';

@Component({
  selector: 'app-create-icr-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './create-icr-dialog.component.html',
  styleUrl: './create-icr-dialog.component.css'
})
export class CreateIcrDialogComponent implements OnInit {

  // Форма даних
  icrData: any = {
    requestDate: new Date(),
    locationType: null,
    client: null,
    internetTariff: null
  };

  // Довідники
  locationTypes: FullLocationType[] = [];
  activeClients: FullClient[] = [];
  activeInternetTariffs: FullInternetTariff[] = [];

  // Фільтровані списки
  filteredClients: FullClient[] = [];
  filteredInternetTariffs: FullInternetTariff[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateIcrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.locationTypes = this.data.locationTypes || [];
    this.activeClients = this.data.activeClients || [];
    this.activeInternetTariffs = this.data.activeInternetTariffs || [];
  }

  onLocationTypeChange(): void {
    this.icrData.client = null;
    this.icrData.internetTariff = null;

    if (!this.icrData.locationType) {
      this.filteredClients = [];
      this.filteredInternetTariffs = [];
      return;
    }

    this.filteredClients = this.activeClients.filter(
      (client: FullClient) => client.location.locationTypeId === this.icrData.locationType.id
    );

    this.filteredInternetTariffs = this.activeInternetTariffs.filter(
      (tariff: FullInternetTariff) => tariff.locationTypeId === this.icrData.locationType.id
    );
  }

  saveRequest(): void {
    const result = {
      requestDate: this.icrData.requestDate,
      locationTypeId: this.icrData.locationType.id,
      clientId: this.icrData.client.id,
      internetTariffId: this.icrData.internetTariff.id
    };
    this.dialogRef.close(result);
  }
}
