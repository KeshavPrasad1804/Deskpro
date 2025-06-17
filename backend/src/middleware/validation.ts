import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join('; ')
      } as ApiResponse);
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  id: Joi.object({
    id: Joi.string().required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('admin', 'agent', 'customer').default('customer')
  }),

  createTicket: Joi.object({
    subject: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').required(),
    customerId: Joi.string().optional(),
    customerEmail: Joi.string().email().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  updateTicket: Joi.object({
    subject: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(10).optional(),
    status: Joi.string().valid('open', 'in_progress', 'pending', 'resolved', 'closed').optional(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional(),
    assignedAgentId: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  createComment: Joi.object({
    content: Joi.string().min(1).required(),
    isInternal: Joi.boolean().default(false)
  }),

  createArticle: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(10).required(),
    excerpt: Joi.string().max(500).optional(),
    categoryId: Joi.string().required(),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    visibility: Joi.string().valid('public', 'internal', 'restricted').default('public'),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  updateArticle: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    content: Joi.string().min(10).optional(),
    excerpt: Joi.string().max(500).optional(),
    categoryId: Joi.string().optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    visibility: Joi.string().valid('public', 'internal', 'restricted').optional(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  createCategory: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    parentId: Joi.string().optional(),
    icon: Joi.string().optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),

  chatMessage: Joi.object({
    content: Joi.string().min(1).required(),
    messageType: Joi.string().valid('text', 'image', 'file', 'system').default('text')
  })
};