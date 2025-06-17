import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { uploadMultiple, handleUploadError } from '../middleware/upload';
import { ApiResponse } from '../types';
import db from '../config/database';

const router = Router();

// Upload files
router.post('/', authenticateToken, uploadMultiple, handleUploadError, (req: AuthenticatedRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { entityType, entityId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      } as ApiResponse);
    }

    const attachments = files.map(file => {
      const attachmentId = uuidv4();
      
      // Save file info to database
      const stmt = db.prepare(`
        INSERT INTO file_attachments (id, file_name, original_name, mime_type, file_size, file_path, uploaded_by, entity_type, entity_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        attachmentId,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        file.path,
        req.user!.userId,
        entityType || 'general',
        entityId || ''
      );

      return {
        id: attachmentId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        url: `/api/upload/files/${attachmentId}`,
        uploadedAt: new Date(),
        uploadedBy: req.user!.userId
      };
    });

    res.status(201).json({
      success: true,
      data: attachments,
      message: 'Files uploaded successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    } as ApiResponse);
  }
});

// Get file
router.get('/files/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('SELECT * FROM file_attachments WHERE id = ?');
    const file = stmt.get(id) as any;

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      } as ApiResponse);
    }

    res.sendFile(file.file_path, { root: '.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    } as ApiResponse);
  }
});

// Delete file
router.delete('/files/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('SELECT * FROM file_attachments WHERE id = ?');
    const file = stmt.get(id) as any;

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      } as ApiResponse);
    }

    // Check if user owns the file or is admin
    if (file.uploaded_by !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse);
    }

    // Delete from database
    const deleteStmt = db.prepare('DELETE FROM file_attachments WHERE id = ?');
    deleteStmt.run(id);

    // TODO: Delete physical file from filesystem

    res.json({
      success: true,
      message: 'File deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    } as ApiResponse);
  }
});

export default router;