import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketStatus, TicketPriority } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private mockTickets: Ticket[] = [
    {
      id: '1',
      subject: 'Login Issue',
      description: 'Cannot login to my account',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: '1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      assignedAgentId: '2',
      assignedAgentName: 'Jane Agent',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      tags: ['login', 'urgent'],
      attachments: [],
      comments: []
    },
    {
      id: '2',
      subject: 'Feature Request',
      description: 'Would like to see dark mode option',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.NORMAL,
      customerId: '3',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      tags: ['feature-request'],
      attachments: [],
      comments: []
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
      id: Math.random().toString(36).substr(2, 9),
      subject: request.subject,
      description: request.description,
      status: TicketStatus.OPEN,
      priority: request.priority,
      customerId: request.customerId || '',
      customerName: '',
      customerEmail: request.customerEmail || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: request.tags || [],
      attachments: [],
      comments: []
    };

    this.mockTickets.push(newTicket);
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