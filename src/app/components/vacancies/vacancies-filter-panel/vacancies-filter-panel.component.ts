import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullVacancyStatus } from '../../../models/isp/vacancy-status.models';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';

@Component({
  selector: 'app-vacancies-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './vacancies-filter-panel.component.html',
  styleUrl: './vacancies-filter-panel.component.css'
})
export class VacanciesFilterPanelComponent implements OnInit {  
  // Filters data
  @Input() vacancyStatuses: FullVacancyStatus[] = [];
  @Input() employeePositions: FullEmployeePosition[] = [];
  
  // Filters output event
  @Output() filtersChanged = new EventEmitter<any>();
  
  filterForm: FormGroup;
  
  get activeFiltersCount(): number {
    let count = 0;
    
    const form = this.filterForm.value;
    
    if (form.vacancyStatusIds?.length) count += form.vacancyStatusIds.length;
    if (form.employeePositionIds?.length) count += form.employeePositionIds.length;
    if (form.numberContains) count += 1;
    if (form.appearanceDateFrom) count += 1;
    if (form.appearanceDateTo) count += 1;
    if (form.monthRateFrom) count += 1;
    if (form.monthRateTo) count += 1;
    if (form.interviewRequestsCountFrom) count += 1;
    if (form.interviewRequestsCountTo) count += 1;
    
    return count;
  }
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      vacancyStatusIds: [[]],
      employeePositionIds: [[]],
      numberContains: [''],
      appearanceDateFrom: [null],
      appearanceDateTo: [null],
      monthRateFrom: [null],
      monthRateTo: [null],
      interviewRequestsCountFrom: [null],
      interviewRequestsCountTo: [null],
      sortBy: ['appearanceDate'],
      ascending: [false]
    });
  }
  
  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => {
    });
  }
  
  applyFilters(): void {
    const filters = this.prepareFilters();
    this.filtersChanged.emit(filters);
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      vacancyStatusIds: [],
      employeePositionIds: [],
      numberContains: '',
      appearanceDateFrom: null,
      appearanceDateTo: null,
      sortBy: 'appearanceDate',
      ascending: false
    });
    
    this.applyFilters();
  }
  
  removeFilter(controlName: string, value?: any): void {
    const control = this.filterForm.get(controlName);
    if (!control) return;
    
    if (Array.isArray(control.value) && value !== undefined) {
      const newValue = control.value.filter((v: any) => v !== value);
      control.setValue(newValue);
    } else {
      control.setValue(controlName.includes('Date') ? null : '');
    }
    
    // Automatic filters after remove
    this.applyFilters();
  }
  
  // Methods to get selected elements to show chips
  getSelectedVacancyStatuses(): FullVacancyStatus[] {
    const selectedIds = this.filterForm.get('vacancyStatusIds')?.value || [];
    return this.vacancyStatuses.filter(item => selectedIds.includes(item.id));
  }

  getSelectedEmployeePositions(): FullEmployeePosition[] {
    const selectedIds = this.filterForm.get('employeePositionIds')?.value || [];
    return this.employeePositions.filter(item => selectedIds.includes(item.id));
  }
  
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
  
  private prepareFilters(): any {
    const formValue = this.filterForm.value;
    
    // Convert dates to api format
    let appearanceDateFrom = null;
    let appearanceDateTo = null;
    
    if (formValue.requestDateFrom) {
      const date = new Date(formValue.appearanceDateFrom);
      appearanceDateFrom = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
    
    if (formValue.requestDateTo) {
      const date = new Date(formValue.appearanceDateTo);
      appearanceDateTo = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
    
    return {
      filters: {
        vacancyStatusIds: formValue.vacancyStatusIds || [],
        employeePositionIds: formValue.employeePositionIds || [],
        numberContains: formValue.numberContains || null,
        appearanceDateFrom: appearanceDateFrom,
        appearanceDateTo: appearanceDateTo,
        monthRateFrom: formValue.monthRateFrom || null,
        monthRateTo: formValue.monthRateTo || null,
        interviewRequestsCountFrom: formValue.interviewRequestsCountFrom || null,
        interviewRequestsCountTo: formValue.interviewRequestsCountTo || null,
      },
      sorting: {
        sortBy: formValue.sortBy,
        ascending: formValue.ascending
      }
    };
  }
}