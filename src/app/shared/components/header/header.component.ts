import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { User, UserRole } from '../../../core/models/user.model';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationDropdownComponent],
  template: `
    <header class="header">
      <div class="header-container">
        <div class="header-content">
          <!-- Logo and Sidebar Toggle -->
          <div class="header-left">
            <!-- Mobile menu button -->
            <button 
              *ngIf="currentUser && isMobile"
              (click)="toggleMobileSidebar()"
              class="mobile-menu-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <!-- Desktop sidebar toggle -->
            <button 
              *ngIf="currentUser && !isMobile"
              (click)="toggleSidebar()"
              class="desktop-menu-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            
            <a routerLink="/" class="logo-link">
              <div class="logo-icon">D</div>
              <span class="logo-text">DeskPro</span>
            </a>
          </div>

          <!-- Navigation (hidden on mobile) -->
          <nav class="desktop-nav" *ngIf="currentUser">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="nav-active"
              class="nav-link">
              Dashboard
            </a>
            <a 
              routerLink="/tickets" 
              routerLinkActive="nav-active"
              class="nav-link">
              Tickets
            </a>
            <a 
              *ngIf="isAgentOrAdmin"
              routerLink="/live-chat" 
              routerLinkActive="nav-active"
              class="nav-link">
              Live Chat
            </a>
            <a 
              routerLink="/knowledge-base" 
              routerLinkActive="nav-active"
              class="nav-link">
              Knowledge Base
            </a>
            <a 
              *ngIf="isAdmin"
              routerLink="/admin" 
              routerLinkActive="nav-active"
              class="nav-link">
              Admin
            </a>
          </nav>

          <!-- Right Side Actions -->
          <div class="header-right" *ngIf="currentUser">
            <!-- Theme Toggle -->
            <button 
              (click)="toggleTheme()"
              class="theme-toggle"
              [title]="currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
              <svg *ngIf="currentTheme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <svg *ngIf="currentTheme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </button>

            <!-- Notifications -->
            <app-notification-dropdown></app-notification-dropdown>

            <!-- User Menu -->
            <div class="user-menu-container">
              <button 
                (click)="toggleUserMenu()"
                class="user-menu-btn">
                <div class="user-avatar">
                  <span class="user-initials">
                    {{ currentUser.firstName[0] }}{{ currentUser.lastName[0] }}
                  </span>
                </div>
                <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
                <svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              <div *ngIf="showUserMenu" class="dropdown">
                <div class="dropdown-header">
                  <p class="user-name-dropdown">{{ currentUser.firstName }} {{ currentUser.lastName }}</p>
                  <p class="user-email">{{ currentUser.email }}</p>
                  <div class="user-role">
                    <span class="role-badge" [class]="'role-' + currentUser.role">
                      {{ currentUser.role | titlecase }}
                    </span>
                  </div>
                </div>
                <a href="#" class="dropdown-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Profile Settings
                </a>
                <a href="#" class="dropdown-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z"/>
                  </svg>
                  Notification Settings
                </a>
                <a href="#" class="dropdown-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Help & Support
                </a>
                <hr class="dropdown-divider">
                <button 
                  (click)="logout()" 
                  class="dropdown-item logout-btn">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <!-- Login button for unauthenticated users -->
          <div *ngIf="!currentUser">
            <a routerLink="/auth/login" class="btn-primary">Sign In</a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: rgb(37 99 235);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid rgb(29 78 216);
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .header.dark {
      background-color: rgb(31 41 55);
      border-bottom-color: rgb(55 65 81);
    }

    .header-container {
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 1rem;
    }

    @media (min-width: 640px) {
      .header-container {
        padding: 0 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .header-container {
        padding: 0 2rem;
      }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 4rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-btn,
    .desktop-menu-btn {
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: white;
      transition: background-color 0.2s ease-in-out;
      background: none;
      border: none;
      cursor: pointer;
    }

    .mobile-menu-btn:hover,
    .desktop-menu-btn:hover {
      background-color: rgb(29 78 216);
    }

    .mobile-menu-btn {
      display: block;
    }

    .desktop-menu-btn {
      display: none;
    }

    @media (min-width: 769px) {
      .mobile-menu-btn {
        display: none;
      }
      
      .desktop-menu-btn {
        display: block;
      }
    }

    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .logo-icon {
      width: 2rem;
      height: 2rem;
      background-color: white;
      border-radius: 0.25rem;
      color: rgb(37 99 235);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .logo-text {
      margin-left: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      display: none;
    }

    @media (min-width: 640px) {
      .logo-text {
        display: block;
      }
    }

    .desktop-nav {
      display: none;
      gap: 2rem;
    }

    @media (min-width: 1024px) {
      .desktop-nav {
        display: flex;
      }
    }

    .nav-link {
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.25rem 0;
      padding-bottom: 1rem;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
    }

    .nav-link:hover {
      color: rgb(254 240 138);
      border-bottom-color: rgb(254 240 138);
    }

    .nav-active {
      color: rgb(254 240 138) !important;
      border-bottom-color: rgb(254 240 138) !important;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (min-width: 640px) {
      .header-right {
        gap: 1rem;
      }
    }

    .theme-toggle {
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: white;
      transition: background-color 0.2s ease-in-out;
      background: none;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .theme-toggle:hover {
      background-color: rgb(29 78 216);
    }

    .user-menu-container {
      position: relative;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      border-radius: 9999px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
      padding: 0.25rem;
    }

    .user-menu-btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px white;
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.5rem;
    }

    .user-initials {
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
    }

    .user-name {
      margin-right: 0.5rem;
      display: none;
    }

    @media (min-width: 640px) {
      .user-name {
        display: block;
      }
    }

    .chevron-icon {
      width: 1rem;
      height: 1rem;
    }

    .dropdown {
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      width: 14rem;
      background-color: white;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 0.25rem 0;
      z-index: 50;
      border: 1px solid rgb(229 231 235);
    }

    .dropdown.dark {
      background-color: rgb(31 41 55);
      border-color: rgb(55 65 81);
    }

    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid rgb(229 231 235);
    }

    .dropdown-header.dark {
      border-bottom-color: rgb(55 65 81);
    }

    .user-name-dropdown {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(17 24 39);
    }

    .user-name-dropdown.dark {
      color: rgb(243 244 246);
    }

    .user-email {
      font-size: 0.875rem;
      color: rgb(107 114 128);
      margin-bottom: 0.5rem;
    }

    .user-email.dark {
      color: rgb(156 163 175);
    }

    .user-role {
      margin-top: 0.5rem;
    }

    .role-badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
    }

    .role-admin {
      background-color: rgb(239 68 68);
      color: white;
    }

    .role-agent {
      background-color: rgb(59 130 246);
      color: white;
    }

    .role-customer {
      background-color: rgb(107 114 128);
      color: white;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: rgb(55 65 81);
      transition: background-color 0.15s ease-in-out;
      text-decoration: none;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: rgb(243 244 246);
    }

    .dropdown-item.dark {
      color: rgb(209 213 219);
    }

    .dropdown-item.dark:hover {
      background-color: rgb(55 65 81);
    }

    .dropdown-divider {
      margin: 0.25rem 0;
      border-color: rgb(229 231 235);
    }

    .dropdown-divider.dark {
      border-color: rgb(55 65 81);
    }

    .logout-btn {
      width: 100%;
      text-align: left;
    }
  `]
})
export class HeaderComponent {
  currentUser: User | null = null;
  showUserMenu = false;
  currentTheme: Theme = 'light';
  isMobile = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 769;
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  get isAgentOrAdmin(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleMobileSidebar(): void {
    this.sidebarService.toggleMobileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showUserMenu = false;
  }
}