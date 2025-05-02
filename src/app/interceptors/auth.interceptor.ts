import { HttpInterceptorFn } from '@angular/common/http';
import { AuthEmployeeService } from '../services/auth/auth-employee.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthEmployeeService);
  
  const token = authService.getLogin()?.token;

  if(token){
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token)
    });

    return next(authReq);
  }

  return next(req);
};
