import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket, TicketStatus, TicketPriority } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-responsive py-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="page-header">
          <h1 class="page-title">Tickets</h1>
          <p class="page-subtitle">Manage and track support tickets</p>
        </div>
        <a routerLink="/tickets/new" class="btn-primary w-full sm:w-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Ticket
        </a>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="form-label">Status</label>
          <select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()" class="form-input">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div>
          <label class="form-label">Priority</label>
          <select [(ngModel)]="selectedPriority" (ngModelChange)="applyFilters()" class="form-input">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="card overflow-hidden">
        <div class="table-responsive">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">ID</th>
                <th class="table-header-cell">Subject</th>
                <th class="table-header-cell hidden sm:table-cell">Status</th>
                <th class="table-header-cell hidden md:table-cell">Priority</th>
                <th class="table-header-cell hidden lg:table-cell">Customer</th>
                <th class="table-header-cell hidden xl:table-cell">Assigned To</th>
                <th class="table-header-cell hidden lg:table-cell">Created</th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let ticket of filteredTickets" class="table-row">
                <td class="table-cell">
                  <span class="font-medium text-gray-900 dark:text-gray-100">#{{ ticket.id }}</span>
                </td>
                <td class="table-cell">
                  <div class="font-medium text-gray-900 dark:text-gray-100 text-truncate">{{ ticket.subject }}</div>
                  <div class="text-gray-500 dark:text-gray-400 text-sm text-truncate sm:hidden">
                    {{ ticket.description | slice:0:30 }}...
                  </div>
                  <div class="hidden sm:block text-gray-500 dark:text-gray-400 text-sm text-truncate">
                    {{ ticket.description | slice:0:50 }}...
                  </div>
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
                <td class="table-cell hidden lg:table-cell">
                  <div class="font-medium text-gray-900 dark:text-gray-100 text-truncate">{{ ticket.customerName }}</div>
                  <div class="text-gray-500 dark:text-gray-400 text-sm text-truncate">{{ ticket.customerEmail }}</div>
                </td>
                <td class="table-cell hidden xl:table-cell text-truncate">{{ ticket.assignedAgentName || 'Unassigned' }}</td>
                <td class="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400">{{ ticket.createdAt | date:'short' }}</td>
                <td class="table-cell">
                  <div class="flex space-x-1">
                    <a [routerLink]="['/tickets', ticket.id]" class="btn-icon text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" title="View">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ filteredTickets.length }} of {{ tickets.length }} tickets
          </div>
          <div class="flex space-x-2">
            <button class="btn-secondary text-sm">Previous</button>
            <button class="btn-secondary text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedStatus: string = '';
  selectedPriority: string = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.ticketService.getTickets().subscribe(tickets => {
      this.tickets = tickets;
      this.filteredTickets = tickets;
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const statusMatch = !this.selectedStatus || ticket.status === this.selectedStatus;
      const priorityMatch = !this.selectedPriority || ticket.priority === this.selectedPriority;
      return statusMatch && priorityMatch;
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