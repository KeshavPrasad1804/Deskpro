import { Router } from 'express';
import { taskService } from '../services/taskService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { ApiResponse } from '../types';

const router = Router();

// Get all tasks
router.get('/', authenticateToken, validateRequest({ query: schemas.pagination }), (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query as any;
    const { status, priority, assignedTo } = req.query as any;

    const filters: any = { page, limit };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;

    const { tasks, total } = taskService.getAllTasks(filters);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    } as ApiResponse);
  }
});

// Get task by ID
router.get('/:id', authenticateToken, validateRequest({ params: schemas.id }), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const task = taskService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    res.json({ success: true, data: task } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' } as ApiResponse);
  }
});

// Create task
router.post('/', authenticateToken, validateRequest({ body: schemas.createTask }), (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const task = taskService.createTask({
      title,
      description,
      priority,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message } as ApiResponse);
  }
});

// Update task
router.put('/:id', authenticateToken, validateRequest({ params: schemas.id, body: schemas.updateTask }), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.dueDate !== undefined) {
      updates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    const task = taskService.updateTask(id, updates);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' } as ApiResponse);
    }

    res.json({ success: true, data: task, message: 'Task updated successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message } as ApiResponse);
  }
});

// Delete task
router.delete('/:id', authenticateToken, validateRequest({ params: schemas.id }), (req, res) => {
  try {
    const { id } = req.params;
    const success = taskService.deleteTask(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Task not found' } as ApiResponse);
    }
    res.json({ success: true, message: 'Task deleted successfully' } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete task' } as ApiResponse);
  }
});

export default router;
