import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [RouterLink, RouterLinkActive, CommonModule]
})
export class NavbarComponent implements OnInit {
  navbarOpen = false;
  isLoggedIn = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Verificar status inicial
    this.isLoggedIn = this.auth.isLoggedIn();
    
    // Subscrever a mudanças de autenticação
    this.auth.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar() {
    this.navbarOpen = false;
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.closeNavbar();
    this.router.navigate(['/login']);
  }
}
