import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddVacancyDto, FullVacancy, VacancyDto } from '../../models/isp/vacancy.models';
import { environment } from '../../../environments/environment.development';
import { firstValueFrom, Observable } from 'rxjs';
import { EmployeePositionsService } from './employee-positions.service';
import { VacancyStatusesService } from './vacancy-statuses.service';

@Injectable({
  providedIn: 'root'
})
export class VacanciesService {

  constructor(
    private http: HttpClient,
    private vacancyStatusesService: VacancyStatusesService,
    private employeePositionsService: EmployeePositionsService
  ) {
  }

  getById(id: number): Observable<VacancyDto> {
    return this.http.get<VacancyDto>(`${environment.apiBaseUrl}/vacancies/${id}`);
  }

  get(params: any): Observable<VacancyDto[]> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<VacancyDto[]>(`${environment.apiBaseUrl}/vacancies`, { params: httpParams });
  }

  getCount(params: any): Observable<number> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<number>(`${environment.apiBaseUrl}/vacancies/count`, { params: httpParams });
  }

  update(dto: VacancyDto): Observable<VacancyDto> {
    return this.http.put<VacancyDto>(`${environment.apiBaseUrl}/vacancies/${dto.id}`, dto);
  }

  create(dto: AddVacancyDto): Observable<VacancyDto> {
    return this.http.post<VacancyDto>(`${environment.apiBaseUrl}/vacancies`, dto);
  }

  async getByIdFull(id: number): Promise<FullVacancy> {
    const vacancyDto = await firstValueFrom(this.getById(id));

    const fullVacancyStatus = await this.vacancyStatusesService.getByIdFull(vacancyDto.vacancyStatusId);
    const fullEmployeePosition = await this.employeePositionsService.getByIdFull(vacancyDto.employeePositionId);

    const fullVacancy: FullVacancy = {
      id: vacancyDto.id,
      vacancyStatusId: vacancyDto.vacancyStatusId,
      employeePositionId: vacancyDto.employeePositionId,
      monthRate: vacancyDto.monthRate,
      description: vacancyDto.description,
      number: vacancyDto.number,
      appearanceDate: vacancyDto.appearanceDate,
      vacancyStatus: fullVacancyStatus,
      employeePosition: fullEmployeePosition
    };

    return fullVacancy;
  }

  async getFull(params: any): Promise<FullVacancy[]> {

    const vacancyDtos = await firstValueFrom(this.get(params));

    const fullVacancies: FullVacancy[] = [];

    for (const vacancyDto of vacancyDtos) {
      const fullVacancyStatus = await this.vacancyStatusesService.getByIdFull(vacancyDto.vacancyStatusId);
      const fullEmployeePosition = await this.employeePositionsService.getByIdFull(vacancyDto.employeePositionId);

      const fullVacancy: FullVacancy = {
        id: vacancyDto.id,
        vacancyStatusId: vacancyDto.vacancyStatusId,
        employeePositionId: vacancyDto.employeePositionId,
        monthRate: vacancyDto.monthRate,
        description: vacancyDto.description,
        number: vacancyDto.number,
        appearanceDate: vacancyDto.appearanceDate,
        vacancyStatus: fullVacancyStatus,
        employeePosition: fullEmployeePosition
      };

      fullVacancies.push(fullVacancy);
    }

    return fullVacancies;
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
