import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FileAttachment, UploadResponse, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../models/attachment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private authService: AuthService) {}

  uploadFile(file: File): Observable<UploadResponse> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      return of({ success: false, error: validation.error });
    }

    // Mock upload - in real app, this would upload to cloud storage
    const mockAttachment: FileAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file), // Mock URL
      uploadedAt: new Date(),
      uploadedBy: this.authService.getCurrentUser()?.id || '',
      uploadedByName: this.authService.getCurrentUser()?.firstName + ' ' + this.authService.getCurrentUser()?.lastName || 'Unknown'
    };

    return of({ success: true, attachment: mockAttachment });
  }

  uploadMultipleFiles(files: FileList): Observable<UploadResponse[]> {
    const uploads: Observable<UploadResponse>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      uploads.push(this.uploadFile(files[i]));
    }

    // In a real app, you'd use forkJoin to handle multiple uploads
    return of([]); // Simplified for mock
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    return { isValid: true };
  }

  deleteFile(attachmentId: string): Observable<boolean> {
    // Mock delete
    return of(true);
  }

  getFileUrl(attachmentId: string): string {
    // Mock URL generation
    return `https://example.com/files/${attachmentId}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType === 'application/pdf') return 'description';
    if (mimeType.includes('word')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'table_chart';
    return 'attach_file';
  }
}