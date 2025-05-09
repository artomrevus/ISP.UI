import { HttpInterceptorFn } from '@angular/common/http';
import { AuthEmployeeService } from '../services/auth/auth-employee.service';
import { inject } from '@angular/core';
import {UserRolesService} from "../services/auth/user-roles.service";
import {AuthRoles} from "../models/auth/auth-roles.model";
import {AuthAdminService} from "../services/auth/auth-admin.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userRolesService = inject(UserRolesService);
  const userRole = userRolesService.getUserRole();

  if (userRole === AuthRoles.ADMIN) {
    const authService = inject(AuthAdminService);
    const token = authService.getLogin()?.token;

    if(token){
      const authReq = req.clone({
        headers: req.headers.set('Authorization', token)
      });

      return next(authReq);
    }
  }

  if (userRole) {
    const authService = inject(AuthEmployeeService);
    const token = authService.getLogin()?.token;

    if(token){
      const authReq = req.clone({
        headers: req.headers.set('Authorization', token)
      });

      return next(authReq);
    }
  }

  return next(req);
};
