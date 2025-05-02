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
import { CityDto } from '../../../models/isp/city.models';
import { FullOffice } from '../../../models/isp/office.models';
import { UserActivityFilterParameters } from '../../../models/monitoring/activity.models';

@Component({
  selector: 'app-monitoring-filter-panel',
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
  templateUrl: './monitoring-filter-panel.component.html',
  styleUrl: './monitoring-filter-panel.component.css'
})
export class MonitoringFilterPanelComponent implements OnInit {  
  
  // Filters data
  @Input() offices: FullOffice[] = [];
  @Input() cities: CityDto[] = [];
  
  // Filters output event
  @Output() filtersChanged = new EventEmitter<any>();
  
  filterForm: FormGroup;
  
  get activeFiltersCount(): number {
    let count = 0;
    
    const form = this.filterForm.value;
    
    if (form.officeIds?.length) count += form.officeIds.length;
    if (form.cityIds?.length) count += form.cityIds.length;
    if (form.userNameContains) count += 1;
    if (form.roleContains) count += 1;
    if (form.actionOnContains) count += 1;
    if (form.actionContains) count += 1;
    if (form.startDate && form.startTime) count += 1;
    if (form.endDate && form.endTime) count += 1;
    
    return count;
  }
  

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      officeIds: [[]],
      cityIds: [[]],
      userNameContains: [''],
      roleContains: [''],
      actionOnContains: [''],
      actionContains: [''],
      startDate: [null],
      startTime: [null],
      endDate: [null],
      endTime: [null]
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
      officeIds: [],
      cityIds: [],
      userNameContains: '',
      roleContains: '',
      actionOnContains: '',
      actionContains: '',
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null
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
      control.setValue(null);
    }
    
    // Automatic filters after remove
    this.applyFilters();
  }
  
  
  private prepareFilters(): UserActivityFilterParameters {
    const formValue = this.filterForm.value;
    
    // Prepare datetime
    let startDateTime: Date | undefined = this.getPreparedStartDateTime();
    let endDateTime: Date | undefined = this.getPreparedEndDateTime();
    
    return {
      officeIds: formValue.officeIds || [],
      cityIds: formValue.cityIds || [],
      userNameContains: formValue.userNameContains || null,
      roleContains: formValue.roleContains || null,
      actionOnContains: formValue.actionOnContains || null,
      actionContains: formValue.actionContains || null,
      startDateTime: startDateTime,
      endDateTime: endDateTime
    };
  }

  // ----------------------------------------------
  //
  // Methods to get selected elements to show chips
  //
  // ----------------------------------------------


  getSelectedOffices(): any[] {
    const selectedIds = this.filterForm.get('officeIds')?.value || [];
    return this.offices.filter(item => selectedIds.includes(item.id));
  }

  getSelectedCities(): any[] {
    const selectedIds = this.filterForm.get('cityIds')?.value || [];
    return this.cities.filter(item => selectedIds.includes(item.id));
  }


  // ----------------
  //
  // DateTime methods
  //
  // ----------------


  hasStartDateTime(): boolean {
    return !!this.filterForm.get('startDate')?.value && !!this.filterForm.get('startTime')?.value;
  }
  
  hasEndDateTime(): boolean {
    return !!this.filterForm.get('endDate')?.value && !!this.filterForm.get('endTime')?.value;
  }

  clearStartDateTime(): void {
    this.filterForm.patchValue({
      startDate: null,
      startTime: null
    });
    this.applyFilters();
  }
  
  clearEndDateTime(): void {
    this.filterForm.patchValue({
      endDate: null,
      endTime: null
    });
    this.applyFilters();
  }

  formatStartDateTime(): string {
    const date = this.filterForm.get('startDate')?.value;
    const time = this.filterForm.get('startTime')?.value;
    
    if (date && time) {
      return `${this.formatDate(date)} ${time}`;
    }
    
    return '';
  }
  
  formatEndDateTime(): string {
    const date = this.filterForm.get('endDate')?.value;
    const time = this.filterForm.get('endTime')?.value;
    
    if (date && time) {
      return `${this.formatDate(date)} ${time}`;
    } 
    
    return '';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getPreparedStartDateTime(): Date | undefined{
    const formValue = this.filterForm.value;
    let startDateTime: Date | undefined = undefined;

    if (formValue.startDate && formValue.startTime) {
      // Init datetime object
      startDateTime = new Date(formValue.startDate);

      // Set time
      const [hours, minutes] = formValue.startTime.split(':');
      startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    }

    return startDateTime;
  }

  getPreparedEndDateTime(): Date | undefined{
    const formValue = this.filterForm.value;
    let endDateTime: Date | undefined = undefined;

    if (formValue.endDate && formValue.endTime) {
      // Init datetime object
      endDateTime = new Date(formValue.endDate);

      // Set time
      const [hours, minutes] = formValue.endTime.split(':');
      endDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    } 

    return endDateTime;
  }
}