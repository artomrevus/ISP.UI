import { Injectable } from '@angular/core';
import { CandidateDto, FullCandidate } from '../../models/isp/candidate.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<CandidateDto> {
    return this.http.get<CandidateDto>(`${environment.apiBaseUrl}/candidates/${id}`);
  }

  getByIdFull(id: number): Promise<FullCandidate> {
    return firstValueFrom(this.getById(id));
  }
}
