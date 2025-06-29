import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  token: string;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordResetService: PasswordResetService
  ) {
    this.token = this.route.snapshot.params['token'];
    this.createForm();

    // Capture any query param message (optional)
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
    });
  }


  createForm() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const newPassword = this.resetForm.value.password;

    this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { message: 'Password reset successfully' }
        });
      },
      error: (err) => {
        console.error('Reset error:', err);
        this.isLoading = false;

        // Set appropriate error message
        this.errorMessage = err.error?.message || 'Password reset URL expired. Please try again.';
      }
    });
  }

}
