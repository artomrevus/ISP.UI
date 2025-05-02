import { Injectable } from '@angular/core';
import { AddEmployeeDto, EmployeeData, EmployeeDto, FullEmployee } from '../../models/isp/employee.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { OfficesService } from './offices.service';
import { InterviewsService } from './interviews.service';
import { InterviewRequestsService } from './interview-requests.service';
import { CandidatesService } from './candidates.service';
import { ContractsService } from './contracts.service';
import { InterviewDto } from '../../models/isp/interview.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(
    private http: HttpClient,
    private officesService: OfficesService,
    private interviewRequestsService: InterviewRequestsService,
    private candidatesService: CandidatesService,
    private contractsService: ContractsService) {
  }

  getById(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${environment.apiBaseUrl}/employees/${id}`);
  }

  async getByIdFull(id: number): Promise<FullEmployee> {
    const employeeDto = await firstValueFrom(this.getById(id));

    const fullOffice = await this.officesService.getByIdFull(employeeDto.officeId);
    const employeeData = await this.getEmployeeData(id);

    const fullEmployee: FullEmployee = {
      id: employeeDto.id,
      officeId: employeeDto.officeId,
      employeePositionId: employeeDto.employeePositionId,
      employeeStatusId: employeeDto.employeeStatusId,
      office: fullOffice,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      phoneNumber: employeeData.phoneNumber
    }

    return fullEmployee;
  }

  async getByIdFullWithoutData(id: number): Promise<FullEmployee> {
    const employeeDto = await firstValueFrom(this.getById(id));

    const fullOffice = await this.officesService.getByIdFull(employeeDto.officeId);

    const fullEmployee: FullEmployee = {
      id: employeeDto.id,
      officeId: employeeDto.officeId,
      employeePositionId: employeeDto.employeePositionId,
      employeeStatusId: employeeDto.employeeStatusId,
      office: fullOffice
    }

    return fullEmployee;
  }

  async getEmployeeData(employeeId: number): Promise<EmployeeData> {
    const lastContractDto = await this.contractsService.getLastByEmployee(employeeId);
    if (!lastContractDto) throw new Error(`Contracts for employee with id ${employeeId} could not be loaded.`)

    const interviewDto = await firstValueFrom(this.getInterviewById(lastContractDto.interviewId));
    const interviewRequestDto = await firstValueFrom(this.interviewRequestsService.getById(interviewDto.interviewRequestId));
    const candidateDto = await firstValueFrom(this.candidatesService.getById(interviewRequestDto.candidateId));

    const employeeData: EmployeeData = {
      firstName: candidateDto.firstName,
      lastName: candidateDto.lastName,
      email: candidateDto.email,
      phoneNumber: candidateDto.phoneNumber
    }

    return employeeData;
  }

  getInterviewById(id: number): Observable<InterviewDto> {
    return this.http.get<InterviewDto>(`${environment.apiBaseUrl}/interviews/${id}`);
  }

  create(dto: AddEmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(`${environment.apiBaseUrl}/employees`, dto);
  }

  update(dto: EmployeeDto): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${environment.apiBaseUrl}/employees/${dto.id}`, dto);
  }
}
