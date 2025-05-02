import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { InterviewResult } from '../../../models/isp/interview-result.models';

@Component({
  selector: 'app-interview-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './interview-result-dialog.component.html',
  styleUrl: './interview-result-dialog.component.css'
})
export class InterviewResultDialogComponent {
  interviewForm: FormGroup;
  InterviewResult = InterviewResult;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InterviewResultDialogComponent>
  ) {
    this.interviewForm = this.fb.group({
      result: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  onSubmit(): void {
    if (this.interviewForm.valid) {
      this.dialogRef.close(this.interviewForm.value);
    }
  }
}