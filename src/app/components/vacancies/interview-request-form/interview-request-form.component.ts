import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CandidatesService } from '../../../services/isp/candidates.service';
import { FullCandidate } from '../../../models/isp/candidate.models';
import { firstValueFrom } from 'rxjs';
import { FullVacancy } from '../../../models/isp/vacancy.models';
import { FullInterviewRequestStatus, InterviewRequestStatus } from '../../../models/isp/interview-request-status.models';
import { InternetTariffStatus } from '../../../models/isp/internet-tariff-status.models';
import { Guid } from 'js-guid';
import { AddInterviewRequestDto, FullInterviewRequest, InterviewRequestDto } from '../../../models/isp/interview-request.models';
import { InterviewRequestsService } from '../../../services/isp/interview-requests.service';
import { DateFormatterService } from '../../../services/common/date-formatter.service';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { UserAccountsService } from '../../../services/auth/user-accounts.service';

@Component({
  selector: 'app-interview-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './interview-request-form.component.html',
  styleUrl: './interview-request-form.component.css'
})
export class InterviewRequestFormComponent {
  interviewRequestForm: FormGroup;
  candidates: FullCandidate[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private candidatesService: CandidatesService,
    private userAccountsService: UserAccountsService,
    private interviewRequestsService: InterviewRequestsService,
    private monitoringService: MonitoringService,
    private dateFormatter: DateFormatterService,
    private dialogRef: MatDialogRef<InterviewRequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vacancy: FullVacancy, interviewRequestStatuses: FullInterviewRequestStatus[] }
  ) {
    this.interviewRequestForm = this.fb.group({
      applicationDate: [new Date(), Validators.required],
      candidateId: [null, Validators.required]
    });

    this.loadCandidates();
  }

  async loadCandidates() {
    this.isLoading = true;
    try {
      const allCandidates = await this.candidatesService.getFull();
      const activeAccounts = await this.userAccountsService.get();
      
      const workersEmailsSet = new Set(activeAccounts.map(x => x.userName));
      
      this.candidates = allCandidates.filter(x => !workersEmailsSet.has(x.email));
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    // Find pending status
    const interviewRequestStatus = this.data.interviewRequestStatuses.find(x => x.interviewRequestStatusName === InterviewRequestStatus.PENDING);
    if (!interviewRequestStatus) {
      throw new Error('Interview request status not found.');
    }

    const { applicationDate, candidateId } = this.interviewRequestForm.value;
    const number = Guid.newGuid().toString();

    const createDto: AddInterviewRequestDto = {
      vacancyId: this.data.vacancy.id,
      candidateId: candidateId,
      interviewRequestStatusId: interviewRequestStatus.id,
      number: number,
      applicationDate: this.dateFormatter.formatDate(applicationDate)
    };

    // Create vacancy
    const createdInterviewRequest = await firstValueFrom(this.interviewRequestsService.create(createDto))

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: `Запити на інтерв'ю`,
      action: `Створення`,
      details: this.formatCreateInterviewRequestActivityDetails(await this.interviewRequestsService.getByIdFull(createdInterviewRequest.id))
    };

    await firstValueFrom(this.monitoringService.logActivity(activity));

    // Close dialog
    this.dialogRef.close(createdInterviewRequest);
  }

  formatCreateInterviewRequestActivityDetails(interviewRequest: FullInterviewRequest): string {

    let details = `Створений запит на інтерв'ю:\n`;

    details += ` Номер запиту: ${interviewRequest.number}.\n`
    details += ` Статус запиту: ${interviewRequest.interviewRequestStatus.interviewRequestStatusName}\n`;
    details += ` Дата подання: ${interviewRequest.applicationDate}.\n`
    details += ` Кандидат: ${interviewRequest.candidate.email}\n`;

    return details;
  }
}