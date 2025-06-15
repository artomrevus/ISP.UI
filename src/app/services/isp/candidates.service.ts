import { Injectable } from '@angular/core';
import { AddCandidateDto, CandidateDto, CandidateFilterParameters, CandidateSortOptions, FullCandidate } from '../../models/isp/candidate.models';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  async get(): Promise<CandidateDto[]> {
    return firstValueFrom(this.http.get<CandidateDto[]>(`${environment.apiBaseUrl}/candidates/all`));
  }

  async getFiltered(
    filter: CandidateFilterParameters,
    sort: CandidateSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: CandidateDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<CandidateDto[]>(`${environment.apiBaseUrl}/candidates`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/candidates/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: CandidateDto): Promise<CandidateDto> {
    return firstValueFrom(this.http.put<CandidateDto>(`${environment.apiBaseUrl}/candidates/${dto.id}`, dto));
  }

  async create(dto: AddCandidateDto): Promise<CandidateDto> {
    return firstValueFrom(this.http.post<CandidateDto>(`${environment.apiBaseUrl}/candidates`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/candidates/${id}`));
  }

  getByIdFull(id: number): Promise<FullCandidate> {
    return firstValueFrom(this.getById(id));
  }

  async getFull(): Promise<FullCandidate[]> {
    return this.get();
  }

  async getFilteredFull(
    filter: CandidateFilterParameters,
    sort: CandidateSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullCandidate[]; totalCount: number; }> {
    return this.getFiltered(filter, sort, pageNumber, pageSize);
  }

  private convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          httpParams = httpParams.append(`${key}`, item);
        });
      } else if (value) {
        httpParams = httpParams.append(key, value);
      }
    });

    return httpParams;
  }
}
