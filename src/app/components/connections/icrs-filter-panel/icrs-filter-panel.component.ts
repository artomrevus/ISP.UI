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
import { FullInternetTariff } from '../../../models/isp/internet-tariff.models';
import { InternetConnectionRequestStatusDto } from '../../../models/isp/internet-connection-request-status.models';
import { ClientStatusDto } from '../../../models/isp/client-status.models';
import { LocationTypeDto } from '../../../models/isp/location-type.models';
import { CityDto } from '../../../models/isp/city.models';
import { InternetTariffStatusDto } from '../../../models/isp/internet-tariff-status.models';

@Component({
  selector: 'app-icrs-filter-panel',
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
  templateUrl: './icrs-filter-panel.component.html',
  styleUrls: ['./icrs-filter-panel.component.css']
})
export class IcrsFilterPanelComponent implements OnInit {  
  // Filters data
  @Input() internetTariffs: FullInternetTariff[] = [];
  @Input() internetTariffStatuses: InternetTariffStatusDto[] = [];
  @Input() requestStatuses: InternetConnectionRequestStatusDto[] = [];
  @Input() clientStatuses: ClientStatusDto[] = [];
  @Input() locationTypes: LocationTypeDto[] = [];
  @Input() cities: CityDto[] = [];
  
  // Filters output event
  @Output() filtersChanged = new EventEmitter<any>();
  
  filterForm: FormGroup;
  
  get activeFiltersCount(): number {
    let count = 0;
    
    const form = this.filterForm.value;
    
    if (form.internetTariffIds?.length) count += form.internetTariffIds.length;
    if (form.internetTariffStatusIds?.length) count += form.internetTariffStatusIds.length;
    if (form.internetConnectionRequestStatusIds?.length) count += form.internetConnectionRequestStatusIds.length;
    if (form.clientStatusIds?.length) count += form.clientStatusIds.length;
    if (form.locationTypeIds?.length) count += form.locationTypeIds.length;
    if (form.cityIds?.length) count += form.cityIds.length;
    if (form.numberContains) count += 1;
    if (form.requestDateFrom) count += 1;
    if (form.requestDateTo) count += 1;
    
    return count;
  }
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      internetTariffIds: [[]],
      internetTariffStatusIds: [[]],
      internetConnectionRequestStatusIds: [[]],
      clientStatusIds: [[]],
      locationTypeIds: [[]],
      cityIds: [[]],
      numberContains: [''],
      requestDateFrom: [null],
      requestDateTo: [null],
      sortBy: ['requestDate'],
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
      internetTariffIds: [],
      internetTariffStatusIds: [],
      internetConnectionRequestStatusIds: [],
      clientStatusIds: [],
      locationTypeIds: [],
      cityIds: [],
      numberContains: '',
      requestDateFrom: null,
      requestDateTo: null,
      sortBy: 'requestDate',
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
  getSelectedTariffs(): any[] {
    const selectedIds = this.filterForm.get('internetTariffIds')?.value || [];
    return this.internetTariffs.filter(item => selectedIds.includes(item.id));
  }

  getSelectedTariffStatuses(): any[] {
    const selectedIds = this.filterForm.get('internetTariffStatusIds')?.value || [];
    return this.internetTariffStatuses.filter(item => selectedIds.includes(item.id));
  }
  
  getSelectedRequestStatuses(): any[] {
    const selectedIds = this.filterForm.get('internetConnectionRequestStatusIds')?.value || [];
    return this.requestStatuses.filter(item => selectedIds.includes(item.id));
  }
  
  getSelectedClientStatuses(): any[] {
    const selectedIds = this.filterForm.get('clientStatusIds')?.value || [];
    return this.clientStatuses.filter(item => selectedIds.includes(item.id));
  }
  
  getSelectedLocationTypes(): any[] {
    const selectedIds = this.filterForm.get('locationTypeIds')?.value || [];
    return this.locationTypes.filter(item => selectedIds.includes(item.id));
  }
  
  getSelectedCities(): any[] {
    const selectedIds = this.filterForm.get('cityIds')?.value || [];
    return this.cities.filter(item => selectedIds.includes(item.id));
  }
  
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
  
  private prepareFilters(): any {
    const formValue = this.filterForm.value;
    
    // Convert dates to api format
    let requestDateFrom = null;
    let requestDateTo = null;
    
    if (formValue.requestDateFrom) {
      const date = new Date(formValue.requestDateFrom);
      requestDateFrom = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
    
    if (formValue.requestDateTo) {
      const date = new Date(formValue.requestDateTo);
      requestDateTo = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
    
    return {
      filters: {
        internetTariffIds: formValue.internetTariffIds || [],
        internetTariffStatusIds: formValue.internetTariffStatusIds || [],
        internetConnectionRequestStatusIds: formValue.internetConnectionRequestStatusIds || [],
        clientStatusIds: formValue.clientStatusIds || [],
        locationTypeIds: formValue.locationTypeIds || [],
        cityIds: formValue.cityIds || [],
        numberContains: formValue.numberContains || null,
        requestDateFrom: requestDateFrom,
        requestDateTo: requestDateTo
      },
      sorting: {
        sortBy: formValue.sortBy,
        ascending: formValue.ascending
      }
    };
  }
}