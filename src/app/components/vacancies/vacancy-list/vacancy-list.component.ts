import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { VacancyCardComponent } from '../vacancy-card/vacancy-card.component';
import { VacanciesService } from '../../../services/isp/vacancies.service';
import { firstValueFrom } from 'rxjs';
import { FullVacancy } from '../../../models/isp/vacancy.models';
import { VacancyFormComponent } from '../vacancy-form/vacancy-form.component';
import { FullVacancyStatus } from '../../../models/isp/vacancy-status.models';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';
import { VacancyStatusesService } from '../../../services/isp/vacancy-statuses.service';
import { EmployeePositionsService } from '../../../services/isp/employee-positions.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { VacanciesFilterPanelComponent } from '../vacancies-filter-panel/vacancies-filter-panel.component';
import { FullInterviewResult } from '../../../models/isp/interview-result.models';
import { FullContractStatus } from '../../../models/isp/contract-status.models';
import { ContractStatusesService } from '../../../services/isp/contract-statuses.service';
import { InterviewResultsService } from '../../../services/isp/interview-results.service';
import { InterviewRequestStatusesService } from '../../../services/isp/interview-request-statuses.service';
import { FullInterviewRequestStatus } from '../../../models/isp/interview-request-status.models';
import { FullEmployeeStatus } from '../../../models/isp/employee-status.models';
import { EmployeeStatusesService } from '../../../services/isp/employee-statuses.service';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { HumanResourceHeaderComponent } from '../../human-resource/human-resource-header/human-resource-header.component';


@Component({
  selector: 'app-vacancy-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
    VacancyCardComponent,
    MatIconModule,
    MatSidenavModule,
    HumanResourceHeaderComponent,
    VacanciesFilterPanelComponent
  ],
  templateUrl: './vacancy-list.component.html',
  styleUrl: './vacancy-list.component.css'
})
export class VacancyListComponent implements OnInit {

  vacancies: FullVacancy[] = [];
  currentPage = 0;
  pageSize = 10;
  totalVacancies = 0;

  vacancyStatuses: FullVacancyStatus[] = [];
  employeePositions: FullEmployeePosition[] = [];
  interviewRequestStatuses: FullInterviewRequestStatus[] = [];
  contractStatuses: FullContractStatus[] = [];
  interviewResults: FullInterviewResult[] = [];
  employeeStatuses: FullEmployeeStatus[] = [];

  // Filters
  currentFilters: any = {
    filters: {
      vacancyStatusIds: [],
      employeePositionIds: [],
      numberContains: null,
      appearanceDateFrom: null,
      appearanceDateTo: null
    },
    sorting: {
      sortBy: 'appearanceDate',
      ascending: false
    }
  };

  isFilterPanelVisible: boolean = false;

  constructor(
    private vacanciesService: VacanciesService,
    private vacancyStatusesService: VacancyStatusesService,
    private employeePositionsService: EmployeePositionsService,
    private contractStatusesServices: ContractStatusesService,
    private interviewResultsService: InterviewResultsService,
    private interviewRequestsService: InterviewRequestStatusesService,
    private employeeStatusesService: EmployeeStatusesService,
    private monitoringService: MonitoringService,
    private dialog: MatDialog
  ) {}


  ngOnInit(): void {
    this.loadVacancies();
    this.loadVacanciesCount();
    this.loadAdditionalData();
  }


  async loadVacancies(): Promise<void> {
    const params = this.prepareRequestParams();
    this.vacancies = await this.vacanciesService.getFull(params);
    
    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Вакансії',
      action: 'Отримання',
      details: this.formatGetActivityDetails(params)
    };
     
