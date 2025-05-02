import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { FullInterviewRequestStatus, InterviewRequestStatusDto } from '../../models/isp/interview-request-status.models';

@Injectable({
  providedIn: 'root'
})
export class InterviewRequestStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<InterviewRequestStatusDto> {
    return this.http.get<InterviewRequestStatusDto>(`${environment.apiBaseUrl}/interviewrequeststatuses/${id}`);
  }

  async getByIdFull(id: number): Promise<FullInterviewRequestStatus> {
    return firstValueFrom(this.getById(id));
  }

  get(): Observable<InterviewRequestStatusDto[]> {    
    return this.http.get<InterviewRequestStatusDto[]>(`${environment.apiBaseUrl}/interviewrequeststatuses/all`);
  }
  
  async getFull(): Promise<FullInterviewRequestStatus[]> {    
    return firstValueFrom(this.get());
  }
}
