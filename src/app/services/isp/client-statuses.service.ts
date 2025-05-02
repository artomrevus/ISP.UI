import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientStatusDto, FullClientStatus } from '../../models/isp/client-status.models';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ClientStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<ClientStatusDto> {
    return this.http.get<ClientStatusDto>(`${environment.apiBaseUrl}/clientstatuses/${id}`);
  }

  async get(): Promise<ClientStatusDto[]> {    
    return firstValueFrom(this.http.get<ClientStatusDto[]>(`${environment.apiBaseUrl}/clientstatuses/all`));
  }

  getByIdFull(id: number): Promise<FullClientStatus> {
    return firstValueFrom(this.getById(id));
  }
}
