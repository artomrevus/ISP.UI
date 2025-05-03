import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FullInternetConnectionRequestStatus, InternetConnectionRequestStatusDto } from '../../models/isp/internet-connection-request-status.models';
import { environment } from '../../../environments/environment.development';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternetConnectionRequestStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<InternetConnectionRequestStatusDto> {
    return this.http.get<InternetConnectionRequestStatusDto>(`${environment.apiBaseUrl}/internetconnectionrequeststatuses/${id}`);
  }

  async get(): Promise<InternetConnectionRequestStatusDto[]> {    
    return firstValueFrom(this.http.get<InternetConnectionRequestStatusDto[]>(`${environment.apiBaseUrl}/internetconnectionrequeststatuses/all`));
  }

  getByIdFull(id: number): Promise<FullInternetConnectionRequestStatus> {
    return firstValueFrom(this.getById(id));
  }
}
