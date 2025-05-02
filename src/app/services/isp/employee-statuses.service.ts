import { Injectable } from '@angular/core';
import { EmployeeStatusDto, FullEmployeeStatus } from '../../models/isp/employee-status.models';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeStatusesService {

  constructor(
    private http: HttpClient) {
  }

  get(): Observable<EmployeeStatusDto[]> {    
    return this.http.get<EmployeeStatusDto[]>(`${environment.apiBaseUrl}/employeestatuses/all`);
  }
    
  async getFull(): Promise<FullEmployeeStatus[]> {    
    return firstValueFrom(this.get());
  }
}
