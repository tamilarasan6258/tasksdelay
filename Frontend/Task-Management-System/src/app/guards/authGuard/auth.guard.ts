import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  } 
  else {
    const expired = sessionStorage.getItem('sessionExpired');
    const message = expired
      ? 'Your session has expired. Please login again.'
      : 'Please login to access this page.';

    sessionStorage.removeItem('sessionExpired'); 

    router.navigate(['/login'], {
      queryParams: { message }
    });

    return false;
  }
};
