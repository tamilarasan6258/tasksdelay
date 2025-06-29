import { Component, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { HeaderComponent } from '../header/header.component';

import { AuthService } from '../../services/auth/auth.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-register',
  imports: [HeaderComponent,FooterComponent, FormsModule, CommonModule, RouterModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  uname: string = '';
  email: string = '';
  password: string = '';

  usernameError: string = '';
  emailError: string = '';
  msg: string = '';

  otp: string = '';
  otpMsg: string = '';
  otpVerified: boolean = false;
  otpVerificationMessage: string = ''; 
  otpAttempts: number = 0;
  maxOtpAttempts: number = 5;

  menuOpen = false;
  //ChangeDetectorRef - detect changes after backend errors
  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) { }

  toggleMenu() 
  {
    this.menuOpen = !this.menuOpen;
  }

  register() 
  {
    const user = { uname: this.uname, email: this.email, password: this.password };
    this.auth.register(user).subscribe({
      next: res => {
        this.msg = res.msg;
        this.router.navigate(['/login']);
      },
      error: err => {
        this.msg = err.error.msg || 'Registration failed';
      }
    });
  }

  sendOTP() 
  {
    // Clear previous errors
    this.usernameError = '';
    this.emailError = '';
    this.msg = '';
    
    this.auth.checkUsernameEmail({ uname: this.uname, email: this.email }).subscribe({
      next: res => {
      // Username and email are available — proceed to send OTP
      this.auth.sendOTP({ email: this.email }).subscribe({
          next: res => {
            this.otpMsg = res.msg;
          },
          error: err => {
            this.otpMsg = err.error.msg || 'Failed to send OTP';
          }
        });
      },
      error: err => {
        // Username/email already exist — do NOT send OTP
        this.otpMsg = '';
        this.otpVerificationMessage = '';
        this.otpVerified = false;
        
        const errorMsg = err.error.msg || 'User already exists';
        console.log('Backend error message:', errorMsg);
        
        // Handle specific backend error messages
        if (errorMsg === 'Username and Email already exist') {
          this.usernameError = 'Username already exists';
          this.emailError = 'Email already exists';
        } 
        else if (errorMsg === 'Username already exists') {
          this.usernameError = errorMsg;
          this.emailError = ''; // Clear email error
        } 
        else if (errorMsg === 'Email already exists') {
          this.emailError = errorMsg;
          this.usernameError = ''; // Clear username error
        } 
        else {
          // For any other error, show in general message area
          this.msg = errorMsg;
        }
        // Force change detection
        this.cdr.detectChanges();
      }
    });
  }

  verifyOtp() 
  {
      this.auth.verifyOTP({ email: this.email, otp: this.otp }).subscribe({
      next: res => {
        this.otpVerified = true;
        this.otpVerificationMessage = 'OTP verified successfully';
        this.otpAttempts = 0;
      },
      error: err => {
        this.otpVerified = false;
        this.otpAttempts++;

        if (this.otpAttempts >= this.maxOtpAttempts) 
        {
          this.otpVerificationMessage = 'Too many failed attempts. Please request a new OTP.';
        } 
        else 
        {
          this.otpVerificationMessage = `OTP not matched. ${this.maxOtpAttempts - this.otpAttempts} attempts remaining.`;
        }
      }
    });
  }

  validateUsername(): boolean {
    return this.uname.length >= 6;
  }

  validatePassword(): boolean {
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasNumbers = /\d/.test(this.password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    return this.password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  }

  validateEmail(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.email);
  }

  getPasswordValidationMessage(): string {
    if (this.password.length === 0) return '';

    const messages = [];
    if (this.password.length < 8) messages.push('at least 8 characters');
    if (!/[A-Z]/.test(this.password)) messages.push('at least 1 uppercase letter');
    if (!/[a-z]/.test(this.password)) messages.push('at least 1 lowercase letter');
    if (!/\d/.test(this.password)) messages.push('at least 1 number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) messages.push('at least 1 special character');

    return messages.length > 0 ? 'Password must contain: ' + messages.join(', ') : '';
  }

  // Clear username error when user starts typing
  onUsernameChange() {
    this.usernameError = '';
  }

  // Clear email error when user starts typing
  onEmailChange() {
    this.emailError = '';
  }
}