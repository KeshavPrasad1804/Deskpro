import { FileAttachment } from './attachment.model';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  attachments: FileAttachment[];
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
  articleCount: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  tags?: string[];
  status: ArticleStatus;
  visibility: ArticleVisibility;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
}

export interface SearchRequest {
  query: string;
  categoryId?: string;
  tags?: string[];
  visibility?: ArticleVisibility;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  categories: Category[];
  suggestions: string[];
}