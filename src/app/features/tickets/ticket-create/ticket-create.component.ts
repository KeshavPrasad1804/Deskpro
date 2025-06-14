import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateTicketRequest, TicketPriority } from '../../../core/models/ticket.model';
import { UserRole } from '../../../core/models/user.model';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { FileAttachment } from '../../../core/models/attachment.model';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FileUploadComponent],
  template: `
    <div class="container-responsive py-6">
      <!-- Header -->
      <div class="flex items-center space-x-4 mb-6">
        <button (click)="goBack()" class="btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="page-header">
          <h1 class="page-title">Create New Ticket</h1>
          <p class="page-subtitle">Submit a new support request</p>
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Form -->
          <div class="lg:col-span-2">
            <div class="card p-6">
              <form [formGroup]="ticketForm" (ngSubmit)="createTicket()" class="space-y-6">
                <!-- Subject -->
                <div>
                  <label for="subject" class="form-label">Subject *</label>
                  <input
                    id="subject"
                    type="text"
                    formControlName="subject"
                    class="form-input"
                    placeholder="Brief description of the issue"
                  />
                  <div *ngIf="ticketForm.get('subject')?.invalid && ticketForm.get('subject')?.touched" class="form-error">
                    Subject is required
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label for="description" class="form-label">Description *</label>
                  <textarea
                    id="description"
                    formControlName="description"
                    rows="8"
                    class="form-input"
                    placeholder="Detailed description of the issue, including steps to reproduce if applicable"
                  ></textarea>
                  <div *ngIf="ticketForm.get('description')?.invalid && ticketForm.get('description')?.touched" class="form-error">
                    Description is required
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Be as specific as possible. Include error messages, screenshots, and steps to reproduce.
                  </p>
                </div>

                <!-- Priority -->
                <div>
                  <label for="priority" class="form-label">Priority *</label>
                  <select id="priority" formControlName="priority" class="form-input">
                    <option value="">Select priority</option>
                    <option value="low">🟢 Low - General questions or minor issues</option>
                    <option value="normal">🟡 Normal - Standard support requests</option>
                    <option value="high">🟠 High - Issues affecting productivity</option>
                    <option value="urgent">🔴 Urgent - Critical issues requiring immediate attention</option>
                  </select>
                  <div *ngIf="ticketForm.get('priority')?.invalid && ticketForm.get('priority')?.touched" class="form-error">
                    Priority is required
                  </div>
                </div>

                <!-- Customer Email (for agents/admins) -->
                <div *ngIf="isAgentOrAdmin">
                  <label for="customerEmail" class="form-label">Customer Email</label>
                  <input
                    id="customerEmail"
                    type="email"
                    formControlName="customerEmail"
                    class="form-input"
                    placeholder="customer&#64;example.com"
                  />
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Leave empty to create ticket for yourself</p>
                </div>

                <!-- Tags -->
                <div>
                  <label for="tags" class="form-label">Tags</label>
                  <input
                    id="tags"
                    type="text"
                    formControlName="tags"
                    class="form-input"
                    placeholder="bug, feature-request, urgent (comma-separated)"
                  />
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add relevant tags separated by commas</p>
                </div>

                <!-- File Upload -->
                <div>
                  <label class="form-label">Attachments</label>
                  <app-file-upload
                    [multiple]="true"
                    [(attachments)]="attachments"
                    (fileUploaded)="onFileUploaded($event)">
                  </app-file-upload>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    type="submit"
                    [disabled]="ticketForm.invalid || isLoading"
                    class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <div *ngIf="isLoading" class="spinner w-4 h-4"></div>
                    {{ isLoading ? 'Creating...' : 'Create Ticket' }}
                  </button>
                  <button type="button" (click)="goBack()" class="btn-secondary w-full sm:w-auto">
                    Cancel
                  </button>
                </div>

                <!-- Error Message -->
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div class="text-sm text-red-700 dark:text-red-400">{{ errorMessage }}</div>
                </div>
              </form>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Tips Card -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">💡 Tips for Better Support</h3>
              <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li class="flex items-start space-x-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Be specific about the problem you're experiencing</span>
                </li>
                <li class="flex items-start space-x-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Include error messages or screenshots when possible</span>
                </li>
                <li class="flex items-start space-x-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Mention what you were trying to do when the issue occurred</span>
                </li>
                <li class="flex items-start space-x-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>List any troubleshooting steps you've already tried</span>
                </li>
              </ul>
            </div>

            <!-- Priority Guide -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">🎯 Priority Guidelines</h3>
              <div class="space-y-3 text-sm">
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Urgent</div>
                    <div class="text-gray-500 dark:text-gray-400">System down, security issues</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">High</div>
                    <div class="text-gray-500 dark:text-gray-400">Major functionality broken</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Normal</div>
                    <div class="text-gray-500 dark:text-gray-400">Standard requests</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Low</div>
                    <div class="text-gray-500 dark:text-gray-400">Questions, minor issues</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">📞 Need Immediate Help?</h3>
              <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Emergency Hotline</div>
                  <div>+1 (555) 123-4567</div>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Live Chat</div>
                  <div>Available 24/7 for urgent issues</div>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Email</div>
                  <div>support&#64;deskpro.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TicketCreateComponent {
  ticketForm: FormGroup;
  attachments: FileAttachment[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['', Validators.required],
      customerEmail: [''],
      tags: ['']
    });
  }

  get isAgentOrAdmin(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
  }

  onFileUploaded(attachment: FileAttachment): void {
    // File is already added to attachments array by the component
  }

  createTicket(): void {
    if (this.ticketForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.ticketForm.value;
      const currentUser = this.authService.getCurrentUser();

      const request: CreateTicketRequest = {
        subject: formValue.subject,
        description: formValue.description,
        priority: formValue.priority as TicketPriority,
        customerEmail: formValue.customerEmail || currentUser?.email,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
      };

      this.ticketService.createTicket(request).subscribe({
        next: (ticket) => {
          this.isLoading = false;
          this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create ticket. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.ticketForm.controls).forEach(key => {
        this.ticketForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }
}