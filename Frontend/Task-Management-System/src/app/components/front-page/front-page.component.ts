import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-front-page',
  imports: [RouterModule, MatCardModule],
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.css'
})
export class FrontPageComponent {
  constructor(private router: Router,private auth:AuthService) { }

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

    goToStart() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
