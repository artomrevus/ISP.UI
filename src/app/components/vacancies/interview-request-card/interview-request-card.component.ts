import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { InterviewRequestsService } from '../../../services/isp/interview-requests.service';
import { ContractsService } from '../../../services/isp/contracts.service';
import { FullInterviewRequestStatus, InterviewRequestStatus } from '../../../models/isp/interview-request-status.models';
import { FullInterviewRequest, InterviewRequestDto } from '../../../models/isp/interview-request.models';
import { firstValueFrom } from 'rxjs';
import { ContractStatus, FullContractStatus } from '../../../models/isp/contract-status.models';
import { FullInterviewResult, InterviewResult } from '../../../models/isp/interview-result.models';
import { AddContractDto, ContractDto, FullContract } from '../../../models/isp/contract.models';
import { MatIconModule } from '@angular/material/icon';
import { InterviewResultDialogComponent } from '../interview-result-dialog/interview-result-dialog.component';
import { InterviewsService } from '../../../services/isp/interviews.service';
import { AddInterviewDto } from '../../../models/isp/interview.models';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';
import { Guid } from 'js-guid';
import { AddEmployeeDto, FullEmployee } from '../../../models/isp/employee.models';
import { EmployeesService } from '../../../services/isp/employees.service';
import { VacanciesService } from '../../../services/isp/vacancies.service';
import { FullEmployeePosition } from '../../../models/isp/employee-position.models';
import { EmployeeStatus, FullEmployeeStatus } from '../../../models/isp/employee-status.models';
import { AuthEmployeeService } from '../../../services/auth/auth-employee.service';
import { RegisterEmployeeRequestDto } from '../../../models/auth/auth-request.models';
import { CopyWindowService } from '../../../services/common/copy-window.service';
import { MonitoringService } from '../../../services/monitoring/monitoring.service';
import { AddUserActivityDto } from '../../../models/monitoring/activity.models';

@Component({
  selector: 'app-interview-request-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatExpansionModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './interview-request-card.component.html',
  styleUrl: './interview-request-card.component.css'
})
export class InterviewRequestCardComponent {

  @Input() interviewRequest!: FullInterviewRequest;
  @Input() interviewRequestStatuses!: FullInterviewRequestStatus[];
  @Input() contractStatuses!: FullContractStatus[];
  @Input() interviewResults!: FullInterviewResult[];
  @Input() employeePositions!: FullEmployeePosition[];
  @Input() employeeStatuses!: FullEmployeeStatus[];

  InterviewRequestStatus = InterviewRequestStatus;
  ContractStatus = ContractStatus;

  constructor(
    private interviewRequestsService: InterviewRequestsService,
    private contractsService: ContractsService,
    private interviewsService: InterviewsService,
    private employeesService: EmployeesService,
    private vacanciesService: VacanciesService,
    private authEmployeeService: AuthEmployeeService,
    private monitoringService: MonitoringService,
    private dialog: MatDialog,
    private copyWindowService: CopyWindowService
  ) { }


