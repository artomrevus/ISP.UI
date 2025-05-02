import { Injectable } from '@angular/core';
import { FullInterviewResult, InterviewResultDto } from '../../models/isp/interview-result.models';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class InterviewResultsService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<InterviewResultDto> {
    return this.http.get<InterviewResultDto>(`${environment.apiBaseUrl}/interviewresults/${id}`);
  }

  async getByIdFull(id: number): Promise<FullInterviewResult> {
    return firstValueFrom(this.getById(id));
  }

  get(): Observable<InterviewResultDto[]> {    
    return this.http.get<InterviewResultDto[]>(`${environment.apiBaseUrl}/interviewresults/all`);
  }
  
  async getFull(): Promise<FullInterviewResult[]> {    
    return firstValueFrom(this.get());
  }
}
