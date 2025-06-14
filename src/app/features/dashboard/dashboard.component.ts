import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { User, UserRole } from '../../core/models/user.model';
import { Ticket, TicketStatus, TicketPriority } from '../../core/models/ticket.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-responsive py-6">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ currentUser?.firstName }}!</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="stats-card">
          <div class="stats-icon bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="stats-value">{{ totalTickets }}</div>
          <div class="stats-label">Total Tickets</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stats-value">{{ openTickets }}</div>
          <div class="stats-label">Open Tickets</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stats-value">{{ pendingTickets }}</div>
          <div class="stats-label">Pending</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="stats-value">{{ urgentTickets }}</div>
          <div class="stats-label">Urgent</div>
        </div>
      </div>

      <!-- Recent Tickets -->
      <div class="card">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Recent Tickets</h2>
            <a routerLink="/tickets" class="btn-secondary text-sm w-full sm:w-auto">
              View All
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Subject</th>
                <th class="table-header-cell hidden sm:table-cell">Status</th>
                <th class="table-header-cell hidden md:table-cell">Priority</th>
                <th class="table-header-cell hidden lg:table-cell">Customer</th>
                <th class="table-header-cell hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let ticket of recentTickets" class="table-row">
                <td class="table-cell">
                  <div class="font-medium text-gray-900 dark:text-white text-truncate">{{ ticket.subject }}</div>
                  <!-- Mobile-only status and priority -->
                  <div class="flex gap-2 mt-1 sm:hidden">
                    <span [class]="'status-badge ' + getStatusClass(ticket.status)">
                      {{ ticket.status | titlecase }}
                    </span>
                    <span [class]="'status-badge ' + getPriorityClass(ticket.priority)">
                      {{ ticket.priority | titlecase }}
                    </span>
                  </div>
                </td>
                <td class="table-cell hidden sm:table-cell">
                  <span [class]="'status-badge ' + getStatusClass(ticket.status)">
                    {{ ticket.status | titlecase }}
                  </span>
                </td>
                <td class="table-cell hidden md:table-cell">
                  <span [class]="'status-badge ' + getPriorityClass(ticket.priority)">
                    {{ ticket.priority | titlecase }}
                  </span>
                </td>
                <td class="table-cell hidden lg:table-cell text-truncate">{{ ticket.customerName }}</td>
                <td class="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400">{{ ticket.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tickets: Ticket[] = [];
  
  get totalTickets(): number {
    return this.tickets.length;
  }
  
  get openTickets(): number {
    return this.tickets.filter(t => t.status === TicketStatus.OPEN).length;
  }
  
  get pendingTickets(): number {
    return this.tickets.filter(t => t.status === TicketStatus.PENDING).length;
  }
  
  get urgentTickets(): number {
    return this.tickets.filter(t => t.priority === TicketPriority.URGENT).length;
  }
  
  get recentTickets(): Ticket[] {
    return this.tickets.slice(0, 5);
  }

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.ticketService.getTickets().subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OPEN:
        return 'status-open';
      case TicketStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TicketStatus.PENDING:
        return 'status-pending';
      case TicketStatus.RESOLVED:
        return 'status-resolved';
      case TicketStatus.CLOSED:
        return 'status-closed';
      default:
        return 'status-resolved';
    }
  }

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.LOW:
        return 'priority-low';
      case TicketPriority.NORMAL:
        return 'priority-normal';
      case TicketPriority.HIGH:
        return 'priority-high';
      case TicketPriority.URGENT:
        return 'priority-urgent';
      default:
        return 'priority-normal';
    }
  }
}