  async setInterviewRequestStatus(interviewRequestStatus: string): Promise<void> {
    try {
      // Find status 
      const updatedStatus = this.interviewRequestStatuses.find(x => x.interviewRequestStatusName === interviewRequestStatus);
      if (!updatedStatus) {
        console.error('Interview request status not found.');
        return;
      }

      // Create update dto
      let updateDto: InterviewRequestDto = this.interviewRequest;
      updateDto.interviewRequestStatusId = updatedStatus.id;

      // Update interview request
      await firstValueFrom(this.interviewRequestsService.update(updateDto));

      // Set updated status to interview request
      this.interviewRequest.interviewRequestStatusId = updatedStatus.id;
      this.interviewRequest.interviewRequestStatus = updatedStatus;

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: `Запити на інтерв'ю`,
        action: 'Оновлення статусу',
        details: this.formatSetInterviewRequestStatusActivityDetails(this.interviewRequest)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));
    } catch (error) {
      console.error(error);
    }
  }


  isShowContractPanel(): boolean {
    return this.interviewRequest.interviewRequestStatus.interviewRequestStatusName === InterviewRequestStatus.ACCEPTED &&
      this.interviewRequest.interview?.interviewResult.interviewResultName === InterviewResult.PASSED;
  }


  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  isContractExpired(): boolean {
    return new Date(this.interviewRequest?.interview?.contract?.endDate!) <= new Date();
  }


  // --------------
  //
  // Dialog windows
  //
  // --------------


  async addInterviewResult(): Promise<void> {
    const dialogRef = this.dialog.open(InterviewResultDialogComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh'
    });

    // Create a promise from the dialog result
    const interviewFormValue = await firstValueFrom(dialogRef.afterClosed());

    if (interviewFormValue) {
      const interviewResult = this.interviewResults.find(x => x.interviewResultName === interviewFormValue.result)
      if (!interviewResult) {
        throw new Error('Unexpected interview result value.');
      }

      const createDto: AddInterviewDto = {
        interviewRequestId: this.interviewRequest.id,
        interviewResultId: interviewResult.id,
        date: this.formatDate(interviewFormValue.date)
      };

      await firstValueFrom(this.interviewsService.create(createDto));
      this.interviewRequest.interview = await this.interviewsService.getFullInterviewByInterviewRequest(this.interviewRequest.id);

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: `Інтерв'ю`,
        action: 'Створення',
        details: this.formatCreateInterviewActivityDetails(this.interviewRequest)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));
    }
  }


  async addContract(): Promise<void> {
    // Open dialog
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh'
    });

    // Get dialog result
    const contractFormValue = await firstValueFrom(dialogRef.afterClosed());

    if (!contractFormValue) {
      return;
    }

    // Get "Active" contract status
    const activeContractStatus = this.contractStatuses.find(x => x.contractStatusName === ContractStatus.ACTIVE)

    if (!activeContractStatus) {
      throw new Error('Unexpected contract status value.');
    }

    if (!this.interviewRequest.interview) {
      throw new Error('Unexpected interview value - undefined.');
    }

    // Generate contract number
    const contractNumber = Guid.newGuid().toString();

    // Generate employee
    const employee = await this.createEmployee(contractFormValue.officeId);

    // Generate contract dto
    const createDto: AddContractDto = {
      contractStatusId: activeContractStatus.id,
      interviewId: this.interviewRequest.interview.id,
      number: contractNumber,
      monthRate: contractFormValue.monthRate,
      conclusionDate: this.formatDate(contractFormValue.conclusionDate),
      startDate: this.formatDate(contractFormValue.startDate),
      endDate: this.formatDate(contractFormValue.endDate),
      employeeId: employee.id
    };

    // Create contract
    await firstValueFrom(this.contractsService.create(createDto));

    // Load updated interview
    this.interviewRequest.interview = await this.interviewsService.getFullInterviewByInterviewRequest(this.interviewRequest.id);

    // Create employee account
    await this.registerUser(employee.id);

    // Log creation activity
    if (!this.interviewRequest.interview || !this.interviewRequest.interview.contract) {
      throw new Error('Expected to contract was created.');
    }

    const activity: AddUserActivityDto = {
      actionOn: `Контракт`,
      action: 'Створення',
      details: this.formatCreateContractActivityDetails(this.interviewRequest)
    };

    await firstValueFrom(this.monitoringService.logActivity(activity));
  }


  async createEmployee(officeId: number): Promise<FullEmployee> {
    // Get vacancy position
    const employeePositionId = (await firstValueFrom(this.vacanciesService.getById(this.interviewRequest.vacancyId))).employeePositionId;

    // Get "Active" employee status
    const activeEmployeeStatus = this.employeeStatuses.find(x => x.employeeStatusName === EmployeeStatus.ACTIVE)
    if (!activeEmployeeStatus) {
      throw new Error('Unexpected contract status value.');
    }

    // Create employee dto
    const createDto: AddEmployeeDto = {
      employeePositionId: employeePositionId,
      employeeStatusId: activeEmployeeStatus.id,
      officeId: officeId
    }

    // Create employee
    const createdEmployee = await firstValueFrom(this.employeesService.create(createDto));

    // Return full employee
    return this.employeesService.getByIdFullWithoutData(createdEmployee.id);
  }


  async registerUser(employeeId: number): Promise<void> {
    // Get employee data
    const employeeData = await this.employeesService.getEmployeeData(employeeId);
    
    // Generate user password
    const password = Guid.newGuid().toString();

    // Create register dto
    const registerDto: RegisterEmployeeRequestDto = {
      userName: employeeData.email,
      password: password,
      employeeId: employeeId
    };

    // Create new employee account
    await firstValueFrom(this.authEmployeeService.register(registerDto));

    // Show account data copy window
    this.copyWindowService.showCopyWindow(`Дані для входу в систему:\nІм'я користувача: ${employeeData.email}\nПароль: ${password}`);
  }


  // ---------------------------------
  // 
  // Finish contract methods
  //
  // ---------------------------------


  async finishContract(contractStatus: string): Promise<void> { 
    const contract = this.interviewRequest.interview?.contract;
    if(!contract){
      throw new Error('Contract not found, but expected to be created.');
    } 

    await this.terinateEmployee(contract.employeeId);
    await this.deleteUser(contract.employeeId);
    await this.setContractStatus(contract, contractStatus);
  }


  async terinateEmployee(employeeId: number): Promise<void> {
    // Find terminated employee status 
    const terminatedEmployeeStatus = this.employeeStatuses.find(x => x.employeeStatusName === EmployeeStatus.TERMINATED);
    if (!terminatedEmployeeStatus) {
      throw new Error(`Employee status '${EmployeeStatus.TERMINATED}' not found.`);
    }

    // Update employee status
    const employeeToUpdate = await firstValueFrom(this.employeesService.getById(employeeId));
    employeeToUpdate.employeeStatusId = terminatedEmployeeStatus.id;

    await firstValueFrom(this.employeesService.update(employeeToUpdate));
  }


  async deleteUser(employeeId: number): Promise<void> {
    await firstValueFrom(this.authEmployeeService.delete(employeeId.toString()));
  }


  async setContractStatus(contract: FullContract, contractStatus: string): Promise<void> {
    try {
      // Find contract status 
      const newContractStatus = this.contractStatuses.find(x => x.contractStatusName === contractStatus);
      if (!newContractStatus) {
        console.error(`Contract ${contractStatus} status not found.`);
        return;
      }

      // Create update dto
      let updateDto: ContractDto = contract;
      updateDto.contractStatusId = newContractStatus.id;

      // Update contract
      await firstValueFrom(this.contractsService.update(updateDto));

      // Set updated status to contract
      contract.contractStatusId = newContractStatus.id;
      contract.contractStatus = newContractStatus;

      // Log activity
      const activity: AddUserActivityDto = {
        actionOn: `Контракт`,
        action: 'Оновлення статусу',
        details: this.formatSetContractStatusActivityDetails(contract)
      };

      await firstValueFrom(this.monitoringService.logActivity(activity));
    } catch (error) {
      console.error(error);
    }
  }


  // ---------------------------------
  // 
  // Monitoring methods
  //
  // ---------------------------------


  formatSetInterviewRequestStatusActivityDetails(interviewRequest: FullInterviewRequest): string {
    return `Номер запиту на інтерв'ю: ${interviewRequest.number}.\nНовий статус: ${interviewRequest.interviewRequestStatus.interviewRequestStatusName}.`;
  }


  formatSetContractStatusActivityDetails(contract: FullContract): string {
    return `Номер контракту: ${contract.number}.\nНовий статус: ${contract.contractStatus.contractStatusName}.`;
  }


  formatCreateInterviewActivityDetails(interviewRequest: FullInterviewRequest): string {

    let details = `Номер запиту на інтерв'ю: ${interviewRequest.number}.\n`;

    details += `Створене інтерв'ю:\n`
    details += ` Результат інтерв'ю: ${interviewRequest.interview?.interviewResult.interviewResultName}.\n`
    details += ` Дата проведення інтерв'ю: ${interviewRequest.interview?.date}.\n`

    return details;
  }


  formatCreateContractActivityDetails(interviewRequest: FullInterviewRequest): string {

    const candidate = interviewRequest.candidate;
    let details = `Дані кандидата:\n`;
    details += ` Ім'я: ${candidate.firstName}\n`;
    details += ` Прізвище: ${candidate.lastName}\n`;
    details += ` Електронна пошта: ${candidate.email}\n`;
    details += ` Номер телефону: ${candidate.phoneNumber}\n\n`;

    const contract = interviewRequest.interview?.contract!;
    details += `Створений контракт:\n`;
    details += ` Номер контракту: ${contract.number}.\n`;
    details += ` Статус контракту: ${contract.contractStatus.contractStatusName}.\n`
    details += ` Місячна ставка: ${contract.monthRate}.\n`
    details += ` Дата укладання контракту: ${contract.conclusionDate}.\n`
    details += ` Дата початку дії контракту: ${contract.startDate}.\n`
    details += ` Дата завершення дії контракту: ${contract.endDate}.\n\n`

    details += `Офіс працівника: ${interviewRequest.interview?.contract?.employee.office.address} (${interviewRequest.interview?.contract?.employee.office.city.cityName}).\n`

    return details;
  }
}