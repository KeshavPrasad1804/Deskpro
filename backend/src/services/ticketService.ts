import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { Ticket, TicketStatus, TicketPriority, TicketComment } from '../types';

export class TicketService {
  createTicket(ticketData: {
    subject: string;
    description: string;
    priority: TicketPriority;
    customerId: string;
    assignedAgentId?: string;
    tags?: string[];
  }): Ticket {
    const { subject, description, priority, customerId, assignedAgentId, tags = [] } = ticketData;

    const ticketId = uuidv4();
    
    // Insert ticket
    const stmt = db.prepare(`
      INSERT INTO tickets (id, subject, description, status, priority, customer_id, assigned_agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(ticketId, subject, description, TicketStatus.OPEN, priority, customerId, assignedAgentId || null);

    // Insert tags
    if (tags.length > 0) {
      const tagStmt = db.prepare(`
        INSERT INTO ticket_tags (id, ticket_id, tag) VALUES (?, ?, ?)
      `);

      for (const tag of tags) {
        tagStmt.run(uuidv4(), ticketId, tag.trim());
      }
    }

    return this.getTicketById(ticketId)!;
  }

  getTicketById(id: string): Ticket | null {
    const stmt = db.prepare(`
      SELECT t.*, 
             c.first_name || ' ' || c.last_name as customerName,
             c.email as customerEmail,
             a.first_name || ' ' || a.last_name as assignedAgentName
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      WHERE t.id = ?
    `);

    const ticket = stmt.get(id) as any;
    if (!ticket) return null;

    // Get tags
    const tagsStmt = db.prepare('SELECT tag FROM ticket_tags WHERE ticket_id = ?');
    const tags = tagsStmt.all(id) as { tag: string }[];

    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      customerId: ticket.customer_id,
      assignedAgentId: ticket.assigned_agent_id,
      createdAt: new Date(ticket.created_at),
      updatedAt: new Date(ticket.updated_at),
      dueDate: ticket.due_date ? new Date(ticket.due_date) : undefined,
      tags: tags.map(t => t.tag)
    };
  }

  getAllTickets(filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    customerId?: string;
    assignedAgentId?: string;
    page?: number;
    limit?: number;
  } = {}): { tickets: any[]; total: number } {
    const { status, priority, customerId, assignedAgentId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      whereClause += ' AND t.priority = ?';
      params.push(priority);
    }

    if (customerId) {
      whereClause += ' AND t.customer_id = ?';
      params.push(customerId);
    }

    if (assignedAgentId) {
      whereClause += ' AND t.assigned_agent_id = ?';
      params.push(assignedAgentId);
    }

    // Get total count
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM tickets t ${whereClause}`);
    const { count } = countStmt.get(...params) as { count: number };

    // Get tickets with user info
    const stmt = db.prepare(`
      SELECT t.*, 
             c.first_name || ' ' || c.last_name as customerName,
             c.email as customerEmail,
             a.first_name || ' ' || a.last_name as assignedAgentName
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const tickets = stmt.all(...params, limit, offset) as any[];

    // Get tags for each ticket
    const ticketsWithTags = tickets.map(ticket => {
      const tagsStmt = db.prepare('SELECT tag FROM ticket_tags WHERE ticket_id = ?');
      const tags = tagsStmt.all(ticket.id) as { tag: string }[];

      return {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        customerId: ticket.customer_id,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        assignedAgentId: ticket.assigned_agent_id,
        assignedAgentName: ticket.assignedAgentName,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
        dueDate: ticket.due_date ? new Date(ticket.due_date) : undefined,
        tags: tags.map(t => t.tag)
      };
    });

    return { tickets: ticketsWithTags, total: count };
  }

  updateTicket(id: string, updates: {
    subject?: string;
    description?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedAgentId?: string;
    tags?: string[];
  }): Ticket | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.subject !== undefined) {
      fields.push('subject = ?');
      values.push(updates.subject);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }

    if (updates.assignedAgentId !== undefined) {
      fields.push('assigned_agent_id = ?');
      values.push(updates.assignedAgentId);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = db.prepare(`
        UPDATE tickets SET ${fields.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);
    }

    // Update tags if provided
    if (updates.tags !== undefined) {
      // Delete existing tags
      const deleteTagsStmt = db.prepare('DELETE FROM ticket_tags WHERE ticket_id = ?');
      deleteTagsStmt.run(id);

      // Insert new tags
      if (updates.tags.length > 0) {
        const insertTagStmt = db.prepare(`
          INSERT INTO ticket_tags (id, ticket_id, tag) VALUES (?, ?, ?)
        `);

        for (const tag of updates.tags) {
          insertTagStmt.run(uuidv4(), id, tag.trim());
        }
      }
    }

    return this.getTicketById(id);
  }

  deleteTicket(id: string): boolean {
    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Comments
  addComment(commentData: {
    ticketId: string;
    content: string;
    isInternal: boolean;
    authorId: string;
  }): TicketComment {
    const { ticketId, content, isInternal, authorId } = commentData;

    const commentId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO ticket_comments (id, ticket_id, content, is_internal, author_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(commentId, ticketId, content, isInternal ? 1 : 0, authorId);

    return this.getCommentById(commentId)!;
  }

  getCommentById(id: string): TicketComment | null {
    const stmt = db.prepare(`
      SELECT tc.*, u.first_name || ' ' || u.last_name as authorName
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.author_id = u.id
      WHERE tc.id = ?
    `);

    const comment = stmt.get(id) as any;
    if (!comment) return null;

    return {
      id: comment.id,
      ticketId: comment.ticket_id,
      content: comment.content,
      isInternal: Boolean(comment.is_internal),
      authorId: comment.author_id,
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at)
    };
  }

  getTicketComments(ticketId: string): any[] {
    const stmt = db.prepare(`
      SELECT tc.*, u.first_name || ' ' || u.last_name as authorName
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.author_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `);

    const comments = stmt.all(ticketId) as any[];

    return comments.map(comment => ({
      id: comment.id,
      ticketId: comment.ticket_id,
      content: comment.content,
      isInternal: Boolean(comment.is_internal),
      authorId: comment.author_id,
      authorName: comment.authorName,
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at)
    }));
  }
}

export const ticketService = new TicketService();