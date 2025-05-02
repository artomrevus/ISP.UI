import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AddUserActivityDto, UserActivityDto } from '../../models/monitoring/activity.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  constructor(
    private http: HttpClient
  ) { }

  get(params: any) : Observable<UserActivityDto[]> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<UserActivityDto[]>(`${environment.apiBaseUrl}/monitoring`, { params: httpParams });
  }
  
  getCount(params: any) : Observable<number> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<number>(`${environment.apiBaseUrl}/monitoring/count`, { params: httpParams });
  }

  logActivity(dto: AddUserActivityDto) {
    return this.http.post(`${environment.apiBaseUrl}/monitoring`, dto);
  }

  private convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          httpParams = httpParams.append(`${key}`, item);
        });
      } else if (value !== null && value !== undefined) {
        httpParams = httpParams.append(key, value);
      }
    });
    
    return httpParams;
  } 
}
