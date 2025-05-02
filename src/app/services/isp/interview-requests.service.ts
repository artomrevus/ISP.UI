import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { FullInterviewRequest, InterviewRequestDto } from '../../models/isp/interview-request.models';
import { CandidatesService } from './candidates.service';
import { InterviewsService } from './interviews.service';
import { InterviewRequestStatusesService } from './interview-request-statuses.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewRequestsService {

  constructor(
    private http: HttpClient,
    private candidatesService: CandidatesService,
    private interviewRequestStatusesService: InterviewRequestStatusesService,
    private interviewsServise: InterviewsService) {
  }

  getById(id: number): Observable<InterviewRequestDto> {
    return this.http.get<InterviewRequestDto>(`${environment.apiBaseUrl}/interviewrequests/${id}`);
  }

  getByVacancy(vacancyId: number) : Observable<InterviewRequestDto[]>{
    let params = new HttpParams();
    params = params.append('vacancyIds', vacancyId.toString());
    params = params.append('sortBy', 'applicationDate');

    return this.http.get<InterviewRequestDto[]>(`${environment.apiBaseUrl}/interviewrequests/all`, { params });
  }

  update(dto: InterviewRequestDto): Observable<InterviewRequestDto> {
    return this.http.put<InterviewRequestDto>(`${environment.apiBaseUrl}/interviewrequests/${dto.id}`, dto);
  }

  async getFullByVacancy(vacancyId: number) : Promise<FullInterviewRequest[]>{
    const interviewRequestDtos = await firstValueFrom(this.getByVacancy(vacancyId));

    const fullInterviewRequests: FullInterviewRequest[] = [];
    
    for (const interviewRequestDto of interviewRequestDtos) {
      const fullCandidate = await this.candidatesService.getByIdFull(interviewRequestDto.candidateId);
      const fullInterviewRequestStatus = await this.interviewRequestStatusesService.getByIdFull(interviewRequestDto.interviewRequestStatusId);
      const fullInterview = await this.interviewsServise.getFullInterviewByInterviewRequest(interviewRequestDto.id);
          
      const fullInterviewRequest: FullInterviewRequest = {
        id: interviewRequestDto.id,
        vacancyId: interviewRequestDto.vacancyId,
        candidateId: interviewRequestDto.candidateId,
        interviewRequestStatusId: interviewRequestDto.interviewRequestStatusId,
        number: interviewRequestDto.number,
        applicationDate: interviewRequestDto.applicationDate,
        considerationDate: interviewRequestDto.considerationDate,
        candidate: fullCandidate,
        interviewRequestStatus: fullInterviewRequestStatus,
        interview: fullInterview
      };
          
      fullInterviewRequests.push(fullInterviewRequest);
    }
    
    return fullInterviewRequests;
  }
}
