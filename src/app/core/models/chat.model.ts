import { FileAttachment } from './attachment.model';

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId?: string;
  agentName?: string;
  status: ChatStatus;
  startedAt: Date;
  endedAt?: Date;
  messages: ChatMessage[];
  metadata: ChatMetadata;
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
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  messageType: MessageType;
  timestamp: Date;
  attachments?: FileAttachment[];
  isRead: boolean;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface ChatMetadata {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  tags: string[];
  rating?: number;
  feedback?: string;
}

export interface CreateChatRequest {
  customerName: string;
  customerEmail: string;
  initialMessage: string;
  metadata?: Partial<ChatMetadata>;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  messageType?: MessageType;
  attachments?: FileAttachment[];
}