import { Injectable } from '@angular/core';
import { FullVacancyStatus, VacancyStatusDto } from '../../models/isp/vacancy-status.models';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VacancyStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<VacancyStatusDto> {
    return this.http.get<VacancyStatusDto>(`${environment.apiBaseUrl}/vacancystatuses/${id}`);
  }

  get(): Observable<VacancyStatusDto[]> {    
    return this.http.get<VacancyStatusDto[]>(`${environment.apiBaseUrl}/vacancystatuses/all`);
  }

  async getFull(): Promise<FullVacancyStatus[]> {    
    return firstValueFrom(this.get());
  }

  getByIdFull(id: number): Promise<FullVacancyStatus> {
     return firstValueFrom(this.getById(id));
  }
}
