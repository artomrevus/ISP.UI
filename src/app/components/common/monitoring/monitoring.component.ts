import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MonitoringFilterPanelComponent } from '../monitoring-filter-panel/monitoring-filter-panel.component';
import { AddUserActivityDto, UserActivityDto, UserActivityFilterParameters } from '../../../models/monitoring/activity.models';
import { FullOffice } from '../../../models/isp/office.models';
import { CityDto } from '../../../models/isp/city.models';
import { PaginationParameters } from '../../../models/isp/pagination.models';
import { OfficesService } from '../../../services/isp/offices.service';
import { CitiesService } from '../../../services/isp/cities.service';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { firstValueFrom } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import {DateFormatterService} from "../../../services/common/date-formatter.service";

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatExpansionModule,
    MonitoringFilterPanelComponent,
    MatSidenavModule,
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.css'
})
export class MonitoringComponent implements OnInit {

  // Data
  activities: UserActivityDto[] = [];
  offices: FullOffice[] = [];
  cities: CityDto[] = [];
  isLoading = false;
  
  // Filters
  pageNumber = 1;
  pageSize = 10;
  totalActivities = 0;
  
  currentFilters: UserActivityFilterParameters = {
    officeIds: [],
    cityIds: [],
  };

  paginationParameters: PaginationParameters = { 
    pageNumber: 1,
    pageSize: 10 
  };

  isFilterPanelVisible: boolean = false;

  constructor(
    private monitoringService: MonitoringService,
    private officesService: OfficesService,
    private citiesService: CitiesService,
    private dateFormatterService: DateFormatterService,
  ) {}


  // ---------------------------------
  // 
  // Component initialization methods
  //
  // ---------------------------------


  ngOnInit(): void {
    this.loadActivities();
    this.loadActivitiesCount();
    this.loadFiltersData();
  }

  async loadActivities(): Promise<void> {
    this.isLoading = true;
    try {
      // Get all activities
      const params = this.prepareRequestParams();
      this.activities = await firstValueFrom(this.monitoringService.get(params));

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Моніторинг',
        action: 'Отримання',
        details: this.formatGetActivityDetails(params)
      };
      await firstValueFrom(this.monitoringService.logActivity(activity));
    } catch (error) {
      console.error('Error loading activities.', error);
    }
    this.isLoading = false;
  }

  async loadActivitiesCount(): Promise<void>{
    try {
      const params = this.prepareRequestParams();
      this.totalActivities = await firstValueFrom(this.monitoringService.getCount(params));
    }
    catch (error) {
      console.error('Error loading activities count.', error);
    }
  }

  async loadFiltersData(): Promise<void>{
    try {
      this.offices = await this.officesService.getFull();
      this.cities = await this.citiesService.get();
    }
    catch (error) {
      console.error('Error loading additional data.', error);
    }
  }


  // -----------------------------------------
  // 
  // Filtering and pagination methods
  //
  // -----------------------------------------


  onFiltersChanged(filters: UserActivityFilterParameters): void {
    this.currentFilters = filters;
    this.paginationParameters.pageNumber = 1;
    this.loadActivities();
    this.loadActivitiesCount();
  }

  onPageChange(event: PageEvent): void {
    this.paginationParameters = {
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize
    };
    
    this.loadActivities();
  }

  prepareRequestParams(): any {
    const params: any = {
      pageNumber: this.paginationParameters.pageNumber,
      pageSize: this.paginationParameters.pageSize
    };
    
    const filters = this.currentFilters;

    if (filters.officeIds.length > 0) {
      params.officeIds = filters.officeIds;
    }
    
    if (filters.cityIds.length > 0) {
      params.cityIds = filters.cityIds;
    }
    
    if (filters.userNameContains) {
      params.userNameContains = filters.userNameContains;
    }

    if (filters.roleContains) {
      params.roleContains = filters.roleContains;
    }

    if (filters.actionOnContains) {
      params.actionOnContains = filters.actionOnContains;
    }

    if (filters.actionContains) {
      params.actionContains = filters.actionContains;
    }
    
    if (filters.startDateTime) {
      params.startDateTime = filters.startDateTime.toISOString();
    }
    
    if (filters.endDateTime) {
      params.endDateTime = filters.endDateTime.toISOString();
    }
    
    return params;
  }

  toggleFilterPanel() {
    this.isFilterPanelVisible = !this.isFilterPanelVisible;
  }


  // ------------------
  // 
  // Formatters methods
  //
  // ------------------


  formatDateTime(dateTime: Date | string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  formatDetails(details: string): string {
    try {
      const parsedDetails = JSON.parse(details);
      return JSON.stringify(parsedDetails, null, 2);
    } catch (e) {
      return details;
    }
  }

  formatGetActivityDetails(params: any): string {
    let details = '';
    details += `Номер сторінки: ${params.pageNumber}.\nРозмір сторінки: ${params.pageSize}.\n`
    if (Object.keys(params).length === 2) {
      return details;
    }
    details += 'Параметри фільтрації:\n'

    // Offices details
    if (params.officeIds && params.officeIds.length > 0) {
      const officeNames = params.officeIds.map((id: number) => {
        const office = this.offices.find(x => x.id === id);
        return `${office?.address} (${office?.city.cityName})`;
      });

      details += `Офіси: ${officeNames.join(', ')}.\n`;
    }
    
    // Cities details
    if (params.cityIds && params.cityIds.length > 0) {
      const cityNames = params.cityIds.map((id: number) => {
        const city = this.cities.find(c => c.id === id);
        return `${city?.cityName}`;
      });

      details += `Міста: ${cityNames.join(', ')}.\n`;
    }
    
    // User name details
    if (params.userNameContains) {
      details += `Ім'я користувача: ${params.userNameContains}.\n`;
    }
    
    // Role details
    if (params.roleContains) {
      details += `Роль користувача: ${params.roleContains}.\n`;
    }
    
    // Action on details
    if (params.actionOnContains) {
      details += `Дія над: ${params.actionOnContains}.\n`;
    }
    
    // Action details
    if (params.actionContains) {
      details += `Дія: ${params.actionContains}.\n`;
    }
    
    // Start datetime details
    if (params.startDateTime) {
      const startDate = new Date(params.startDateTime);
      details += `Дата та час від: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}.\n`;
    }

    // End datetime details
    if (params.endDateTime) {
      const endDate = new Date(params.endDateTime);
      details += `Дата та час до: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}.\n`;
    }

    return details;
  }


  // ---------------------------------
  //
  // Export methods
  //
  // ---------------------------------


  async exportAsJson() {
    let exportActivities: any[] = [];
    for (const activity of this.activities) {
      const exportActivity = {
        timestamp: activity.timestamp,
        role: activity.role,
        userName: activity.userName,
        action: activity.action,
        actionOn: activity.actionOn,
        details: activity.details
      }

      exportActivities.push(exportActivity);
    }

    const jsonString = JSON.stringify(exportActivities, null, 2);
    console.log(jsonString)
    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-${this.dateFormatterService.formatDate(new Date())}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }
}