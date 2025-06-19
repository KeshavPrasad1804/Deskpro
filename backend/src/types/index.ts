export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CUSTOMER = 'customer'
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high'
}

export interface ChatSession {
  id: string;
  customerId: string;
  agentId?: string;
  status: ChatStatus;
  startedAt: Date;
  endedAt?: Date;
  metadata: Record<string, any>;
}

export enum ChatStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
  TRANSFERRED = 'transferred'
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  messageType: MessageType;
  timestamp: Date;
  isRead: boolean;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  authorId: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ArticleVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted'
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}