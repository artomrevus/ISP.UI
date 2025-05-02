import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FullOffice } from '../../../models/isp/office.models';
import { OfficesService } from '../../../services/isp/offices.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-contract-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './contract-dialog.component.html',
  styleUrl: './contract-dialog.component.css'
})
export class ContractDialogComponent implements OnInit {

  offices: FullOffice[] = [];

  contractForm: FormGroup;

  constructor(
    private officesService: OfficesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContractDialogComponent>
  ) {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    this.contractForm = this.fb.group({
      officeId: [null, Validators.required],
      monthRate: [null, [Validators.required, Validators.min(1)]],
      conclusionDate: [today, Validators.required],
      startDate: [today, Validators.required],
      endDate: [nextYear, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    this.offices = await this.officesService.getFull();
  }

  onSubmit(): void {
    if (this.contractForm.valid) {
      this.dialogRef.close(this.contractForm.value);
    }
  }
}