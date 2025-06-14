import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Notification Button -->
      <button 
        (click)="toggleDropdown()"
        class="notification-btn"
        [class.has-notifications]="unreadCount > 0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z"/>
        </svg>
        <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>

      <!-- Dropdown -->
      <div *ngIf="isOpen" class="notification-dropdown">
        <!-- Header -->
        <div class="dropdown-header">
          <h3 class="dropdown-title">Notifications</h3>
          <button 
            *ngIf="unreadCount > 0"
            (click)="markAllAsRead()"
            class="mark-all-read-btn">
            Mark all read
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list">
          <div *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
               class="notification-item"
               [class.unread]="!notification.read"
               (click)="handleNotificationClick(notification)">
            
            <div class="notification-icon" [class]="'icon-' + notification.type">
              <svg *ngIf="notification.type === 'info'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg *ngIf="notification.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg *ngIf="notification.type === 'warning'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <svg *ngIf="notification.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <span class="notification-time">{{ getTimeAgo(notification.timestamp) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div *ngIf="notification.actionUrl" class="notification-action">
                <a [routerLink]="notification.actionUrl" class="action-link">
                  {{ notification.actionText || 'View' }}
                </a>
              </div>
            </div>

            <button 
              (click)="removeNotification(notification.id, $event)"
              class="remove-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Empty State -->
          <div *ngIf="notifications.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z"/>
            </svg>
            <p class="empty-text">No notifications</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="dropdown-footer" *ngIf="notifications.length > 0">
          <button (click)="clearAll()" class="clear-all-btn">
            Clear all notifications
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div *ngIf="isOpen" class="notification-backdrop" (click)="closeDropdown()"></div>
  `,
  styles: [`
    .notification-btn {
      @apply p-2 rounded-md text-white hover:bg-primary-700 dark:hover:bg-gray-700 transition-colors duration-200 relative;
    }

    .notification-badge {
      @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium;
    }

    .notification-backdrop {
      @apply fixed inset-0 z-40;
    }

    .notification-dropdown {
      @apply absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col;
    }

    .dropdown-header {
      @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
    }

    .dropdown-title {
      @apply text-lg font-medium text-gray-900 dark:text-white;
    }

    .mark-all-read-btn {
      @apply text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium;
    }

    .notifications-list {
      @apply flex-1 overflow-y-auto max-h-64;
    }

    .notification-item {
      @apply flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 cursor-pointer transition-colors duration-150 relative;
    }

    .notification-item.unread {
      @apply bg-blue-50 dark:bg-blue-900/20;
    }

    .notification-item.unread::before {
      content: '';
      @apply absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full;
    }

    .notification-icon {
      @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1;
    }

    .icon-info {
      @apply bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400;
    }

    .icon-success {
      @apply bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400;
    }

    .icon-warning {
      @apply bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400;
    }

    .icon-error {
      @apply bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400;
    }

    .notification-content {
      @apply flex-1 min-w-0;
    }

    .notification-header {
      @apply flex items-start justify-between mb-1;
    }

    .notification-title {
      @apply text-sm font-medium text-gray-900 dark:text-white;
    }

    .notification-time {
      @apply text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2;
    }

    .notification-message {
      @apply text-sm text-gray-600 dark:text-gray-300 mb-2;
    }

    .notification-action {
      @apply mt-2;
    }

    .action-link {
      @apply text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium;
    }

    .remove-btn {
      @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0;
    }

    .empty-state {
      @apply flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400;
    }

    .empty-icon {
      @apply w-12 h-12 mb-2;
    }

    .empty-text {
      @apply text-sm;
    }

    .dropdown-footer {
      @apply p-4 border-t border-gray-200 dark:border-gray-700;
    }

    .clear-all-btn {
      @apply w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const notificationsSub = this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
    this.subscriptions.push(notificationsSub);

    const unreadSub = this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      this.closeDropdown();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearAll();
    this.closeDropdown();
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}