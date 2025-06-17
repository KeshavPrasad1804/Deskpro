import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-xl">D</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to DeskPro
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Modern helpdesk and support platform
          </p>
        </div>

        <div class="card p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="form-label">Email address</label>
              <div class="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  required
                  class="form-input pr-10"
                  placeholder="Enter your email"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="form-error">
                <span *ngIf="loginForm.get('email')?.hasError('required')">Email is required</span>
                <span *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</span>
              </div>
            </div>

            <div>
              <label for="password" class="form-label">Password</label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  autocomplete="current-password"
                  required
                  class="form-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg *ngIf="hidePassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="!hidePassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                </button>
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="form-error">
                <span *ngIf="loginForm.get('password')?.hasError('required')">Password is required</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  formControlName="rememberMe"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                <div *ngIf="isLoading" class="spinner w-4 h-4 mr-2"></div>
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>

            <div *ngIf="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <div class="text-sm text-red-700 dark:text-red-400">{{ errorMessage }}</div>
            </div>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Demo Credentials:</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-blue-700 dark:text-blue-300"><strong>Admin:</strong> admin@example.com</span>
                <button 
                  type="button"
                  (click)="fillCredentials('admin@example.com', 'password')"
                  class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700">
                  Use
                </button>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-blue-700 dark:text-blue-300"><strong>Agent:</strong> agent@example.com</span>
                <button 
                  type="button"
                  (click)="fillCredentials('agent@example.com', 'password')"
                  class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700">
                  Use
                </button>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-blue-700 dark:text-blue-300"><strong>Customer:</strong> customer@example.com</span>
                <button 
                  type="button"
                  (click)="fillCredentials('customer@example.com', 'password')"
                  class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700">
                  Use
                </button>
              </div>
              <div class="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Password for all accounts: <strong>password</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({
      email: email,
      password: password
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password. Please try the demo credentials above.';
        }
      });
    }
  }
}