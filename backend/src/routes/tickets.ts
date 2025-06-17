import { Router } from 'express';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { authenticateToken, requireAgentOrAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { ApiResponse, UserRole } from '../types';

const router = Router();

// Get all tickets
router.get('/', authenticateToken, validateRequest({ query: schemas.pagination }), (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as any;
    const { status, priority, customerId, assignedAgentId } = req.query as any;

    // If user is a customer, only show their tickets
    const filters: any = {};
    if (req.user?.role === UserRole.CUSTOMER) {
      filters.customerId = req.user.userId;
    } else {
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (customerId) filters.customerId = customerId;
      if (assignedAgentId) filters.assignedAgentId = assignedAgentId;
    }

    filters.page = page;
    filters.limit = limit;

    const { tickets, total } = ticketService.getAllTickets(filters);

    res.json({
      success: true,
      data: tickets,
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
      error: 'Failed to fetch tickets'
    } as ApiResponse);
  }
});

// Get ticket by ID
router.get('/:id', authenticateToken, validateRequest({ params: schemas.id }), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const ticket = ticketService.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Check permissions
    if (req.user?.role === UserRole.CUSTOMER && ticket.customerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse);
    }

    // Get comments
    const comments = ticketService.getTicketComments(id);

    res.json({
      success: true,
      data: {
        ...ticket,
        comments
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket'
    } as ApiResponse);
  }
});

// Create ticket
router.post('/', authenticateToken, validateRequest({ body: schemas.createTicket }), async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, description, priority, customerId, customerEmail, tags } = req.body;

    let finalCustomerId = customerId;

    // If no customerId provided, use current user or find by email
    if (!finalCustomerId) {
      if (req.user?.role === UserRole.CUSTOMER) {
        finalCustomerId = req.user.userId;
      } else if (customerEmail) {
        const customer = userService.getUserByEmail(customerEmail);
        if (!customer) {
          // Create customer if doesn't exist
          const newCustomer = await userService.createUser({
            email: customerEmail,
            password: Math.random().toString(36).slice(-8), // Temporary password
            firstName: 'Customer',
            lastName: 'User',
            role: UserRole.CUSTOMER
          });
          finalCustomerId = newCustomer.id;
        } else {
          finalCustomerId = customer.id;
        }
      } else {
        finalCustomerId = req.user!.userId;
      }
    }

    const ticket = ticketService.createTicket({
      subject,
      description,
      priority,
      customerId: finalCustomerId,
      tags
    });

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Update ticket
router.put('/:id', authenticateToken, validateRequest({ 
  params: schemas.id, 
  body: schemas.updateTicket 
}), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingTicket = ticketService.getTicketById(id);
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Check permissions
    if (req.user?.role === UserRole.CUSTOMER) {
      if (existingTicket.customerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        } as ApiResponse);
      }
      // Customers can only update subject and description
      const allowedFields = ['subject', 'description'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});
      
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update'
        } as ApiResponse);
      }
      
      const ticket = ticketService.updateTicket(id, filteredUpdates);
      return res.json({
        success: true,
        data: ticket,
        message: 'Ticket updated successfully'
      } as ApiResponse);
    }

    const ticket = ticketService.updateTicket(id, updates);

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Delete ticket
router.delete('/:id', authenticateToken, requireAgentOrAdmin, validateRequest({ params: schemas.id }), (req, res) => {
  try {
    const { id } = req.params;

    const success = ticketService.deleteTicket(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticket'
    } as ApiResponse);
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, validateRequest({ 
  params: schemas.id, 
  body: schemas.createComment 
}), (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;

    const ticket = ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Check permissions
    if (req.user?.role === UserRole.CUSTOMER && ticket.customerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      } as ApiResponse);
    }

    // Customers cannot create internal comments
    const finalIsInternal = req.user?.role === UserRole.CUSTOMER ? false : isInternal;

    const comment = ticketService.addComment({
      ticketId: id,
      content,
      isInternal: finalIsInternal,
      authorId: req.user!.userId
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;