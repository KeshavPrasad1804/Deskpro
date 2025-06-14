import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    timezone: string;
    language: string;
  };
  tickets: {
    autoAssignment: boolean;
    defaultPriority: string;
    escalationTime: number;
    allowCustomerClose: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    ipWhitelist: string;
  };
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-responsive py-6">
      <div class="page-header">
        <h1 class="page-title">System Settings</h1>
        <p class="page-subtitle">Configure system preferences and behavior</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Settings Navigation -->
        <div class="lg:col-span-1">
          <nav class="settings-nav">
            <button 
              *ngFor="let tab of settingsTabs"
              (click)="activeTab = tab.id"
              [class]="'nav-item ' + (activeTab === tab.id ? 'active' : '')">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="tab.icon"/>
              </svg>
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-3">
          <!-- General Settings -->
          <div *ngIf="activeTab === 'general'" class="card p-6">
            <h3 class="settings-title">General Settings</h3>
            <form [formGroup]="generalForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Site Name</label>
                  <input type="text" formControlName="siteName" class="form-input">
                </div>
                <div>
                  <label class="form-label">Site URL</label>
                  <input type="url" formControlName="siteUrl" class="form-input">
                </div>
              </div>

              <div>
                <label class="form-label">Support Email</label>
                <input type="email" formControlName="supportEmail" class="form-input">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Timezone</label>
                  <select formControlName="timezone" class="form-input">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Default Language</label>
                  <select formControlName="language" class="form-input">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end">
                <button (click)="saveSettings('general')" class="btn-primary">
                  Save General Settings
                </button>
              </div>
            </form>
          </div>

          <!-- Ticket Settings -->
          <div *ngIf="activeTab === 'tickets'" class="card p-6">
            <h3 class="settings-title">Ticket Settings</h3>
            <form [formGroup]="ticketsForm" class="space-y-6">
              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">Auto Assignment</label>
                    <p class="settings-description">Automatically assign new tickets to available agents</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="autoAssignment"
                    class="toggle-switch">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Default Priority</label>
                  <select formControlName="defaultPriority" class="form-input">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Escalation Time (hours)</label>
                  <input type="number" formControlName="escalationTime" class="form-input" min="1" max="168">
                </div>
              </div>

              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">Allow Customer Close</label>
                    <p class="settings-description">Allow customers to close their own tickets</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="allowCustomerClose"
                    class="toggle-switch">
                </div>
              </div>

              <div class="flex justify-end">
                <button (click)="saveSettings('tickets')" class="btn-primary">
                  Save Ticket Settings
                </button>
              </div>
            </form>
          </div>

          <!-- Notification Settings -->
          <div *ngIf="activeTab === 'notifications'" class="card p-6">
            <h3 class="settings-title">Notification Settings</h3>
            <form [formGroup]="notificationsForm" class="space-y-6">
              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">Email Notifications</label>
                    <p class="settings-description">Send email notifications for ticket updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="emailNotifications"
                    class="toggle-switch">
                </div>
              </div>

              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">SMS Notifications</label>
                    <p class="settings-description">Send SMS notifications for urgent tickets</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="smsNotifications"
                    class="toggle-switch">
                </div>
              </div>

              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">Push Notifications</label>
                    <p class="settings-description">Send browser push notifications</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="pushNotifications"
                    class="toggle-switch">
                </div>
              </div>

              <div>
                <label class="form-label">Notification Frequency</label>
                <select formControlName="notificationFrequency" class="form-input">
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly Digest</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>

              <div class="flex justify-end">
                <button (click)="saveSettings('notifications')" class="btn-primary">
                  Save Notification Settings
                </button>
              </div>
            </form>
          </div>

          <!-- Security Settings -->
          <div *ngIf="activeTab === 'security'" class="card p-6">
            <h3 class="settings-title">Security Settings</h3>
            <form [formGroup]="securityForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Password Minimum Length</label>
                  <input type="number" formControlName="passwordMinLength" class="form-input" min="6" max="32">
                </div>
                <div>
                  <label class="form-label">Session Timeout (minutes)</label>
                  <input type="number" formControlName="sessionTimeout" class="form-input" min="15" max="1440">
                </div>
              </div>

              <div class="settings-group">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="settings-label">Two-Factor Authentication</label>
                    <p class="settings-description">Require 2FA for all admin accounts</p>
                  </div>
                  <input 
                    type="checkbox" 
                    formControlName="twoFactorAuth"
                    class="toggle-switch">
                </div>
              </div>

              <div>
                <label class="form-label">IP Whitelist</label>
                <textarea 
                  formControlName="ipWhitelist" 
                  rows="4" 
                  class="form-input"
                  placeholder="Enter IP addresses or ranges, one per line&#10;192.168.1.0/24&#10;10.0.0.1"></textarea>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to allow access from any IP address
                </p>
              </div>

              <div class="flex justify-end">
                <button (click)="saveSettings('security')" class="btn-primary">
                  Save Security Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
        Settings saved successfully!
      </div>
    </div>
  `,
  styles: [`
    .settings-nav {
      @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1;
    }

    .nav-item {
      @apply flex items-center space-x-3 w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors duration-200;
    }

    .nav-item:not(.active) {
      @apply text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700;
    }

    .nav-item.active {
      @apply bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300;
    }

    .settings-title {
      @apply text-lg font-medium text-gray-900 dark:text-white mb-6;
    }

    .settings-group {
      @apply p-4 bg-gray-50 dark:bg-gray-700 rounded-lg;
    }

    .settings-label {
      @apply text-sm font-medium text-gray-900 dark:text-white;
    }

    .settings-description {
      @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
    }

    .toggle-switch {
      @apply h-6 w-11 bg-gray-200 dark:bg-gray-600 rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
    }

    .toggle-switch:checked {
      @apply bg-primary-600;
    }

    .toggle-switch::after {
      content: '';
      @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out;
    }

    .toggle-switch:checked::after {
      @apply translate-x-5;
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  activeTab = 'general';
  showSuccessMessage = false;

  settingsTabs = [
    {
      id: 'general',
      label: 'General',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    }
  ];

  generalForm: FormGroup;
  ticketsForm: FormGroup;
  notificationsForm: FormGroup;
  securityForm: FormGroup;

  private currentSettings: SystemSettings = {
    general: {
      siteName: 'DeskPro Support',
      siteUrl: 'https://support.example.com',
      supportEmail: 'support@example.com',
      timezone: 'UTC',
      language: 'en'
    },
    tickets: {
      autoAssignment: true,
      defaultPriority: 'normal',
      escalationTime: 24,
      allowCustomerClose: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationFrequency: 'immediate'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 60,
      twoFactorAuth: false,
      ipWhitelist: ''
    }
  };

  constructor(private fb: FormBuilder) {
    this.generalForm = this.fb.group({
      siteName: ['', Validators.required],
      siteUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      supportEmail: ['', [Validators.required, Validators.email]],
      timezone: ['', Validators.required],
      language: ['', Validators.required]
    });

    this.ticketsForm = this.fb.group({
      autoAssignment: [false],
      defaultPriority: ['', Validators.required],
      escalationTime: [24, [Validators.required, Validators.min(1), Validators.max(168)]],
      allowCustomerClose: [false]
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      notificationFrequency: ['', Validators.required]
    });

    this.securityForm = this.fb.group({
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(32)]],
      sessionTimeout: [60, [Validators.required, Validators.min(15), Validators.max(1440)]],
      twoFactorAuth: [false],
      ipWhitelist: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.generalForm.patchValue(this.currentSettings.general);
    this.ticketsForm.patchValue(this.currentSettings.tickets);
    this.notificationsForm.patchValue(this.currentSettings.notifications);
    this.securityForm.patchValue(this.currentSettings.security);
  }

  saveSettings(section: keyof SystemSettings): void {
    let form: FormGroup;
    
    switch (section) {
      case 'general':
        form = this.generalForm;
        break;
      case 'tickets':
        form = this.ticketsForm;
        break;
      case 'notifications':
        form = this.notificationsForm;
        break;
      case 'security':
        form = this.securityForm;
        break;
      default:
        return;
    }

    if (form.valid) {
      // Update current settings
      this.currentSettings[section] = { ...this.currentSettings[section], ...form.value };
      
      // Show success message
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
      
      // In a real app, this would make an API call to save settings
      console.log(`Saving ${section} settings:`, form.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });
    }
  }
}