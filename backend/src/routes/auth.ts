import { Router } from 'express';
import { userService } from '../services/userService';
import { validateRequest, schemas } from '../middleware/validation';
import { ApiResponse } from '../types';

const router = Router();

// Register
router.post('/register', validateRequest({ body: schemas.register }), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      role
    });

    const tokens = userService.generateTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        ...tokens
      },
      message: 'User registered successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Login
router.post('/login', validateRequest({ body: schemas.login }), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
    }

    const tokens = userService.generateTokens(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        ...tokens
      },
      message: 'Login successful'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      } as ApiResponse);
    }

    // In a real app, you'd verify the refresh token and check if it's valid
    // For now, we'll just return a new access token
    res.json({
      success: true,
      data: {
        accessToken: 'new-access-token'
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    } as ApiResponse);
  }
});

export default router;