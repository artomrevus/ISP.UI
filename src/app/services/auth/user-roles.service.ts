import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserRolesService {
    getUserRole(): string | undefined {
        return localStorage.getItem('role') ?? undefined;
    }
}