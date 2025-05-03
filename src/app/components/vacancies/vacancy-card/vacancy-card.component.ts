import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { VacanciesService } from '../../../services/isp/vacancies.service';
import { FullVacancy, VacancyDto } from '../../../models/isp/vacancy.models';
import { FullVacancyStatus, VacancyStatus } from '../../../models/isp/vacancy-status.models';
import { firstValueFrom } from 'rxjs';
import { InterviewRequestListComponent } from '../interview-request-list/interview-request-list.component';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';
import { FullInterviewRequestStatus } from '../../../models/isp/interview-request-status.models';
import { FullContractStatus } from '../../../models/isp/contract-status.models';
import { FullInterviewResult } from '../../../models/isp/interview-result.models';
import { FullEmployeeStatus } from '../../../models/isp/employee-status.models';
import { VacancyFormComponent } from '../vacancy-form/vacancy-form.component';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';

@Component({
  selector: 'app-vacancy-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    InterviewRequestListComponent
  ],
  templateUrl: './vacancy-card.component.html',
  styleUrl: './vacancy-card.component.css'
})
export class VacancyCardComponent {

  @Input() vacancy!: FullVacancy;
  @Input() vacancyStatuses!: FullVacancyStatus[];
  @Input() employeePositions!: FullEmployeePosition[];
  @Input() interviewRequestStatuses!: FullInterviewRequestStatus[];
  @Input() contractStatuses!: FullContractStatus[];
  @Input() interviewResults!: FullInterviewResult[];
  @Input() employeeStatuses!: FullEmployeeStatus[];

  VacancyStatus = VacancyStatus;

  constructor(
    private vacanciesService: VacanciesService,
    private monitoringService: MonitoringService,
    private dialog: MatDialog
  ) { }

  async setVacancyStatus(vacancyStatus: string): Promise<void> {
    try {
      // Find status 
      const updatedStatus = this.vacancyStatuses.find(x => x.vacancyStatusName === vacancyStatus);
      if (!updatedStatus) {
        console.error('Vacancy status not found.');
        return;
      }

      // Create update vacancy dto
      let updateDto: VacancyDto = this.vacancy;
      updateDto.vacancyStatusId = updatedStatus.id;

      // Update vacancy
      await firstValueFrom(this.vacanciesService.update(updateDto));

      // Set updated status to vacancy
      this.vacancy.vacancyStatusId = updatedStatus.id;
      this.vacancy.vacancyStatus = updatedStatus;

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Вакансії',
        action: 'Оновлення статусу',
        details: this.formatSetVacancyStatusActivityDetails(this.vacancy)
      };
      
      await firstValueFrom(this.monitoringService.logActivity(activity));
    } catch (error) {
      console.error(error);
    }
  }

  async editVacancy(): Promise<void> {
    const dialogRef = this.dialog.open(VacancyFormComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        vacancyStatuses: this.vacancyStatuses,
        employeePositions: this.employeePositions,
        vacancy: this.vacancy
      }
    });

    // Create a promise from the dialog result
    const vacancyValue = await firstValueFrom(dialogRef.afterClosed());

    if (vacancyValue) {
      this.vacancy = await this.vacanciesService.getByIdFull(vacancyValue.id);
    }
  }


  // ---------------------------------
  // 
  // Monitoring methods
  //
  // ---------------------------------


  formatSetVacancyStatusActivityDetails(vacancy: FullVacancy): string {
    return `Номер вакансії: ${vacancy.number}.\nНовий статус: ${vacancy.vacancyStatus.vacancyStatusName}.`;
  }
}