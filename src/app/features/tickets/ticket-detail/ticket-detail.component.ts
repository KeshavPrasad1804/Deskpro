import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, TicketStatus, TicketPriority, TicketComment } from '../../../core/models/ticket.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container-responsive py-6" *ngIf="ticket">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="btn-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="page-title">Ticket #{{ ticket.id }}</h1>
            <p class="page-subtitle text-truncate">{{ ticket.subject }}</p>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button 
            *ngIf="canEditTicket"
            (click)="toggleEditMode()" 
            class="btn-secondary w-full sm:w-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            {{ isEditMode ? 'Cancel' : 'Edit' }}
          </button>
          <button 
            *ngIf="canDeleteTicket"
            (click)="deleteTicket()" 
            class="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 w-full sm:w-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Ticket Details -->
          <div class="card p-6" *ngIf="!isEditMode">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
            <div class="prose prose-sm max-w-none dark:prose-invert">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ ticket.description }}</p>
            </div>
          </div>

          <!-- Edit Form -->
          <div class="card p-6" *ngIf="isEditMode">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Ticket</h3>
            <form [formGroup]="editForm" (ngSubmit)="saveTicket()" class="space-y-4">
              <div>
                <label class="form-label">Subject</label>
                <input type="text" formControlName="subject" class="form-input">
              </div>
              <div>
                <label class="form-label">Description</label>
                <textarea formControlName="description" rows="6" class="form-input"></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Status</label>
                  <select formControlName="status" class="form-input">
                    <option value="open">🟢 Open</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="resolved">✅ Resolved</option>
                    <option value="closed">🔒 Closed</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Priority</label>
                  <select formControlName="priority" class="form-input">
                    <option value="low">🟢 Low</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button type="submit" [disabled]="editForm.invalid || isLoading" class="btn-primary w-full sm:w-auto">
                  <div *ngIf="isLoading" class="spinner w-4 h-4"></div>
                  Save Changes
                </button>
                <button type="button" (click)="toggleEditMode()" class="btn-secondary w-full sm:w-auto">Cancel</button>
              </div>
            </form>
          </div>

          <!-- Comments -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Comments & Updates</h3>
            </div>
            <div class="p-6">
              <!-- Add Comment Form -->
              <form [formGroup]="commentForm" (ngSubmit)="addComment()" class="mb-6">
                <div class="mb-4">
                  <label class="form-label">Add Comment</label>
                  <textarea 
                    formControlName="content" 
                    rows="4" 
                    class="form-input" 
                    placeholder="Type your comment here..."></textarea>
                </div>
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      formControlName="isInternal" 
                      id="internal" 
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                    <label for="internal" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Internal note (not visible to customer)
                    </label>
                  </div>
                  <button type="submit" [disabled]="commentForm.invalid || isAddingComment" class="btn-primary w-full sm:w-auto">
                    <div *ngIf="isAddingComment" class="spinner w-4 h-4"></div>
                    Add Comment
                  </button>
                </div>
              </form>

              <!-- Comments List -->
              <div class="space-y-4">
                <div *ngFor="let comment of ticket.comments" class="comment-item" 
                     [class]="comment.isInternal ? 'comment-internal' : 'comment-public'">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {{ getAuthorInitials(comment.authorName) }}
                        </span>
                      </div>
                      <span class="font-medium text-gray-900 dark:text-white">{{ comment.authorName }}</span>
                      <span *ngIf="comment.isInternal" class="comment-badge">Internal</span>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ comment.createdAt | date:'medium' }}</span>
                  </div>
                  <div class="ml-10">
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ comment.content }}</p>
                  </div>
                </div>
                <div *ngIf="ticket.comments.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <p>No comments yet. Be the first to add one!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Ticket Info -->
          <div class="card p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Ticket Information</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd class="mt-1">
                  <span [class]="'status-badge ' + getStatusClass(ticket.status)">
                    {{ getStatusDisplay(ticket.status) }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
                <dd class="mt-1">
                  <span [class]="'status-badge ' + getPriorityClass(ticket.priority)">
                    {{ getPriorityDisplay(ticket.priority) }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ ticket.createdAt | date:'medium' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ ticket.updatedAt | date:'medium' }}</dd>
              </div>
              <div *ngIf="ticket.dueDate">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ ticket.dueDate | date:'medium' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Customer Info -->
          <div class="card p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer</h3>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ getCustomerInitials(ticket.customerName) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 dark:text-white text-truncate">{{ ticket.customerName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 text-truncate">{{ ticket.customerEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Assignment -->
          <div class="card p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignment</h3>
            <div *ngIf="ticket.assignedAgentName; else unassigned">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {{ getAgentInitials(ticket.assignedAgentName) }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-gray-900 dark:text-white text-truncate">{{ ticket.assignedAgentName }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Assigned Agent</p>
                </div>
              </div>
            </div>
            <ng-template #unassigned>
              <p class="text-gray-500 dark:text-gray-400 mb-3">Unassigned</p>
              <button *ngIf="canAssignTicket" (click)="assignToMe()" class="btn-secondary w-full">
                Assign to Me
              </button>
            </ng-template>
          </div>

          <!-- Tags -->
          <div class="card p-6" *ngIf="ticket.tags.length > 0">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let tag of ticket.tags" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card p-6" *ngIf="canEditTicket">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <button 
                *ngIf="ticket.status !== TicketStatus.RESOLVED"
                (click)="quickStatusUpdate(TicketStatus.RESOLVED)"
                class="btn-secondary w-full text-green-600 hover:text-green-700 dark:text-green-400">
                ✅ Mark as Resolved
              </button>
              <button 
                *ngIf="ticket.status !== TicketStatus.CLOSED"
                (click)="quickStatusUpdate(TicketStatus.CLOSED)"
                class="btn-secondary w-full text-gray-600 hover:text-gray-700 dark:text-gray-400">
                🔒 Close Ticket
              </button>
              <button 
                *ngIf="ticket.status === TicketStatus.CLOSED"
                (click)="quickStatusUpdate(TicketStatus.OPEN)"
                class="btn-secondary w-full text-blue-600 hover:text-blue-700 dark:text-blue-400">
                🔄 Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!ticket && !error" class="container-responsive py-6">
      <div class="flex items-center justify-center py-12">
        <div class="spinner w-8 h-8"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">Loading ticket...</span>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="container-responsive py-6">
      <div class="card p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Ticket Not Found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button (click)="goBack()" class="btn-primary">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .comment-item {
      @apply border-l-4 pl-4 py-3;
    }

    .comment-public {
      @apply border-blue-400 bg-blue-50 dark:bg-blue-900/20;
    }

    .comment-internal {
      @apply border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20;
    }

    .comment-badge {
      @apply text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full;
    }

    .prose {
      @apply text-gray-700;
    }

    .prose.dark\:prose-invert {
      @apply dark:text-gray-300;
    }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  editForm: FormGroup;
  commentForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isAddingComment = false;
  error: string | null = null;
  TicketStatus = TicketStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required]
    });

    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      isInternal: [false]
    });
  }

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  private loadTicket(id: string): void {
    this.ticketService.getTicket(id).subscribe({
      next: (ticket) => {
        if (ticket) {
          this.ticket = ticket;
          this.editForm.patchValue({
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority
          });
        } else {
          this.error = 'Ticket not found';
        }
      },
      error: (error) => {
        this.error = 'Failed to load ticket';
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.ticket) {
      // Reset form when canceling edit
      this.editForm.patchValue({
        subject: this.ticket.subject,
        description: this.ticket.description,
        status: this.ticket.status,
        priority: this.ticket.priority
      });
    }
  }

  saveTicket(): void {
    if (this.editForm.valid && this.ticket) {
      this.isLoading = true;
      this.ticketService.updateTicket(this.ticket.id, this.editForm.value).subscribe({
        next: (updatedTicket) => {
          if (updatedTicket) {
            this.ticket = updatedTicket;
            this.isEditMode = false;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          // Handle error
        }
      });
    }
  }

  addComment(): void {
    if (this.commentForm.valid && this.ticket) {
      this.isAddingComment = true;
      const currentUser = this.authService.getCurrentUser();
      
      const newComment: TicketComment = {
        id: Math.random().toString(36).substr(2, 9),
        ticketId: this.ticket.id,
        content: this.commentForm.value.content,
        isInternal: this.commentForm.value.isInternal,
        authorId: currentUser?.id || '',
        authorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add comment to ticket (in a real app, this would be an API call)
      this.ticket.comments.push(newComment);
      this.commentForm.reset({ isInternal: false });
      this.isAddingComment = false;
    }
  }

  quickStatusUpdate(status: TicketStatus): void {
    if (this.ticket) {
      this.ticketService.updateTicket(this.ticket.id, { status }).subscribe({
        next: (updatedTicket) => {
          if (updatedTicket) {
            this.ticket = updatedTicket;
          }
        }
      });
    }
  }

  assignToMe(): void {
    if (this.ticket) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.ticketService.updateTicket(this.ticket.id, { 
          assignedAgentId: currentUser.id 
        }).subscribe({
          next: (updatedTicket) => {
            if (updatedTicket) {
              this.ticket = updatedTicket;
            }
          }
        });
      }
    }
  }

  deleteTicket(): void {
    if (this.ticket && confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(this.ticket.id).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/tickets']);
          }
        },
        error: (error) => {
          // Handle error
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }

  getCustomerInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAgentInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  get canEditTicket(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
  }

  get canDeleteTicket(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  get canAssignTicket(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
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

  getStatusDisplay(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OPEN:
        return '🟢 Open';
      case TicketStatus.IN_PROGRESS:
        return '🔄 In Progress';
      case TicketStatus.PENDING:
        return '⏳ Pending';
      case TicketStatus.RESOLVED:
        return '✅ Resolved';
      case TicketStatus.CLOSED:
        return '🔒 Closed';
      default:
        return status;
    }
  }

  getPriorityDisplay(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.LOW:
        return '🟢 Low';
      case TicketPriority.NORMAL:
        return '🟡 Normal';
      case TicketPriority.HIGH:
        return '🟠 High';
      case TicketPriority.URGENT:
        return '🔴 Urgent';
      default:
        return priority;
    }
  }
}