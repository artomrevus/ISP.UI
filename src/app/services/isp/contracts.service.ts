import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddContractDto, ContractDto } from '../../models/isp/contract.models';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  constructor(
    private http: HttpClient) {
  }

  async getLastByEmployee(employeeId: number): Promise<ContractDto | undefined> {
    let params = new HttpParams();

    // Get employee contracts
    params = params.append('employeeIds', employeeId.toString());

    // Sort by conclusion date (desc)
    params = params.append('sortBy', 'conclusiondate');
    params = params.append('ascending', 'false');

    // Get all employee contracts
    const contracts = await firstValueFrom(this.http.get<ContractDto[]>(`${environment.apiBaseUrl}/contracts/all`, { params }));

    // Return last employee contract
    return contracts.length > 0 ? contracts.at(0) : undefined;
  }

  update(dto: ContractDto): Observable<ContractDto> {
    return this.http.put<ContractDto>(`${environment.apiBaseUrl}/contracts/${dto.id}`, dto);
  }

  create(dto: AddContractDto): Observable<ContractDto> {
    return this.http.post<ContractDto>(`${environment.apiBaseUrl}/contracts`, dto);
  }
}