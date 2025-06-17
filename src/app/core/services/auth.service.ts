import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock implementation - replace with actual API call
    let userRole = UserRole.CUSTOMER;
    let firstName = 'John';
    let lastName = 'Doe';

    // Determine role and name based on email
    if (credentials.email.includes('admin')) {
      userRole = UserRole.ADMIN;
      firstName = 'Admin';
      lastName = 'User';
    } else if (credentials.email.includes('agent')) {
      userRole = UserRole.AGENT;
      firstName = 'Agent';
      lastName = 'Smith';
    } else if (credentials.email.includes('customer')) {
      userRole = UserRole.CUSTOMER;
      firstName = 'Customer';
      lastName = 'Johnson';
    }

    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        firstName: firstName,
        lastName: lastName,
        role: userRole
      }
    };

    // Store tokens
    localStorage.setItem('token', mockResponse.token);
    localStorage.setItem('refreshToken', mockResponse.refreshToken);
    
    // Create full user object
    const user: User = {
      ...mockResponse.user,
      role: mockResponse.user.role as UserRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);

    return of(mockResponse);
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    // Mock implementation - replace with actual API call
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        role: UserRole.CUSTOMER
      }
    };

    return of(mockResponse);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem('token');
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
}