    await firstValueFrom(this.monitoringService.logActivity(activity));
  }


  async loadVacanciesCount(): Promise<void> {
    const params = this.prepareRequestParams();
    this.totalVacancies = await firstValueFrom(this.vacanciesService.getCount(params));
  }


  async loadAdditionalData(): Promise<void> {
    this.vacancyStatuses = await this.vacancyStatusesService.getFull();
    this.employeePositions = await this.employeePositionsService.getFull();
    this.contractStatuses = await this.contractStatusesServices.getFull();
    this.interviewResults = await this.interviewResultsService.getFull();
    this.interviewRequestStatuses = await this.interviewRequestsService.getFull();
    this.employeeStatuses = await this.employeeStatusesService.getFull();
  }

  toggleFilterPanel(){
    this.isFilterPanelVisible = !this.isFilterPanelVisible;
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVacancies();
  }


  openVacancyForm(): void {
     const dialogRef = this.dialog.open(VacancyFormComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        vacancyStatuses: this.vacancyStatuses,
        employeePositions: this.employeePositions
      }
     });

     dialogRef.afterClosed().subscribe(result => {
       if (result) {
         this.loadVacancies();
         this.loadVacanciesCount();
       }
     });
  }
  

  onFiltersChanged(filterData: any) {
    this.currentFilters = filterData;
    this.currentPage = 0;
    this.loadVacancies();
    this.loadVacanciesCount();
  }


  prepareRequestParams(): any {
    const params: any = {
      pageNumber: this.currentPage + 1,
      pageSize: this.pageSize,
      sortBy: this.currentFilters.sorting.sortBy,
      ascending: this.currentFilters.sorting.ascending
    };
    
    const filters = this.currentFilters.filters;
 

    if (filters.vacancyStatusIds.length > 0) {
      params.vacancyStatusIds = filters.vacancyStatusIds;
    }

    if (filters.employeePositionIds.length > 0) {
      params.employeePositionIds = filters.employeePositionIds;
    }

    if (filters.numberContains) {
      params.numberContains = filters.numberContains;
    }
    
    if (filters.appearanceDateFrom) {
      params.appearanceDateFrom = `${filters.appearanceDateFrom.year}-${filters.appearanceDateFrom.month}-${filters.appearanceDateFrom.day}`;
    }
    
    if (filters.appearanceDateTo) {
      params.appearanceDateTo = `${filters.appearanceDateTo.year}-${filters.appearanceDateTo.month}-${filters.appearanceDateTo.day}`;
    }
    
    if (filters.monthRateFrom) {
      params.monthRateFrom = filters.monthRateFrom;
    }

    if (filters.monthRateTo) {
      params.monthRateTo = filters.monthRateTo;
    }

    if (filters.interviewRequestsCountFrom) {
      params.interviewRequestsCountFrom = filters.interviewRequestsCountFrom;
    }

    if (filters.interviewRequestsCountTo) {
      params.interviewRequestsCountTo = filters.interviewRequestsCountTo;
    }

    return params;
  }


  // ---------------------------------
  // 
  // Monitoring methods
  //
  // ---------------------------------


  formatGetActivityDetails(params: any): string {
    let details = '';
    details += `Номер сторінки: ${params.pageNumber}.\nРозмір сторінки: ${params.pageSize}.\n`
    details += `Сортування по: ${this.getSortingName(params.sortBy)}.\nСортування за: ${(params.ascending ? 'Зростанням' : 'Спаданням')}.\n`
    if (Object.keys(params).length === 4) {
      return details;
    }
    details += 'Параметри фільтрації:\n'


    if (params.vacancyStatusIds && params.vacancyStatusIds.length > 0) {
      const vacancyStatusNames = params.vacancyStatusIds.map((id: number) => {
        const vacancyStatus = this.vacancyStatuses.find(x => x.id === id);
        return `${vacancyStatus?.vacancyStatusName}`;
      });

      details += `Статуси вакансій: ${vacancyStatusNames.join(', ')}.\n`;
    }

    if (params.employeePositionIds && params.employeePositionIds.length > 0) {
      const employeePositionNames = params.employeePositionIds.map((id: number) => {
        const employeePosition = this.employeePositions.find(c => c.id === id);
        return `${employeePosition?.employeePositionName}`;
      });

      details += `Посади працівників: ${employeePositionNames.join(', ')}.\n`;
    }

    if (params.numberContains) {
      details += `Номер вакансії: ${params.numberContains}.\n`;
    }
    
    if (params.appearanceDateFrom) {
      details += `Дата появи вакансії від: ${params.appearanceDateFrom}.\n`;
    }

    if (params.appearanceDateTo) {
      details += `Дата появи вакансії до: ${params.appearanceDateTo}.\n`;
    }

    if (params.monthRateFrom) {
      details += `Місячна ставка від: ${params.monthRateFrom}.\n`;
    }

    if (params.monthRateTo) {
      details += `Місячна ставка до: ${params.monthRateTo}.\n`;
    }

    if (params.interviewRequestsCountFrom) {
      details += `Кількість запитів на інтерв'ю від: ${params.interviewRequestsCountFrom}.\n`;
    }

    if (params.interviewRequestsCountTo) {
      details += `Кількість запитів на інтерв'ю до: ${params.interviewRequestsCountTo}.\n`;
    }

    return details;
  }

  getSortingName(sortBy: string) {
    switch (sortBy) {
      case 'appearanceDate':
        return 'Даті появи вакансії'
      case 'monthRate':
        return 'Місячній ставці'
      case 'interviewRequestsCount':
        return "Кількості запитів на інтерв'ю"
      default:
        return '';
    }
  }
}