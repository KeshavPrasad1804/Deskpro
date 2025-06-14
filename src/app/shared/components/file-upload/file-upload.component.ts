import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { FileAttachment } from '../../../core/models/attachment.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <!-- Drop Zone -->
      <div 
        class="drop-zone"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file"
          [multiple]="multiple"
          [accept]="acceptedTypes"
          (change)="onFileSelect($event)"
          class="hidden">
        
        <div class="drop-zone-content">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          
          <p class="upload-text">
            <span class="upload-link">Click to upload</span> or drag and drop
          </p>
          
          <p class="upload-hint">
            {{ acceptedTypesText }} up to {{ maxSizeText }}
          </p>
        </div>
      </div>

      <!-- Upload Progress -->
      <div *ngIf="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>
        <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
      </div>

      <!-- File List -->
      <div *ngIf="attachments.length > 0" class="file-list">
        <h4 class="file-list-title">Attached Files</h4>
        <div class="file-items">
          <div *ngFor="let file of attachments; trackBy: trackByFileId" class="file-item">
            <div class="file-info">
              <div class="file-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        [attr.d]="getFileIconPath(file.mimeType)"/>
                </svg>
              </div>
              <div class="file-details">
                <p class="file-name">{{ file.fileName }}</p>
                <p class="file-size">{{ formatFileSize(file.fileSize) }}</p>
              </div>
            </div>
            <button 
              (click)="removeFile(file.id)"
              class="remove-button"
              type="button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Error Messages -->
      <div *ngIf="errorMessage" class="error-message">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      @apply space-y-4;
    }

    .drop-zone {
      @apply border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 hover:border-primary-400 dark:hover:border-primary-500;
    }

    .drop-zone.drag-over {
      @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20;
    }

    .drop-zone-content {
      @apply space-y-2;
    }

    .upload-icon {
      @apply mx-auto h-12 w-12 text-gray-400;
    }

    .upload-text {
      @apply text-sm text-gray-600 dark:text-gray-400;
    }

    .upload-link {
      @apply font-medium text-primary-600 dark:text-primary-400;
    }

    .upload-hint {
      @apply text-xs text-gray-500 dark:text-gray-500;
    }

    .upload-progress {
      @apply space-y-2;
    }

    .progress-bar {
      @apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2;
    }

    .progress-fill {
      @apply bg-primary-600 h-2 rounded-full transition-all duration-300;
    }

    .progress-text {
      @apply text-sm text-gray-600 dark:text-gray-400 text-center;
    }

    .file-list {
      @apply space-y-3;
    }

    .file-list-title {
      @apply text-sm font-medium text-gray-900 dark:text-gray-100;
    }

    .file-items {
      @apply space-y-2;
    }

    .file-item {
      @apply flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
    }

    .file-info {
      @apply flex items-center space-x-3;
    }

    .file-icon {
      @apply w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400;
    }

    .file-details {
      @apply space-y-1;
    }

    .file-name {
      @apply text-sm font-medium text-gray-900 dark:text-gray-100;
    }

    .file-size {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .remove-button {
      @apply p-1 text-gray-400 hover:text-red-500 transition-colors duration-200;
    }

    .error-message {
      @apply flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm;
    }

    .error-icon {
      @apply w-5 h-5 flex-shrink-0;
    }

    .hidden {
      @apply sr-only;
    }
  `]
})
export class FileUploadComponent {
  @Input() multiple = true;
  @Input() acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt';
  @Input() maxSize = 10 * 1024 * 1024; // 10MB
  @Input() attachments: FileAttachment[] = [];
  @Output() attachmentsChange = new EventEmitter<FileAttachment[]>();
  @Output() fileUploaded = new EventEmitter<FileAttachment>();
  @Output() fileRemoved = new EventEmitter<string>();

  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';

  constructor(private fileUploadService: FileUploadService) {}

  get acceptedTypesText(): string {
    return 'PNG, JPG, PDF, DOC, TXT';
  }

  get maxSizeText(): string {
    return this.fileUploadService.formatFileSize(this.maxSize);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    this.errorMessage = '';
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    this.fileUploadService.uploadFile(file).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        setTimeout(() => {
          this.isUploading = false;
          this.uploadProgress = 0;
        }, 500);

        if (response.success && response.attachment) {
          this.attachments.push(response.attachment);
          this.attachmentsChange.emit(this.attachments);
          this.fileUploaded.emit(response.attachment);
        } else {
          this.errorMessage = response.error || 'Upload failed';
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.errorMessage = 'Upload failed. Please try again.';
      }
    });
  }

  removeFile(fileId: string): void {
    const index = this.attachments.findIndex(f => f.id === fileId);
    if (index !== -1) {
      this.attachments.splice(index, 1);
      this.attachmentsChange.emit(this.attachments);
      this.fileRemoved.emit(fileId);
    }
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  getFileIconPath(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
    if (mimeType === 'application/pdf') {
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
    return 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13';
  }

  trackByFileId(index: number, file: FileAttachment): string {
    return file.id;
  }
}