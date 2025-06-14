import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatSession, ChatMessage, ChatStatus, MessageType } from '../../core/models/chat.model';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { FileAttachment } from '../../core/models/attachment.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  template: `
    <div class="chat-layout">
      <!-- Chat Sessions Sidebar -->
      <div class="chat-sidebar">
        <!-- Header -->
        <div class="sidebar-header">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Live Chat</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ chatSessions.length }} active sessions</p>
        </div>

        <!-- Session Filters -->
        <div class="filter-section">
          <div class="flex space-x-2">
            <button 
              (click)="filterStatus = ''"
              [class]="'btn-filter ' + (filterStatus === '' ? 'active' : '')">
              All
            </button>
            <button 
              (click)="filterStatus = 'waiting'"
              [class]="'btn-filter ' + (filterStatus === 'waiting' ? 'active' : '')">
              Waiting
            </button>
            <button 
              (click)="filterStatus = 'active'"
              [class]="'btn-filter ' + (filterStatus === 'active' ? 'active' : '')">
              Active
            </button>
          </div>
        </div>

        <!-- Sessions List -->
        <div class="chat-sessions scrollbar-thin">
          <div class="space-y-1 p-2">
            <div 
              *ngFor="let session of filteredSessions" 
              (click)="selectSession(session)"
              [class]="'session-item ' + (activeSession?.id === session.id ? 'active' : '') + ' ' + getSessionStatusClass(session.status)">
              
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ getCustomerInitials(session.customerName) }}
                    </span>
                  </div>
                  <div [class]="'status-indicator ' + session.status"></div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ session.customerName }}
                    </p>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ getTimeAgo(session.startedAt) }}
                    </span>
                  </div>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ session.customerEmail }}
                  </p>
                  
                  <div *ngIf="session.messages.length > 0" class="mt-1">
                    <p class="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {{ getLastMessage(session) }}
                    </p>
                  </div>
                </div>
                
                <div *ngIf="getUnreadCount(session) > 0" class="unread-badge">
                  {{ getUnreadCount(session) }}
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredSessions.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
            No chat sessions found
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-main" *ngIf="activeSession">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ getCustomerInitials(activeSession.customerName) }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ activeSession.customerName }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ activeSession.customerEmail }} • {{ getSessionStatusText(activeSession.status) }}
                </p>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button 
                *ngIf="activeSession.status === 'waiting'"
                (click)="assignToMe(activeSession.id)"
                class="btn-primary text-sm">
                Accept Chat
              </button>
              <button 
                *ngIf="activeSession.status === 'active'"
                (click)="endChat(activeSession.id)"
                class="btn-secondary text-sm">
                End Chat
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div #messagesContainer class="chat-messages scrollbar-thin">
          <div *ngFor="let message of activeSession.messages" [class]="'message ' + message.senderType">
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message-time">{{ message.timestamp | date:'short' }}</span>
              </div>
              
              <div class="message-body">
                <p>{{ message.content }}</p>
                
                <!-- Attachments -->
                <div *ngIf="message.attachments && message.attachments.length > 0" class="message-attachments">
                  <div *ngFor="let attachment of message.attachments" class="attachment-item">
                    <a [href]="attachment.url" target="_blank" class="attachment-link">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      {{ attachment.fileName }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input" *ngIf="activeSession.status === 'active'">
          <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="space-y-3">
            <!-- File Upload -->
            <div *ngIf="showFileUpload" class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <app-file-upload
                [multiple]="true"
                [(attachments)]="messageAttachments"
                (fileUploaded)="onFileUploaded($event)">
              </app-file-upload>
            </div>
            
            <div class="flex space-x-2">
              <div class="flex-1">
                <textarea
                  formControlName="content"
                  rows="2"
                  class="form-input resize-none"
                  placeholder="Type your message..."
                  (keydown)="onKeyDown($event)">
                </textarea>
              </div>
              
              <div class="flex flex-col space-y-2">
                <button
                  type="button"
                  (click)="toggleFileUpload()"
                  class="btn-icon"
                  title="Attach file">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                </button>
                
                <button
                  type="submit"
                  [disabled]="messageForm.invalid || isSending"
                  class="btn-primary">
                  <svg *ngIf="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  <div *ngIf="isSending" class="spinner w-4 h-4"></div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- No Session Selected -->
      <div *ngIf="!activeSession" class="chat-empty">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Chat Selected</h3>
          <p class="text-gray-500 dark:text-gray-400">Select a chat session to start messaging</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: flex;
      height: calc(100vh - 4rem);
      background-color: rgb(249 250 251);
    }

    .chat-layout.dark {
      background-color: rgb(17 24 39);
    }

    .chat-sidebar {
      width: 20rem;
      background-color: white;
      border-right: 1px solid rgb(229 231 235);
      display: flex;
      flex-direction: column;
    }

    .chat-sidebar.dark {
      background-color: rgb(31 41 55);
      border-right-color: rgb(55 65 81);
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid rgb(229 231 235);
      flex-shrink: 0;
    }

    .sidebar-header.dark {
      border-bottom-color: rgb(55 65 81);
    }

    .filter-section {
      padding: 1rem;
      border-bottom: 1px solid rgb(229 231 235);
      flex-shrink: 0;
    }

    .filter-section.dark {
      border-bottom-color: rgb(55 65 81);
    }

    .chat-sessions {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .chat-header {
      background-color: white;
      border-bottom: 1px solid rgb(229 231 235);
      padding: 1rem;
      flex-shrink: 0;
    }

    .chat-header.dark {
      background-color: rgb(31 41 55);
      border-bottom-color: rgb(55 65 81);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 1rem;
      background-color: rgb(249 250 251);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chat-messages.dark {
      background-color: rgb(17 24 39);
    }

    .message-input {
      background-color: white;
      border-top: 1px solid rgb(229 231 235);
      padding: 1rem;
      flex-shrink: 0;
    }

    .message-input.dark {
      background-color: rgb(31 41 55);
      border-top-color: rgb(55 65 81);
    }

    .chat-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgb(249 250 251);
    }

    .chat-empty.dark {
      background-color: rgb(17 24 39);
    }

    .btn-filter {
      @apply px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-200;
    }
    
    .btn-filter:not(.active) {
      @apply border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700;
    }
    
    .btn-filter.active {
      @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300;
    }

    .session-item {
      @apply p-3 rounded-lg cursor-pointer transition-colors duration-200 border-l-4;
    }
    
    .session-item:not(.active) {
      @apply hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent;
    }
    
    .session-item.active {
      @apply bg-primary-50 dark:bg-primary-900/20 border-primary-500;
    }
    
    .session-item.waiting {
      @apply border-l-yellow-400;
    }
    
    .session-item.active:not(.session-item) {
      @apply border-l-green-400;
    }

    .status-indicator {
      @apply absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800;
    }
    
    .status-indicator.waiting {
      @apply bg-yellow-400;
    }
    
    .status-indicator.active {
      @apply bg-green-400;
    }
    
    .status-indicator.ended {
      @apply bg-gray-400;
    }

    .unread-badge {
      @apply bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium;
    }

    .message {
      @apply flex;
    }
    
    .message.customer {
      @apply justify-start;
    }
    
    .message.agent {
      @apply justify-end;
    }
    
    .message.system {
      @apply justify-center;
    }

    .message-content {
      @apply max-w-xs lg:max-w-md;
    }
    
    .message.customer .message-content {
      @apply bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm;
    }
    
    .message.agent .message-content {
      @apply bg-primary-500 text-white rounded-lg p-3;
    }
    
    .message.system .message-content {
      @apply bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-4 py-2 text-sm;
    }

    .message-header {
      @apply flex items-center justify-between mb-1;
    }

    .sender-name {
      @apply text-xs font-medium;
    }
    
    .message.customer .sender-name {
      @apply text-gray-900 dark:text-gray-100;
    }
    
    .message.agent .sender-name {
      @apply text-white/90;
    }

    .message-time {
      @apply text-xs opacity-75;
    }

    .message-body p {
      @apply text-sm whitespace-pre-wrap;
    }

    .message-attachments {
      @apply mt-2 space-y-1;
    }

    .attachment-item {
      @apply text-xs;
    }

    .attachment-link {
      @apply flex items-center space-x-1 hover:underline;
    }
    
    .message.customer .attachment-link {
      @apply text-primary-600 dark:text-primary-400;
    }
    
    .message.agent .attachment-link {
      @apply text-white/90;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .chat-layout {
        height: calc(100vh - 4rem);
      }

      .chat-sidebar {
        width: 100%;
        position: absolute;
        z-index: 10;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
      }

      .chat-sidebar.mobile-open {
        transform: translateX(0);
      }

      .chat-main {
        width: 100%;
      }
    }
  `]
})
export class LiveChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatSessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;
  messageForm: FormGroup;
  messageAttachments: FileAttachment[] = [];
  filterStatus = '';
  showFileUpload = false;
  isSending = false;
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadChatSessions();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private loadChatSessions(): void {
    const sub = this.chatService.getChatSessions().subscribe(sessions => {
      this.chatSessions = sessions;
    });
    this.subscriptions.push(sub);
  }

  private subscribeToUpdates(): void {
    const sub = this.chatService.chatSessions$.subscribe(sessions => {
      this.chatSessions = sessions;
      
      // Update active session if it exists
      if (this.activeSession) {
        const updatedSession = sessions.find(s => s.id === this.activeSession!.id);
        if (updatedSession) {
          const oldMessageCount = this.activeSession.messages.length;
          this.activeSession = updatedSession;
          
          // Scroll to bottom if new messages arrived
          if (updatedSession.messages.length > oldMessageCount) {
            this.shouldScrollToBottom = true;
          }
        }
      }
    });
    this.subscriptions.push(sub);
  }

  get filteredSessions(): ChatSession[] {
    if (!this.filterStatus) {
      return this.chatSessions;
    }
    return this.chatSessions.filter(session => session.status === this.filterStatus);
  }

  selectSession(session: ChatSession): void {
    this.activeSession = session;
    this.chatService.setActiveChat(session);
    this.shouldScrollToBottom = true;
    
    // Mark messages as read
    this.chatService.markMessagesAsRead(session.id).subscribe();
  }

  assignToMe(sessionId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.chatService.assignAgent(sessionId, currentUser.id).subscribe();
    }
  }

  endChat(sessionId: string): void {
    if (confirm('Are you sure you want to end this chat session?')) {
      this.chatService.endChatSession(sessionId).subscribe(() => {
        if (this.activeSession?.id === sessionId) {
          this.activeSession = null;
        }
      });
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.activeSession) {
      this.isSending = true;
      
      const request = {
        sessionId: this.activeSession.id,
        content: this.messageForm.value.content,
        attachments: this.messageAttachments.length > 0 ? this.messageAttachments : undefined
      };

      this.chatService.sendMessage(request).subscribe({
        next: () => {
          this.messageForm.reset();
          this.messageAttachments = [];
          this.showFileUpload = false;
          this.isSending = false;
          this.shouldScrollToBottom = true;
        },
        error: () => {
          this.isSending = false;
        }
      });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleFileUpload(): void {
    this.showFileUpload = !this.showFileUpload;
  }

  onFileUploaded(attachment: FileAttachment): void {
    // File is already added to messageAttachments by the component
  }

  getCustomerInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  getLastMessage(session: ChatSession): string {
    if (session.messages.length === 0) return '';
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 50 ? 
           lastMessage.content.substring(0, 50) + '...' : 
           lastMessage.content;
  }

  getUnreadCount(session: ChatSession): number {
    return session.messages.filter(m => !m.isRead && m.senderType === 'customer').length;
  }

  getSessionStatusClass(status: ChatStatus): string {
    return status;
  }

  getSessionStatusText(status: ChatStatus): string {
    switch (status) {
      case ChatStatus.WAITING: return 'Waiting for agent';
      case ChatStatus.ACTIVE: return 'Active';
      case ChatStatus.ENDED: return 'Ended';
      case ChatStatus.TRANSFERRED: return 'Transferred';
      default: return status;
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}