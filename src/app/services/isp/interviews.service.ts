import { Injectable } from '@angular/core';
import { AddInterviewDto, FullInterview, InterviewDto } from '../../models/isp/interview.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { InterviewResultsService } from './interview-results.service';
import { ContractStatusesService } from './contract-statuses.service';
import { ContractDto, FullContract } from '../../models/isp/contract.models';
import { EmployeeDto, FullEmployee } from '../../models/isp/employee.models';
import { OfficesService } from './offices.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewsService {

  constructor(
    private http: HttpClient,
    private interviewResultsService: InterviewResultsService,
    private contractStatusesService: ContractStatusesService,
    private officesService: OfficesService) {
  }

  create(dto: AddInterviewDto): Observable<InterviewDto> {
    return this.http.post<InterviewDto>(`${environment.apiBaseUrl}/interviews`, dto);
  }

  async getByInterviewRequest(interviewRequestId: number): Promise<InterviewDto | undefined> {
    let params = new HttpParams();
    params = params.append('interviewRequestIds', interviewRequestId.toString());

    const interviews = await firstValueFrom(this.http.get<InterviewDto[]>(`${environment.apiBaseUrl}/interviews/all`, { params }));
    return interviews.length > 0 ? interviews.at(0) : undefined;
  }

  async getFullInterviewByInterviewRequest(interviewRequestId: number): Promise<FullInterview | undefined> {
    const interviewDto = await this.getByInterviewRequest(interviewRequestId);
    if (!interviewDto) {
      return undefined;
    }

    const fullInterviewResult = await this.interviewResultsService.getByIdFull(interviewDto.interviewResultId);
    const fullContract = await this.getFullContractByInterview(interviewDto.id);

    const fullInterview: FullInterview = {
      id: interviewDto.id,
      interviewRequestId: interviewDto.interviewRequestId,
      interviewResultId: interviewDto.interviewResultId,
      date: interviewDto.date,
      interviewResult: fullInterviewResult,
      contract: fullContract
    };

    return fullInterview;
  }


  //
  //
  // Helper methods
  //
  //

  
  private async getContractByInterview(interviewId: number): Promise<ContractDto | undefined> {
    let params = new HttpParams();
    params = params.append('interviewIds', interviewId.toString());

    const contracts = await firstValueFrom(this.http.get<ContractDto[]>(`${environment.apiBaseUrl}/contracts/all`, { params }));
    return contracts.length > 0 ? contracts.at(0) : undefined;
  }

  private async getFullContractByInterview(interviewId: number): Promise<FullContract | undefined> {
    const contractDto = await this.getContractByInterview(interviewId);
    if (!contractDto) {
      return undefined;
    }

    const fullContractStatus = await this.contractStatusesService.getByIdFull(contractDto.contractStatusId);
    const fullEmployee = await this.getFullEmployeeById(contractDto.employeeId);

    const fullContract: FullContract = {
      id: contractDto.id,
      contractStatusId: contractDto.contractStatusId,
      employeeId: contractDto.employeeId,
      interviewId: contractDto.interviewId,
      number: contractDto.number,
      monthRate: contractDto.monthRate,
      conclusionDate: contractDto.conclusionDate,
      startDate: contractDto.startDate,
      endDate: contractDto.endDate,
      contractStatus: fullContractStatus,
      employee: fullEmployee
    };

    return fullContract;
  }

  private getEmployeeById(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${environment.apiBaseUrl}/employees/${id}`);
  }

  private async getFullEmployeeById(id: number): Promise<FullEmployee> {
    const employeeDto = await firstValueFrom(this.getEmployeeById(id));

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
}
