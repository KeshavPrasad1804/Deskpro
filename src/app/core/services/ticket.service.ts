import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketStatus, TicketPriority } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private mockTickets: Ticket[] = [
    {
      id: 'TKT-001',
      subject: 'Login Issue - Cannot access account',
      description: 'I am unable to login to my account. When I enter my credentials, I get an error message saying "Invalid username or password" even though I am sure my credentials are correct. This started happening yesterday after the system maintenance.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: 'cust-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@example.com',
      assignedAgentId: 'agent-001',
      assignedAgentName: 'Jane Agent',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T14:20:00'),
      tags: ['login', 'urgent', 'authentication'],
      attachments: [],
      comments: [
        {
          id: 'comment-001',
          ticketId: 'TKT-001',
          content: 'Thank you for reporting this issue. I have checked your account and can see that it was temporarily locked due to multiple failed login attempts. I have unlocked your account. Please try logging in again.',
          isInternal: false,
          authorId: 'agent-001',
          authorName: 'Jane Agent',
          createdAt: new Date('2024-01-15T11:00:00'),
          updatedAt: new Date('2024-01-15T11:00:00')
        },
        {
          id: 'comment-002',
          ticketId: 'TKT-001',
          content: 'Customer confirmed they can now access their account. Monitoring for any further issues.',
          isInternal: true,
          authorId: 'agent-001',
          authorName: 'Jane Agent',
          createdAt: new Date('2024-01-15T14:20:00'),
          updatedAt: new Date('2024-01-15T14:20:00')
        }
      ]
    },
    {
      id: 'TKT-002',
      subject: 'Feature Request - Dark Mode Support',
      description: 'Would it be possible to add a dark mode option to the application? Many users, including myself, prefer dark interfaces especially when working late hours. This would greatly improve the user experience and reduce eye strain.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.NORMAL,
      customerId: 'cust-002',
      customerName: 'Alice Johnson',
      customerEmail: 'alice.johnson@example.com',
      assignedAgentId: 'agent-002',
      assignedAgentName: 'Mike Support',
      createdAt: new Date('2024-01-14T09:15:00'),
      updatedAt: new Date('2024-01-16T16:45:00'),
      tags: ['feature-request', 'ui', 'enhancement'],
      attachments: [],
      comments: [
        {
          id: 'comment-003',
          ticketId: 'TKT-002',
          content: 'Thank you for this suggestion! Dark mode is indeed a popular request. I have forwarded this to our development team for consideration in the next release cycle.',
          isInternal: false,
          authorId: 'agent-002',
          authorName: 'Mike Support',
          createdAt: new Date('2024-01-14T10:30:00'),
          updatedAt: new Date('2024-01-14T10:30:00')
        }
      ]
    },
    {
      id: 'TKT-003',
      subject: 'Bug Report - File Upload Not Working',
      description: 'When trying to upload files larger than 5MB, the upload fails with a timeout error. This is preventing me from sharing important documents with my team. The error occurs consistently across different browsers.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.HIGH,
      customerId: 'cust-003',
      customerName: 'Robert Wilson',
      customerEmail: 'robert.wilson@example.com',
      assignedAgentId: 'agent-001',
      assignedAgentName: 'Jane Agent',
      createdAt: new Date('2024-01-16T08:20:00'),
      updatedAt: new Date('2024-01-16T12:10:00'),
      tags: ['bug', 'file-upload', 'timeout'],
      attachments: [],
      comments: []
    },
    {
      id: 'TKT-004',
      subject: 'Account Setup - New Team Member',
      description: 'We need to set up an account for our new team member, Sarah Davis. She will need access to the project management module and should have the same permissions as other team leads.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.NORMAL,
      customerId: 'cust-004',
      customerName: 'David Brown',
      customerEmail: 'david.brown@example.com',
      assignedAgentId: 'agent-003',
      assignedAgentName: 'Lisa Admin',
      createdAt: new Date('2024-01-12T14:30:00'),
      updatedAt: new Date('2024-01-13T09:15:00'),
      tags: ['account-setup', 'new-user', 'permissions'],
      attachments: [],
      comments: [
        {
          id: 'comment-004',
          ticketId: 'TKT-004',
          content: 'Account has been created for Sarah Davis. Login credentials have been sent to her email address. She now has team lead permissions as requested.',
          isInternal: false,
          authorId: 'agent-003',
          authorName: 'Lisa Admin',
          createdAt: new Date('2024-01-13T09:15:00'),
          updatedAt: new Date('2024-01-13T09:15:00')
        }
      ]
    },
    {
      id: 'TKT-005',
      subject: 'Performance Issue - Slow Loading Times',
      description: 'The application has been loading very slowly over the past few days. Page load times have increased from 2-3 seconds to 15-20 seconds. This is affecting our team\'s productivity significantly.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      customerId: 'cust-005',
      customerName: 'Emma Thompson',
      customerEmail: 'emma.thompson@example.com',
      createdAt: new Date('2024-01-16T16:45:00'),
      updatedAt: new Date('2024-01-16T16:45:00'),
      tags: ['performance', 'slow-loading', 'urgent'],
      attachments: [],
      comments: []
    },
    {
      id: 'TKT-006',
      subject: 'Integration Question - API Documentation',
      description: 'I am working on integrating our CRM system with your API. Could you please provide more detailed documentation about the webhook endpoints? Specifically, I need information about the payload structure for customer updates.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.NORMAL,
      customerId: 'cust-006',
      customerName: 'Michael Chen',
      customerEmail: 'michael.chen@example.com',
      assignedAgentId: 'agent-002',
      assignedAgentName: 'Mike Support',
      createdAt: new Date('2024-01-15T11:20:00'),
      updatedAt: new Date('2024-01-16T10:30:00'),
      tags: ['api', 'integration', 'documentation'],
      attachments: [],
      comments: [
        {
          id: 'comment-005',
          ticketId: 'TKT-006',
          content: 'I have sent you the detailed API documentation via email. Please let me know if you need any clarification on the webhook payload structures.',
          isInternal: false,
          authorId: 'agent-002',
          authorName: 'Mike Support',
          createdAt: new Date('2024-01-16T10:30:00'),
          updatedAt: new Date('2024-01-16T10:30:00')
        }
      ]
    }
  ];

  getTickets(): Observable<Ticket[]> {
    return of(this.mockTickets);
  }

  getTicket(id: string): Observable<Ticket | undefined> {
    const ticket = this.mockTickets.find(t => t.id === id);
    return of(ticket);
  }

  createTicket(request: CreateTicketRequest): Observable<Ticket> {
    const newTicket: Ticket = {
      id: 'TKT-' + String(this.mockTickets.length + 1).padStart(3, '0'),
      subject: request.subject,
      description: request.description,
      status: TicketStatus.OPEN,
      priority: request.priority,
      customerId: request.customerId || 'cust-new',
      customerName: 'New Customer',
      customerEmail: request.customerEmail || 'customer@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: request.tags || [],
      attachments: [],
      comments: []
    };

    this.mockTickets.unshift(newTicket);
    return of(newTicket);
  }

  updateTicket(id: string, request: UpdateTicketRequest): Observable<Ticket | null> {
    const ticketIndex = this.mockTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return of(null);
    }

    const updatedTicket = {
      ...this.mockTickets[ticketIndex],
      ...request,
      updatedAt: new Date()
    };

    this.mockTickets[ticketIndex] = updatedTicket;
    return of(updatedTicket);
  }

  deleteTicket(id: string): Observable<boolean> {
    const index = this.mockTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTickets.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}