import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'New Ticket Assigned',
      message: 'Ticket #123 has been assigned to you',
      type: 'info',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      read: false,
      actionUrl: '/tickets/123',
      actionText: 'View Ticket'
    },
    {
      id: '2',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will begin at 2:00 AM UTC',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false
    },
    {
      id: '3',
      title: 'Chat Session Started',
      message: 'New customer chat session waiting for response',
      type: 'info',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      read: true,
      actionUrl: '/live-chat',
      actionText: 'Join Chat'
    }
  ];

  constructor() {
    this.notificationsSubject.next(this.mockNotifications);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next(notifications);
    }
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value;
    notifications.forEach(n => n.read = true);
    this.notificationsSubject.next(notifications);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    const notifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(notifications);
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}