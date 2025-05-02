import { Injectable } from '@angular/core';
import { EmployeePositionDto, FullEmployeePosition } from '../../models/isp/employee-position.models';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EmployeePositionsService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<EmployeePositionDto> {
    return this.http.get<EmployeePositionDto>(`${environment.apiBaseUrl}/employeepositions/${id}`);
  }

  get(): Observable<EmployeePositionDto[]> {    
    return this.http.get<EmployeePositionDto[]>(`${environment.apiBaseUrl}/employeepositions/all`);
  }
  
  async getFull(): Promise<FullEmployeePosition[]> {    
    return firstValueFrom(this.get());
  }

  getByIdFull(id: number): Promise<FullEmployeePosition> {
     return firstValueFrom(this.getById(id));
  }
}
