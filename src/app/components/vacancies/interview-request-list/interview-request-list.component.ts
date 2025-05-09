import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewRequestCardComponent } from '../interview-request-card/interview-request-card.component';
import { InterviewRequestsService } from '../../../services/isp/interview-requests.service';
import { FullInterviewRequest } from '../../../models/isp/interview-request.models';
import { FullVacancyStatus } from '../../../models/isp/vacancy-status.models';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';
import { FullInterviewRequestStatus } from '../../../models/isp/interview-request-status.models';
import { FullContractStatus } from '../../../models/isp/contract-status.models';
import { FullInterviewResult } from '../../../models/isp/interview-result.models';
import { FullEmployeeStatus } from '../../../models/isp/employee-status.models';

@Component({
  selector: 'app-interview-request-list',
  standalone: true,
  imports: [
    CommonModule,
    InterviewRequestCardComponent
  ],
  templateUrl: './interview-request-list.component.html',
  styleUrl: './interview-request-list.component.css'
})
export class InterviewRequestListComponent implements OnInit {
  
  @Input() vacancyId!: number;
  @Input() vacancyStatuses!: FullVacancyStatus[];
  @Input() employeePositions!: FullEmployeePosition[];
  @Input() interviewRequestStatuses!: FullInterviewRequestStatus[];
  @Input() contractStatuses!: FullContractStatus[];
  @Input() interviewResults!: FullInterviewResult[];
  @Input() employeeStatuses!: FullEmployeeStatus[];

  interviewRequests: FullInterviewRequest[] = [];

  constructor(private interviewRequestsService: InterviewRequestsService) { }

  ngOnInit(): void {
    this.loadInterviewRequests();
  }

  async loadInterviewRequests(): Promise<void> {
    this.interviewRequests = await this.interviewRequestsService.getFullByVacancy(this.vacancyId);
  }
}