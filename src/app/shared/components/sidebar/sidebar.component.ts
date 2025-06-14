import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { UserRole } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Overlay -->
    <div 
      *ngIf="isMobileMenuOpen && isMobile"
      class="mobile-overlay"
      (click)="closeMobileMenu()">
    </div>

    <!-- Sidebar -->
    <aside 
      class="sidebar"
      [class.sidebar-collapsed]="isCollapsed && !isMobile"
      [class.sidebar-expanded]="!isCollapsed && !isMobile"
      [class.sidebar-mobile]="isMobile"
      [class.sidebar-mobile-open]="isMobileMenuOpen && isMobile"
      [class.sidebar-mobile-closed]="!isMobileMenuOpen && isMobile">
      
      <!-- Header -->
      <div class="sidebar-header">
        <!-- Logo (visible when expanded or on mobile) -->
        <div *ngIf="!isCollapsed || isMobile" class="sidebar-logo">
          <div class="logo-icon">D</div>
          <span class="logo-text">DeskPro</span>
        </div>
        
        <!-- Toggle Button (desktop only) -->
        <button 
          *ngIf="!isMobile"
          (click)="toggleSidebar()"
          class="sidebar-toggle"
          [title]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  [attr.d]="isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"/>
          </svg>
        </button>

        <!-- Close Button (mobile only) -->
        <button 
          *ngIf="isMobile"
          (click)="closeMobileMenu()"
          class="sidebar-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Main Navigation -->
        <div class="nav-section">
          <h3 *ngIf="(!isCollapsed || isMobile) && showSectionHeaders" class="nav-section-title">
            Main
          </h3>
          
          <a 
            routerLink="/dashboard" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/dashboard') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Dashboard' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 5l4-4 4 4"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Dashboard</span>
          </a>

          <a 
            routerLink="/tickets" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/tickets') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Tickets' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Tickets</span>
          </a>

          <a 
            routerLink="/knowledge-base" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/knowledge-base') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Knowledge Base' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Knowledge Base</span>
          </a>
        </div>

        <!-- Agent Tools Section -->
        <div *ngIf="isAgentOrAdmin" class="nav-section">
          <h3 *ngIf="(!isCollapsed || isMobile) && showSectionHeaders" class="nav-section-title">
            Agent Tools
          </h3>
          
          <a 
            routerLink="/live-chat" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/live-chat') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Live Chat' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Live Chat</span>
            <!-- Notification badge -->
            <span *ngIf="(!isCollapsed || isMobile) && hasUnreadChats" class="notification-badge">3</span>
          </a>

          <a 
            routerLink="/reports" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/reports') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Reports' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Reports</span>
          </a>
        </div>

        <!-- Admin Section -->
        <div *ngIf="isAdmin" class="nav-section">
          <h3 *ngIf="(!isCollapsed || isMobile) && showSectionHeaders" class="nav-section-title">
            Administration
          </h3>
          
          <a 
            routerLink="/admin/users" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/admin/users') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Users' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Users</span>
          </a>
          
          <a 
            routerLink="/admin/settings" 
            routerLinkActive="nav-item-active"
            [class]="'nav-item ' + (isActiveRoute('/admin/settings') ? 'nav-item-active' : 'nav-item-inactive')"
            [title]="isCollapsed && !isMobile ? 'Settings' : ''"
            (click)="onNavItemClick()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span *ngIf="!isCollapsed || isMobile" class="nav-text">Settings</span>
          </a>
        </div>
      </nav>

      <!-- Footer (only visible when expanded) -->
      <div *ngIf="!isCollapsed || isMobile" class="sidebar-footer">
        <div class="footer-content">
          <p class="footer-text">DeskPro v1.0</p>
          <p class="footer-subtext">Support Platform</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 40;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s ease-in-out;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      background-color: rgb(17 24 39);
      color: white;
      min-height: 100vh;
      transition: all 0.3s ease-in-out;
      flex-shrink: 0;
    }

    /* Desktop Sidebar States */
    .sidebar:not(.sidebar-mobile) {
      position: relative;
    }

    .sidebar-expanded {
      width: 16rem; /* 256px */
    }

    .sidebar-collapsed {
      width: 4rem; /* 64px */
    }

    /* Mobile Sidebar */
    .sidebar-mobile {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      width: 16rem;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .sidebar-mobile-open {
      transform: translateX(0);
    }

    .sidebar-mobile-closed {
      transform: translateX(-100%);
    }

    /* Header */
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid rgb(55 65 81);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 2rem;
      height: 2rem;
      background-color: rgb(37 99 235);
      border-radius: 0.25rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.125rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .sidebar-toggle,
    .sidebar-close {
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s ease-in-out;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
    }

    .sidebar-toggle:hover,
    .sidebar-close:hover {
      background-color: rgb(55 65 81);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0 0.75rem;
    }

    .nav-section-title {
      padding: 0 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgb(156 163 175);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.375rem;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      position: relative;
    }

    .nav-item-active {
      background-color: rgb(37 99 235);
      color: white;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .nav-item-inactive {
      color: rgb(209 213 219);
    }

    .nav-item-inactive:hover {
      background-color: rgb(55 65 81);
      color: white;
    }

    .nav-icon {
      height: 1.25rem;
      width: 1.25rem;
      flex-shrink: 0;
    }

    .nav-text {
      margin-left: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notification-badge {
      margin-left: auto;
      background-color: rgb(239 68 68);
      color: white;
      font-size: 0.75rem;
      border-radius: 9999px;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgb(55 65 81);
      flex-shrink: 0;
    }

    .footer-content {
      text-align: center;
    }

    .footer-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(209 213 219);
    }

    .footer-subtext {
      font-size: 0.75rem;
      color: rgb(156 163 175);
    }

    /* Collapsed state adjustments */
    .sidebar-collapsed .nav-item {
      justify-content: center;
      padding: 0.5rem;
    }

    .sidebar-collapsed .nav-text {
      display: none;
    }

    .sidebar-collapsed .notification-badge {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      width: 0.75rem;
      height: 0.75rem;
      font-size: 0.625rem;
    }

    /* Tooltip for collapsed items */
    .sidebar-collapsed .nav-item[title]:hover::after {
      content: attr(title);
      position: absolute;
      left: 100%;
      margin-left: 0.5rem;
      padding: 0.5rem;
      background-color: rgb(31 41 55);
      color: white;
      font-size: 0.75rem;
      border-radius: 0.375rem;
      white-space: nowrap;
      z-index: 50;
      top: 50%;
      transform: translateY(-50%);
    }

    /* Focus styles for accessibility */
    .nav-item:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgb(37 99 235);
    }

    .sidebar-toggle:focus,
    .sidebar-close:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgb(37 99 235);
    }

    /* Hide sidebar on mobile by default */
    @media (max-width: 768px) {
      .sidebar:not(.sidebar-mobile) {
        display: none;
      }
    }

    /* Show only mobile sidebar on mobile */
    @media (min-width: 769px) {
      .sidebar-mobile {
        display: none;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobile = false;
  isMobileMenuOpen = false;
  hasUnreadChats = true; // Mock data
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Subscribe to sidebar state
    const sidebarSub = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
    this.subscriptions.push(sidebarSub);

    // Subscribe to mobile menu state
    const mobileSub = this.sidebarService.isMobileMenuOpen$.subscribe(open => {
      this.isMobileMenuOpen = open;
    });
    this.subscriptions.push(mobileSub);

    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 769;
    
    // If switching from mobile to desktop, close mobile menu
    if (wasMobile && !this.isMobile) {
      this.sidebarService.closeMobileMenu();
    }
    
    // Auto-collapse on smaller desktop screens
    if (!this.isMobile && window.innerWidth < 1024 && !this.isCollapsed) {
      this.sidebarService.collapse();
    }
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  get isAgentOrAdmin(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
  }

  get showSectionHeaders(): boolean {
    return !this.isCollapsed || this.isMobile;
  }

  toggleSidebar(): void {
    if (!this.isMobile) {
      this.sidebarService.toggle();
    }
  }

  openMobileMenu(): void {
    if (this.isMobile) {
      this.sidebarService.openMobileMenu();
    }
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
  }

  onNavItemClick(): void {
    // Close mobile menu when navigation item is clicked
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }

  isActiveRoute(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }
}