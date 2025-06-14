import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { ChatSession, ChatMessage, ChatStatus, MessageType, CreateChatRequest, SendMessageRequest } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  public chatSessions$ = this.chatSessionsSubject.asObservable();

  private activeChatSubject = new BehaviorSubject<ChatSession | null>(null);
  public activeChat$ = this.activeChatSubject.asObservable();

  private mockSessions: ChatSession[] = [
    {
      id: '1',
      customerId: 'customer1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      agentId: 'agent1',
      agentName: 'Jane Agent',
      status: ChatStatus.ACTIVE,
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      messages: [
        {
          id: '1',
          sessionId: '1',
          senderId: 'customer1',
          senderName: 'John Doe',
          senderType: 'customer',
          content: 'Hi, I need help with my account',
          messageType: MessageType.TEXT,
          timestamp: new Date(Date.now() - 300000),
          isRead: true
        },
        {
          id: '2',
          sessionId: '1',
          senderId: 'agent1',
          senderName: 'Jane Agent',
          senderType: 'agent',
          content: 'Hello! I\'d be happy to help you with your account. What specific issue are you experiencing?',
          messageType: MessageType.TEXT,
          timestamp: new Date(Date.now() - 240000),
          isRead: true
        }
      ],
      metadata: {
        tags: ['account', 'support'],
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1'
      }
    },
    {
      id: '2',
      customerId: 'customer2',
      customerName: 'Alice Smith',
      customerEmail: 'alice@example.com',
      status: ChatStatus.WAITING,
      startedAt: new Date(Date.now() - 120000), // 2 minutes ago
      messages: [
        {
          id: '3',
          sessionId: '2',
          senderId: 'customer2',
          senderName: 'Alice Smith',
          senderType: 'customer',
          content: 'Is anyone available to help?',
          messageType: MessageType.TEXT,
          timestamp: new Date(Date.now() - 120000),
          isRead: false
        }
      ],
      metadata: {
        tags: ['general'],
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.2'
      }
    }
  ];

  constructor(private authService: AuthService) {
    this.chatSessionsSubject.next(this.mockSessions);
    
    // Simulate real-time updates
    interval(5000).subscribe(() => {
      this.simulateIncomingMessages();
    });
  }

  getChatSessions(): Observable<ChatSession[]> {
    return of(this.mockSessions);
  }

  getChatSession(id: string): Observable<ChatSession | undefined> {
    const session = this.mockSessions.find(s => s.id === id);
    return of(session);
  }

  createChatSession(request: CreateChatRequest): Observable<ChatSession> {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: Math.random().toString(36).substr(2, 9),
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      status: ChatStatus.WAITING,
      startedAt: new Date(),
      messages: [
        {
          id: Math.random().toString(36).substr(2, 9),
          sessionId: '',
          senderId: '',
          senderName: request.customerName,
          senderType: 'customer',
          content: request.initialMessage,
          messageType: MessageType.TEXT,
          timestamp: new Date(),
          isRead: false
        }
      ],
      metadata: {
        tags: request.metadata?.tags || [],
        ...request.metadata
      }
    };

    newSession.messages[0].sessionId = newSession.id;
    newSession.messages[0].senderId = newSession.customerId;

    this.mockSessions.unshift(newSession);
    this.chatSessionsSubject.next(this.mockSessions);

    return of(newSession);
  }

  sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
    const session = this.mockSessions.find(s => s.id === request.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentUser = this.authService.getCurrentUser();
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: request.sessionId,
      senderId: currentUser?.id || '',
      senderName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
      senderType: 'agent',
      content: request.content,
      messageType: request.messageType || MessageType.TEXT,
      timestamp: new Date(),
      attachments: request.attachments,
      isRead: false
    };

    session.messages.push(newMessage);
    this.chatSessionsSubject.next(this.mockSessions);

    return of(newMessage);
  }

  assignAgent(sessionId: string, agentId: string): Observable<boolean> {
    const session = this.mockSessions.find(s => s.id === sessionId);
    if (!session) {
      return of(false);
    }

    const currentUser = this.authService.getCurrentUser();
    session.agentId = agentId;
    session.agentName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Agent';
    session.status = ChatStatus.ACTIVE;

    // Add system message
    const systemMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: sessionId,
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      content: `${session.agentName} has joined the chat`,
      messageType: MessageType.SYSTEM,
      timestamp: new Date(),
      isRead: false
    };

    session.messages.push(systemMessage);
    this.chatSessionsSubject.next(this.mockSessions);

    return of(true);
  }

  endChatSession(sessionId: string): Observable<boolean> {
    const session = this.mockSessions.find(s => s.id === sessionId);
    if (!session) {
      return of(false);
    }

    session.status = ChatStatus.ENDED;
    session.endedAt = new Date();

    // Add system message
    const systemMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: sessionId,
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      content: 'Chat session has ended',
      messageType: MessageType.SYSTEM,
      timestamp: new Date(),
      isRead: false
    };

    session.messages.push(systemMessage);
    this.chatSessionsSubject.next(this.mockSessions);

    return of(true);
  }

  setActiveChat(session: ChatSession | null): void {
    this.activeChatSubject.next(session);
  }

  markMessagesAsRead(sessionId: string): Observable<boolean> {
    const session = this.mockSessions.find(s => s.id === sessionId);
    if (!session) {
      return of(false);
    }

    session.messages.forEach(message => {
      if (message.senderType === 'customer') {
        message.isRead = true;
      }
    });

    this.chatSessionsSubject.next(this.mockSessions);
    return of(true);
  }

  private simulateIncomingMessages(): void {
    // Randomly add messages to active sessions
    const activeSessions = this.mockSessions.filter(s => s.status === ChatStatus.ACTIVE);
    
    if (activeSessions.length > 0 && Math.random() < 0.3) {
      const randomSession = activeSessions[Math.floor(Math.random() * activeSessions.length)];
      const messages = [
        'Thank you for your help!',
        'I think I understand now',
        'Could you clarify that?',
        'That worked perfectly!',
        'I have another question...'
      ];

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sessionId: randomSession.id,
        senderId: randomSession.customerId,
        senderName: randomSession.customerName,
        senderType: 'customer',
        content: messages[Math.floor(Math.random() * messages.length)],
        messageType: MessageType.TEXT,
        timestamp: new Date(),
        isRead: false
      };

      randomSession.messages.push(newMessage);
      this.chatSessionsSubject.next(this.mockSessions);
    }
  }
}