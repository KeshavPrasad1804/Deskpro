import { Router } from 'express';
import { userService } from '../services/userService';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { ApiResponse } from '../types';

const router = Router();

// Get current user profile
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const user = userService.getUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    } as ApiResponse);
  }
});

// Update current user profile
router.put('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    
    const user = userService.updateUser(req.user!.userId, {
      firstName,
      lastName,
      avatar
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, validateRequest({ query: schemas.pagination }), (req, res) => {
  try {
    const { page, limit } = req.query as any;
    const { role, isActive } = req.query as any;

    const filters: any = { page, limit };
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const { users, total } = userService.getAllUsers(filters);

    res.json({
      success: true,
      data: users,
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
      error: 'Failed to fetch users'
    } as ApiResponse);
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateRequest({ params: schemas.id }), (req, res) => {
  try {
    const { id } = req.params;
    const user = userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    } as ApiResponse);
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateRequest({ params: schemas.id }), (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, isActive, avatar } = req.body;

    const user = userService.updateUser(id, {
      firstName,
      lastName,
      isActive,
      avatar
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateRequest({ params: schemas.id }), (req, res) => {
  try {
    const { id } = req.params;

    const success = userService.deleteUser(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    } as ApiResponse);
  }
});

export default router;