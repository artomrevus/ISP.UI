import { Injectable } from '@angular/core';
import { UserAccountDto } from '../../models/auth/user-accounts.model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class UserAccountsService {

    constructor(
      private http: HttpClient) {
    }

    async get(): Promise<UserAccountDto[]> {
      return firstValueFrom(this.http.get<UserAccountDto[]>(`${environment.apiBaseUrl}/auth/accounts`));
    }
}