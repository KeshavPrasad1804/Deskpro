import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Article, Category, CreateArticleRequest, UpdateArticleRequest, SearchRequest, SearchResult, ArticleStatus, ArticleVisibility } from '../models/knowledge-base.model';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  private mockCategories: Category[] = [
    {
      id: '1',
      name: 'Getting Started',
      description: 'Basic guides and tutorials',
      icon: 'rocket_launch',
      color: '#3B82F6',
      articleCount: 5,
      order: 1,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Account Management',
      description: 'Managing your account and profile',
      icon: 'account_circle',
      color: '#10B981',
      articleCount: 8,
      order: 2,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: 'build',
      color: '#F59E0B',
      articleCount: 12,
      order: 3,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '4',
      name: 'API Documentation',
      description: 'Developer resources and API guides',
      icon: 'code',
      color: '#8B5CF6',
      articleCount: 6,
      order: 4,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  private mockArticles: Article[] = [
    {
      id: '1',
      title: 'How to Create Your First Ticket',
      content: `# How to Create Your First Ticket

Creating a support ticket is the first step to getting help with any issues you're experiencing. Follow these simple steps:

## Step 1: Navigate to Tickets
Click on the "Tickets" menu item in the sidebar or header navigation.

## Step 2: Click "New Ticket"
Look for the blue "New Ticket" button in the top right corner of the tickets page.

## Step 3: Fill Out the Form
- **Subject**: Provide a clear, concise description of your issue
- **Description**: Give detailed information about the problem
- **Priority**: Select the appropriate priority level
- **Tags**: Add relevant tags to help categorize your ticket

## Step 4: Submit
Click the "Create Ticket" button to submit your request.

## What Happens Next?
Once submitted, your ticket will be assigned a unique ID and our support team will review it. You'll receive email notifications for any updates.

## Tips for Better Support
- Be specific about error messages
- Include screenshots when helpful
- Mention what you were trying to do when the issue occurred`,
      excerpt: 'Learn how to create your first support ticket with our step-by-step guide.',
      categoryId: '1',
      categoryName: 'Getting Started',
      authorId: 'admin1',
      authorName: 'Admin User',
      status: ArticleStatus.PUBLISHED,
      visibility: ArticleVisibility.PUBLIC,
      tags: ['tickets', 'getting-started', 'tutorial'],
      viewCount: 245,
      helpfulCount: 23,
      notHelpfulCount: 2,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      publishedAt: new Date('2024-01-15'),
      attachments: []
    },
    {
      id: '2',
      title: 'Password Reset Instructions',
      content: `# Password Reset Instructions

If you've forgotten your password or need to reset it for security reasons, follow these steps:

## Method 1: From Login Page
1. Go to the login page
2. Click "Forgot your password?" link
3. Enter your email address
4. Check your email for reset instructions
5. Click the reset link in the email
6. Enter your new password

## Method 2: From Account Settings
If you're already logged in:
1. Go to your profile settings
2. Click "Change Password"
3. Enter your current password
4. Enter your new password
5. Confirm your new password
6. Click "Update Password"

## Password Requirements
- At least 8 characters long
- Include uppercase and lowercase letters
- Include at least one number
- Include at least one special character

## Security Tips
- Use a unique password for your account
- Consider using a password manager
- Enable two-factor authentication
- Don't share your password with others`,
      excerpt: 'Step-by-step instructions for resetting your password.',
      categoryId: '2',
      categoryName: 'Account Management',
      authorId: 'admin1',
      authorName: 'Admin User',
      status: ArticleStatus.PUBLISHED,
      visibility: ArticleVisibility.PUBLIC,
      tags: ['password', 'security', 'account'],
      viewCount: 189,
      helpfulCount: 18,
      notHelpfulCount: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
      publishedAt: new Date('2024-01-10'),
      attachments: []
    },
    {
      id: '3',
      title: 'Common Login Issues',
      content: `# Common Login Issues

Having trouble logging in? Here are the most common issues and their solutions:

## Issue 1: "Invalid Email or Password"
**Possible Causes:**
- Incorrect email address
- Incorrect password
- Caps Lock is on
- Account has been suspended

**Solutions:**
- Double-check your email address
- Try typing your password in a text editor first
- Check if Caps Lock is enabled
- Use the password reset feature
- Contact support if account is suspended

## Issue 2: "Account Locked"
**Cause:** Too many failed login attempts

**Solution:**
- Wait 15 minutes before trying again
- Use the password reset feature
- Contact support for immediate unlock

## Issue 3: Two-Factor Authentication Problems
**Common Issues:**
- Code expired
- Wrong time on device
- Lost authenticator device

**Solutions:**
- Request a new code
- Sync your device time
- Use backup codes
- Contact support for 2FA reset

## Issue 4: Browser-Related Problems
**Solutions:**
- Clear browser cache and cookies
- Disable browser extensions
- Try incognito/private mode
- Update your browser
- Try a different browser

## Still Having Issues?
If none of these solutions work, please create a support ticket with:
- Your email address
- Browser and version
- Error messages you're seeing
- Screenshots if helpful`,
      excerpt: 'Troubleshoot common login problems with these solutions.',
      categoryId: '3',
      categoryName: 'Troubleshooting',
      authorId: 'admin1',
      authorName: 'Admin User',
      status: ArticleStatus.PUBLISHED,
      visibility: ArticleVisibility.PUBLIC,
      tags: ['login', 'troubleshooting', 'authentication'],
      viewCount: 156,
      helpfulCount: 14,
      notHelpfulCount: 3,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      publishedAt: new Date('2024-01-12'),
      attachments: []
    }
  ];

  getCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  getArticles(categoryId?: string): Observable<Article[]> {
    let articles = this.mockArticles.filter(a => a.status === ArticleStatus.PUBLISHED);
    
    if (categoryId) {
      articles = articles.filter(a => a.categoryId === categoryId);
    }
    
    return of(articles);
  }

  getArticle(id: string): Observable<Article | undefined> {
    const article = this.mockArticles.find(a => a.id === id);
    if (article) {
      // Increment view count
      article.viewCount++;
    }
    return of(article);
  }

  searchArticles(request: SearchRequest): Observable<SearchResult> {
    let articles = this.mockArticles.filter(a => a.status === ArticleStatus.PUBLISHED);
    
    // Filter by query
    if (request.query) {
      const query = request.query.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (request.categoryId) {
      articles = articles.filter(a => a.categoryId === request.categoryId);
    }
    
    // Filter by tags
    if (request.tags && request.tags.length > 0) {
      articles = articles.filter(a => 
        request.tags!.some(tag => a.tags.includes(tag))
      );
    }
    
    const total = articles.length;
    
    // Apply pagination
    const offset = request.offset || 0;
    const limit = request.limit || 10;
    articles = articles.slice(offset, offset + limit);
    
    return of({
      articles,
      total,
      categories: this.mockCategories,
      suggestions: ['password', 'login', 'account', 'ticket', 'reset']
    });
  }

  createArticle(request: CreateArticleRequest): Observable<Article> {
    const newArticle: Article = {
      id: Math.random().toString(36).substr(2, 9),
      title: request.title,
      content: request.content,
      excerpt: request.excerpt || request.content.substring(0, 200) + '...',
      categoryId: request.categoryId,
      categoryName: this.mockCategories.find(c => c.id === request.categoryId)?.name || '',
      authorId: 'current-user',
      authorName: 'Current User',
      status: request.status,
      visibility: request.visibility,
      tags: request.tags || [],
      viewCount: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: request.status === ArticleStatus.PUBLISHED ? new Date() : undefined,
      attachments: []
    };
    
    this.mockArticles.push(newArticle);
    return of(newArticle);
  }

  updateArticle(id: string, request: UpdateArticleRequest): Observable<Article | null> {
    const articleIndex = this.mockArticles.findIndex(a => a.id === id);
    if (articleIndex === -1) {
      return of(null);
    }
    
    const article = this.mockArticles[articleIndex];
    const updatedArticle = {
      ...article,
      ...request,
      updatedAt: new Date(),
      publishedAt: request.status === ArticleStatus.PUBLISHED && !article.publishedAt ? new Date() : article.publishedAt
    };
    
    if (request.categoryId && request.categoryId !== article.categoryId) {
      updatedArticle.categoryName = this.mockCategories.find(c => c.id === request.categoryId)?.name || '';
    }
    
    this.mockArticles[articleIndex] = updatedArticle;
    return of(updatedArticle);
  }

  deleteArticle(id: string): Observable<boolean> {
    const index = this.mockArticles.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockArticles.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  rateArticle(id: string, helpful: boolean): Observable<boolean> {
    const article = this.mockArticles.find(a => a.id === id);
    if (!article) {
      return of(false);
    }
    
    if (helpful) {
      article.helpfulCount++;
    } else {
      article.notHelpfulCount++;
    }
    
    return of(true);
  }

  getPopularArticles(limit: number = 5): Observable<Article[]> {
    const articles = this.mockArticles
      .filter(a => a.status === ArticleStatus.PUBLISHED)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    
    return of(articles);
  }

  getRecentArticles(limit: number = 5): Observable<Article[]> {
    const articles = this.mockArticles
      .filter(a => a.status === ArticleStatus.PUBLISHED)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, limit);
    
    return of(articles);
  }
}