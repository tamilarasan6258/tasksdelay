import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      console.error('HTTP Error:', err);
      if (err.status === 401) {
        sessionStorage.removeItem('token'); // ✅ updated
        router.navigate(['/login'], {
          queryParams: { message: 'Session expired. Please log in again.' }
        });
      }


      return throwError(() => err);
    })
  );
};
