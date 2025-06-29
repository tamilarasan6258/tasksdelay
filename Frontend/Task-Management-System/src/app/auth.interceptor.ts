// import { Injectable } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';

// import { Router } from '@angular/router';
// import { AuthService } from './services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token'); // ✅ updated

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

