import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginEmployeeResponseDto, RegisterEmployeeResponseDto } from '../../models/auth/auth-response.models';
import { LoginRequestDto, RegisterEmployeeRequestDto } from '../../models/auth/auth-request.models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthEmployeeService {

  constructor(
    private http: HttpClient){
  }

  login(dto : LoginRequestDto): Observable<LoginEmployeeResponseDto> {
    return this.http.post<LoginEmployeeResponseDto>(`${environment.apiBaseUrl}/auth/login/employee`, dto);
  }

  register(dto : RegisterEmployeeRequestDto): Observable<RegisterEmployeeResponseDto> {
    return this.http.post<RegisterEmployeeResponseDto>(`${environment.apiBaseUrl}/auth/register/employee`, dto);
  }

  delete(employeeId: string) {
    return this.http.delete(`${environment.apiBaseUrl}/auth/delete/${employeeId}`);
  }

  saveLogin(dto: LoginEmployeeResponseDto): void {
    localStorage.setItem('user-id', dto.userId);
    localStorage.setItem('employee-id', dto.employeeId);
    localStorage.setItem('user-name', dto.userName);
    localStorage.setItem('role', dto.role);
    localStorage.setItem('token', `Bearer ${dto.token}`);
  }

  getLogin(): LoginEmployeeResponseDto | undefined {
    const userId = localStorage.getItem('user-id');
    const employeeId = localStorage.getItem('employee-id');
    const userName = localStorage.getItem('user-name');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if(userId && employeeId && userName && role && token) {
      return {
        userId: userId,
        employeeId: employeeId,
        userName: userName,
        role: role,
        token: token
      }
    }

    return undefined;
  }

  isLoginValid(dto: LoginEmployeeResponseDto, expectedRole: string): boolean {
    const token = dto.token;
    if (!token) {
      return false;
    }
    
    try {
      const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
      const decodedToken: any = jwtDecode(tokenValue);
      
      const expirationDate = decodedToken.exp;
      const currentDate = Math.floor(Date.now() / 1000);
      
      return expirationDate > currentDate && dto.role === expectedRole;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    localStorage.clear();
  }
}