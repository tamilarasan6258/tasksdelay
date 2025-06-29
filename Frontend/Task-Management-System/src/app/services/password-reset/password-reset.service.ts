
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = 'https://taskapp-backend-j7x5.onrender.com/api/auth';

  constructor(private http: HttpClient) { }

  requestPasswordReset(email: string) {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/reset-password/${token}`, { newPassword });
  }
}
