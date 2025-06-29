import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [MatIconModule,CommonModule,FormsModule,RouterLink]
})
export class HeaderComponent {
  @Input() showSearch: boolean = false;
  @Input() showProfile: boolean = false;
  @Output() onSearch = new EventEmitter<string>();
  @Input() hideAuthButtons: boolean = false;
  @Input() showhamburger: boolean = false;
  @Input()logoutbutton : boolean = false;  



  menuOpen = false;
  profileOpen = false;
  searchTerm = '';

  constructor(private router: Router) {}

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileOpen = !this.profileOpen;
  }

  goToProfile(event: Event) {
    event.stopPropagation();
    this.profileOpen = false;
    this.router.navigate(['/profile']);
  }

  logout(event: Event) {
    event.stopPropagation();
    this.profileOpen = false;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}