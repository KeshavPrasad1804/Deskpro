import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { User, UserRole, CreateUserRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-responsive py-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="page-header">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage system users and permissions</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary w-full sm:w-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">Role</label>
            <select [(ngModel)]="selectedRole" (ngModelChange)="applyFilters()" class="form-input">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div>
            <label class="form-label">Status</label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()" class="form-input">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label class="form-label">Search</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="applyFilters()"
              class="form-input" 
              placeholder="Search by name or email...">
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card overflow-hidden">
        <div class="table-responsive">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">User</th>
                <th class="table-header-cell hidden sm:table-cell">Role</th>
                <th class="table-header-cell hidden md:table-cell">Status</th>
                <th class="table-header-cell hidden lg:table-cell">Created</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let user of filteredUsers" class="table-row">
                <td class="table-cell">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-gray-900 dark:text-white text-truncate">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 text-truncate">
                        {{ user.email }}
                      </div>
                      <!-- Mobile-only role and status -->
                      <div class="flex gap-2 mt-1 sm:hidden">
                        <span [class]="'role-badge role-' + user.role">
                          {{ user.role | titlecase }}
                        </span>
                        <span [class]="'status-badge ' + (user.isActive ? 'status-active' : 'status-inactive')">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="table-cell hidden sm:table-cell">
                  <span [class]="'role-badge role-' + user.role">
                    {{ user.role | titlecase }}
                  </span>
                </td>
                <td class="table-cell hidden md:table-cell">
                  <span [class]="'status-badge ' + (user.isActive ? 'status-active' : 'status-inactive')">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400">
                  {{ user.createdAt | date:'short' }}
                </td>
                <td class="table-cell">
                  <div class="flex space-x-1">
                    <button 
                      (click)="editUser(user)"
                      class="btn-icon text-primary-600 hover:text-primary-900 dark:text-primary-400"
                      title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      (click)="toggleUserStatus(user)"
                      [class]="'btn-icon ' + (user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900')"
                      [title]="user.isActive ? 'Deactivate' : 'Activate'">
                      <svg *ngIf="user.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                      </svg>
                      <svg *ngIf="!user.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ filteredUsers.length }} of {{ users.length }} users
          </div>
          <div class="flex space-x-2">
            <button class="btn-secondary text-sm">Previous</button>
            <button class="btn-secondary text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? 'Edit User' : 'Create New User' }}</h3>
          <button (click)="closeModal()" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="modal-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">First Name *</label>
              <input type="text" formControlName="firstName" class="form-input">
              <div *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched" class="form-error">
                First name is required
              </div>
            </div>
            <div>
              <label class="form-label">Last Name *</label>
              <input type="text" formControlName="lastName" class="form-input">
              <div *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched" class="form-error">
                Last name is required
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">Email *</label>
            <input type="email" formControlName="email" class="form-input">
            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="form-error">
              <span *ngIf="userForm.get('email')?.hasError('required')">Email is required</span>
              <span *ngIf="userForm.get('email')?.hasError('email')">Please enter a valid email</span>
            </div>
          </div>

          <div *ngIf="!isEditing">
            <label class="form-label">Password *</label>
            <input type="password" formControlName="password" class="form-input">
            <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="form-error">
              Password must be at least 6 characters
            </div>
          </div>

          <div>
            <label class="form-label">Role *</label>
            <select formControlName="role" class="form-input">
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
            <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" class="form-error">
              Role is required
            </div>
          </div>

          <div *ngIf="isEditing" class="flex items-center">
            <input 
              type="checkbox" 
              formControlName="isActive" 
              id="isActive" 
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
            <label for="isActive" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active user
            </label>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" (click)="closeModal()" class="btn-secondary">
            Cancel
          </button>
          <button 
            (click)="saveUser()" 
            [disabled]="userForm.invalid || isLoading"
            class="btn-primary">
            <div *ngIf="isLoading" class="spinner w-4 h-4"></div>
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }

    .role-admin {
      @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
    }

    .role-agent {
      @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
    }

    .role-customer {
      @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200;
    }

    .status-active {
      @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }

    .status-inactive {
      @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
    }

    .modal-overlay {
      @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4;
    }

    .modal-content {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto;
    }

    .modal-header {
      @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
    }

    .modal-title {
      @apply text-lg font-medium text-gray-900 dark:text-white;
    }

    .modal-close {
      @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300;
    }

    .modal-body {
      @apply p-6 space-y-4;
    }

    .modal-footer {
      @apply flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedRole = '';
  selectedStatus = '';
  searchTerm = '';
  
  showModal = false;
  isEditing = false;
  isLoading = false;
  currentUser: User | null = null;
  
  userForm: FormGroup;

  // Mock data
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      firstName: 'John',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      email: 'agent1@example.com',
      firstName: 'Jane',
      lastName: 'Agent',
      role: UserRole.AGENT,
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: '3',
      email: 'agent2@example.com',
      firstName: 'Mike',
      lastName: 'Support',
      role: UserRole.AGENT,
      isActive: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    },
    {
      id: '4',
      email: 'customer1@example.com',
      firstName: 'Alice',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
      isActive: true,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    }
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      role: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.users = this.mockUsers;
    this.filteredUsers = this.users;
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const roleMatch = !this.selectedRole || user.role === this.selectedRole;
      const statusMatch = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);
      const searchMatch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return roleMatch && statusMatch && searchMatch;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset({ isActive: true });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.currentUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
    this.currentUser = null;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        if (this.isEditing && this.currentUser) {
          // Update existing user
          const index = this.users.findIndex(u => u.id === this.currentUser!.id);
          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...this.userForm.value,
              updatedAt: new Date()
            };
          }
        } else {
          // Create new user
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            ...this.userForm.value,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.users.push(newUser);
        }
        
        this.applyFilters();
        this.closeModal();
        this.isLoading = false;
      }, 1000);
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      user.isActive = !user.isActive;
      user.updatedAt = new Date();
      this.applyFilters();
    }
  }

  getUserInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}