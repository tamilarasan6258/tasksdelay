import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';



type RegisterResponse = {
  msg: string;
}

type LoginResponse = {
  msg: string;
  token: string;
  user: {
    uname: string;
    email: string;
    id: string;
  };
}

type OTPSendResponse = {
  msg: string;
}

type OTPVerifyResponse = {
  msg: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl ='http://localhost:5000/api/auth';


  private tokenTimer?: Subscription;

  constructor(private http: HttpClient, private router: Router) {
    this.initTokenWatcher(); // Watch token on app load
  }



  register(userData: {
    uname: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
  }

  login(userData: {
    uname: string;
    password: string;
  }): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, userData).subscribe({
        next: res => {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('user', JSON.stringify(res.user));
          this.startTokenWatcher(); // start auto-logout
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }


  sendOTP(email: string): Observable<OTPSendResponse> {
    const payload: { email: string } = { email };
    return this.http.post<OTPSendResponse>(`${this.apiUrl}/send-otp`, payload);
  }

  verifyOTP(email: string, otp: string): Observable<OTPVerifyResponse> {
    const payload: { email: string, otp: string } = { email, otp };
    return this.http.post<OTPVerifyResponse>(`${this.apiUrl}/verify-otp`, payload);
  }

  logout(): void {
    sessionStorage.clear(); 
    this.stopTokenWatcher();
    this.router.navigate(['/login'], {
      queryParams: { message: 'Your session has expired. Please login again.' }
    });
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): { id: string, name: string, email: string } | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.userId || payload.id,
          email: payload.email,
          name: payload.uname || payload.username || payload.name || 'User'
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  private getTokenExpiration(): number | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp; // in seconds
    } catch {
      return null;
    }
  }

  private startTokenWatcher() {
    const exp = this.getTokenExpiration();
    if (!exp) return;

    const expiresIn = exp * 1000 - Date.now(); // milliseconds until expiration

    if (expiresIn > 0) {
      this.tokenTimer = timer(expiresIn).subscribe(() => {
        this.logout();
      });
    } else {
      this.logout();
    }
  }

  private stopTokenWatcher() {
    this.tokenTimer?.unsubscribe();
  }

  private initTokenWatcher() {
    if (this.isAuthenticated()) {
      this.startTokenWatcher();
    }
  }
}
