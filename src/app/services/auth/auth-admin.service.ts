import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    LoginAdminResponseDto,
    LoginEmployeeResponseDto
} from '../../models/auth/auth-response.models';
import { LoginRequestDto } from '../../models/auth/auth-request.models';
import {Observable} from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import {AuthRoles} from "../../models/auth/auth-roles.model";

@Injectable({
    providedIn: 'root'
})
export class AuthAdminService {

    constructor(
        private http: HttpClient){
    }

    login(dto : LoginRequestDto): Observable<LoginAdminResponseDto> {
        return this.http.post<LoginEmployeeResponseDto>(`${environment.apiBaseUrl}/auth/login/admin`, dto);
    }

    saveLogin(dto: LoginAdminResponseDto): void {
        localStorage.setItem('user-id', dto.userId);
        localStorage.setItem('user-name', dto.userName);
        localStorage.setItem('role', dto.role);
        localStorage.setItem('token', `Bearer ${dto.token}`);
    }

    getLogin(): LoginAdminResponseDto | undefined {
        const userId = localStorage.getItem('user-id');
        const userName = localStorage.getItem('user-name');
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');

        if(userId && userName && role && token) {
            return {
                userId: userId,
                userName: userName,
                role: role,
                token: token
            }
        }

        return undefined;
    }

    isLoginValid(dto: LoginAdminResponseDto): boolean {
        const token = dto.token;
        if (!token) {
            return false;
        }

        try {
            const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
            const decodedToken: any = jwtDecode(tokenValue);

            const expirationDate = decodedToken.exp;
            const currentDate = Math.floor(Date.now() / 1000);

            return expirationDate > currentDate && dto.role === AuthRoles.ADMIN;
        } catch (error) {
            return false;
        }
    }

    logout(): void {
        localStorage.clear();
    }
}