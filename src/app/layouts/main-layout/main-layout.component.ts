import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="main-layout">
      <app-header></app-header>
      <div class="layout-container" *ngIf="isAuthenticated">
        <app-sidebar #sidebar></app-sidebar>
        <main class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <div *ngIf="!isAuthenticated" class="unauthenticated-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background-color: rgb(249 250 251);
    }

    .main-layout.dark {
      background-color: rgb(17 24 39);
    }

    .layout-container {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      transition: all 0.3s ease-in-out;
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0;
      width: 100%;
      max-width: 100%;
      height: 100%;
    }

    .unauthenticated-content {
      flex: 1;
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .layout-container {
        position: relative;
      }
      
      .main-content {
        width: 100%;
      }
    }

    /* Ensure proper scrolling */
    .content-wrapper::-webkit-scrollbar {
      width: 6px;
    }

    .content-wrapper::-webkit-scrollbar-track {
      background: transparent;
    }

    .content-wrapper::-webkit-scrollbar-thumb {
      background-color: rgb(156 163 175);
      border-radius: 3px;
    }

    .content-wrapper::-webkit-scrollbar-thumb:hover {
      background-color: rgb(107 114 128);
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobile = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    const sidebarSub = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
    this.subscriptions.push(sidebarSub);

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
    this.isMobile = window.innerWidth < 769;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}