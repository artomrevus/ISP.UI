import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { VacanciesService } from '../../../services/isp/vacancies.service';
import { AddVacancyDto, FullVacancy, VacancyDto } from '../../../models/isp/vacancy.models';
import { FullVacancyStatus, VacancyStatus } from '../../../models/isp/vacancy-status.models';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';
import { Guid } from 'js-guid';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';
import { firstValueFrom } from 'rxjs';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { DateFormatterService } from '../../../services/common/date-formatter.service';

@Component({
  selector: 'app-vacancy-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './vacancy-form.component.html',
  styleUrl: './vacancy-form.component.css'
})
export class VacancyFormComponent {
  vacancyStatuses: FullVacancyStatus[];
  employeePositions: FullEmployeePosition[];

  vacancyForm: FormGroup;
  isEditMode: boolean = false;
  existingVacancy?: FullVacancy;

  VacancyStatus = VacancyStatus;

  constructor(
    private fb: FormBuilder,
    private vacanciesService: VacanciesService,
    private monitoringService: MonitoringService,
    private dateFormatter: DateFormatterService,
    private dialogRef: MatDialogRef<VacancyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      vacancyStatuses: FullVacancyStatus[],
      employeePositions: FullEmployeePosition[],
      vacancy?: FullVacancy
    }
  ) {

    this.vacancyStatuses = data.vacancyStatuses;
    this.employeePositions = data.employeePositions;
    this.existingVacancy = data.vacancy;
    this.isEditMode = !!this.existingVacancy;

    this.vacancyForm = this.fb.group({
      employeePositionId: [null, Validators.required],
      monthRate: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });

    // Якщо це режим редагування, заповнюємо форму даними існуючої вакансії
    if (this.isEditMode && this.existingVacancy) {
      this.vacancyForm.patchValue({
        employeePositionId: this.existingVacancy.employeePositionId,
        monthRate: this.existingVacancy.monthRate,
        description: this.existingVacancy.description
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.vacancyForm.invalid) {
      return;
    }

    const employeePositionId = this.vacancyForm.get('employeePositionId')?.value;
    const monthRate = this.vacancyForm.get('monthRate')?.value;
    const description = this.vacancyForm.get('description')?.value;

    if (this.isEditMode && this.existingVacancy) {
      // Create dto
      const updateDto: VacancyDto = {
        ...this.existingVacancy,
        employeePositionId: employeePositionId,
        monthRate: monthRate,
        description: description
      };

      // Update vacancy
      const updatedVacancy = await firstValueFrom(this.vacanciesService.update(updateDto));

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Вакансії',
        action: 'Оновлення',
        details: this.formatUpdateVacancyActivityDetails(updatedVacancy)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));

      // Close dialog
      this.dialogRef.close(updatedVacancy);
    } else {
      // Режим створення
      const vacancyStatus = this.vacancyStatuses.find(x => x.vacancyStatusName === VacancyStatus.DRAFT);
      if (!vacancyStatus) {
        throw new Error('Vacancy status not found.');
      }

      const number = Guid.newGuid().toString();
      const appearanceDate = new Date();

      const createDto: AddVacancyDto = {
        vacancyStatusId: vacancyStatus.id,
        employeePositionId: employeePositionId,
        monthRate: monthRate,
        description: description,
        number: number,
        appearanceDate: this.dateFormatter.formatDate(appearanceDate)
      };

      // Create vacancy
      const createdVacancy = await firstValueFrom(this.vacanciesService.create(createDto))

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: 'Вакансії',
        action: 'Створення',
        details: this.formatCreateVacancyActivityDetails(createdVacancy)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));

      // Close dialog
      this.dialogRef.close(createdVacancy);
    }
  }


  // ---------------------------------
  // 
  // Monitoring methods
  //
  // ---------------------------------


  formatCreateVacancyActivityDetails(vacancy: VacancyDto): string {
   
    let details = `Створена вакансія:\n`;
    
    details += ` Номер вакансії: ${vacancy.number}.\n`

    const vacancyStatus = this.vacancyStatuses.find(x => x.id === vacancy.vacancyStatusId);
    if (!vacancyStatus) {
      throw new Error('Vacancy status not found.');
    }

    details += ` Статус вакансії: ${vacancyStatus.vacancyStatusName}\n`;

    const employeePosition = this.employeePositions.find(x => x.id === vacancy.employeePositionId);
    if (!employeePosition) {
      throw new Error('Vacancy status not found.');
    }

    details += ` Посада працівника: ${employeePosition.employeePositionName}\n`;
    details += ` Місячна ставка: ${vacancy.monthRate}\n`;
    details += ` Дата появи вакансії: ${vacancy.appearanceDate}\n`;
    details += ` Опис вакансії: ${vacancy.description}\n`;

    return details;
  }

  formatUpdateVacancyActivityDetails(vacancy: VacancyDto): string {
    
    let details = `Оновлена вакансія:\n`;
    
    details += ` Номер вакансії: ${vacancy.number}.\n`

    const vacancyStatus = this.vacancyStatuses.find(x => x.id === vacancy.vacancyStatusId);
    if (!vacancyStatus) {
      throw new Error('Vacancy status not found.');
    }

    details += ` Статус вакансії: ${vacancyStatus.vacancyStatusName}\n`;

    const employeePosition = this.employeePositions.find(x => x.id === vacancy.employeePositionId);
    if (!employeePosition) {
      throw new Error('Vacancy status not found.');
    }

    details += ` Посада працівника: ${employeePosition.employeePositionName}\n`;
    details += ` Місячна ставка: ${vacancy.monthRate}\n`;
    details += ` Дата появи вакансії: ${vacancy.appearanceDate}\n`;
    details += ` Опис вакансії: ${vacancy.description}\n`;

    return details;
  }
}