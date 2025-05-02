import { Injectable } from '@angular/core';
import { ContractStatusDto, FullContractStatus } from '../../models/isp/contract-status.models';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ContractStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<ContractStatusDto> {
    return this.http.get<ContractStatusDto>(`${environment.apiBaseUrl}/contractstatuses/${id}`);
  }

  async getByIdFull(id: number): Promise<FullContractStatus> {
    return firstValueFrom(this.getById(id));
  }

  get(): Observable<ContractStatusDto[]> {    
    return this.http.get<ContractStatusDto[]>(`${environment.apiBaseUrl}/contractstatuses/all`);
  }
  
  async getFull(): Promise<FullContractStatus[]> {    
    return firstValueFrom(this.get());
  }
}
