import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public isMobileMenuOpen$ = this.isMobileMenuOpenSubject.asObservable();

  constructor() {
    this.loadStateFromStorage();
    this.handleScreenSize();
  }

  toggle(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  }

  collapse(): void {
    this.isCollapsedSubject.next(true);
    localStorage.setItem('sidebarCollapsed', 'true');
  }

  expand(): void {
    this.isCollapsedSubject.next(false);
    localStorage.setItem('sidebarCollapsed', 'false');
  }

  isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  openMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(true);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(false);
  }

  toggleMobileMenu(): void {
    const newState = !this.isMobileMenuOpenSubject.value;
    this.isMobileMenuOpenSubject.next(newState);
  }

  isMobileMenuOpen(): boolean {
    return this.isMobileMenuOpenSubject.value;
  }

  private loadStateFromStorage(): void {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      this.isCollapsedSubject.next(saved === 'true');
    }
  }

  private handleScreenSize(): void {
    // Auto-collapse on smaller screens
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const isMobile = window.innerWidth < 769;
        const isSmallDesktop = window.innerWidth < 1024;
        
        if (isMobile) {
          // On mobile, always close the mobile menu when resizing
          this.closeMobileMenu();
        } else if (isSmallDesktop && !this.isCollapsed()) {
          // On small desktop screens, auto-collapse if not already collapsed
          this.collapse();
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }
  }
}