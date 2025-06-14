import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KnowledgeBaseService } from '../../../core/services/knowledge-base.service';
import { Article } from '../../../core/models/knowledge-base.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="article-layout" *ngIf="article">
      <!-- Header -->
      <div class="article-header">
        <div class="flex items-center space-x-4 mb-4">
          <button (click)="goBack()" class="btn-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="breadcrumb">
            <a routerLink="/knowledge-base" class="breadcrumb-link">Knowledge Base</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ article.categoryName }}</span>
          </div>
        </div>

        <div class="article-meta">
          <div class="flex items-center space-x-2 mb-2">
            <span class="category-badge">{{ article.categoryName }}</span>
            <span class="view-count">{{ article.viewCount }} views</span>
          </div>
          
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-info">
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>By {{ article.authorName }}</span>
              <span>Updated {{ article.updatedAt | date:'mediumDate' }}</span>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ article.helpfulCount }}</span>
                <svg class="w-4 h-4 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span>{{ article.notHelpfulCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="article-content">
        <div class="prose prose-lg max-w-none dark:prose-invert">
          <div [innerHTML]="getFormattedContent()"></div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="feedback-section">
        <div class="feedback-card">
          <h3 class="feedback-title">Was this article helpful?</h3>
          <div class="feedback-buttons">
            <button 
              (click)="rateArticle(true)"
              [class]="'feedback-btn ' + (userRating === true ? 'feedback-btn-active' : 'feedback-btn-inactive')"
              [disabled]="hasRated">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v3m-3 10h-.01M6 20a2 2 0 01-2-2v-6a2 2 0 012-2h2.5l3.5 1z"/>
              </svg>
              Yes ({{ article.helpfulCount }})
            </button>
            <button 
              (click)="rateArticle(false)"
              [class]="'feedback-btn ' + (userRating === false ? 'feedback-btn-active' : 'feedback-btn-inactive')"
              [disabled]="hasRated">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17v-3m-6-10h.01M9 4a2 2 0 012 2v6a2 2 0 01-2 2H6.5L3 13"/>
              </svg>
              No ({{ article.notHelpfulCount }})
            </button>
          </div>
          <div *ngIf="hasRated" class="feedback-thanks">
            Thank you for your feedback!
          </div>
        </div>
      </div>

      <!-- Related Articles -->
      <div class="related-section" *ngIf="relatedArticles.length > 0">
        <h3 class="related-title">Related Articles</h3>
        <div class="related-grid">
          <div *ngFor="let relatedArticle of relatedArticles" class="related-card">
            <a [routerLink]="['/knowledge-base/articles', relatedArticle.id]" class="related-link">
              <h4 class="related-article-title">{{ relatedArticle.title }}</h4>
              <p class="related-article-excerpt">{{ relatedArticle.excerpt }}</p>
              <div class="related-article-meta">
                <span class="related-category">{{ relatedArticle.categoryName }}</span>
                <span class="related-views">{{ relatedArticle.viewCount }} views</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Admin Actions -->
      <div class="admin-actions" *ngIf="canEditArticle">
        <div class="admin-card">
          <h3 class="admin-title">Article Management</h3>
          <div class="admin-buttons">
            <button class="btn-secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit Article
            </button>
            <button class="btn-secondary text-red-600 hover:text-red-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete Article
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!article && !error" class="loading-state">
      <div class="spinner w-8 h-8"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading article...</span>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="error-state">
      <div class="card p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Article Not Found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button (click)="goBack()" class="btn-primary">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .article-layout {
      max-width: 4xl;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .article-header {
      margin-bottom: 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
    }

    .breadcrumb-link {
      color: rgb(59 130 246);
      text-decoration: none;
    }

    .breadcrumb-link:hover {
      text-decoration: underline;
    }

    .breadcrumb-separator {
      margin: 0 0.5rem;
      color: rgb(156 163 175);
    }

    .breadcrumb-current {
      color: rgb(107 114 128);
    }

    .article-meta {
      margin-top: 1rem;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: rgb(239 246 255);
      color: rgb(29 78 216);
    }

    .view-count {
      font-size: 0.75rem;
      color: rgb(107 114 128);
    }

    .article-title {
      font-size: 2.25rem;
      font-weight: bold;
      color: rgb(17 24 39);
      margin: 1rem 0;
      line-height: 1.2;
    }

    .article-info {
      margin-top: 1rem;
    }

    .article-content {
      margin: 3rem 0;
      line-height: 1.7;
    }

    .prose {
      color: rgb(55 65 81);
    }

    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      color: rgb(17 24 39);
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .prose p {
      margin-bottom: 1.5rem;
    }

    .prose ul, .prose ol {
      margin: 1.5rem 0;
      padding-left: 1.5rem;
    }

    .prose li {
      margin-bottom: 0.5rem;
    }

    .prose code {
      background-color: rgb(243 244 246);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .prose pre {
      background-color: rgb(17 24 39);
      color: rgb(243 244 246);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    .feedback-section {
      margin: 3rem 0;
    }

    .feedback-card {
      background-color: rgb(249 250 251);
      border: 1px solid rgb(229 231 235);
      border-radius: 0.5rem;
      padding: 1.5rem;
      text-align: center;
    }

    .feedback-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(17 24 39);
      margin-bottom: 1rem;
    }

    .feedback-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .feedback-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
      border: 1px solid transparent;
    }

    .feedback-btn-inactive {
      background-color: white;
      color: rgb(107 114 128);
      border-color: rgb(209 213 219);
    }

    .feedback-btn-inactive:hover:not(:disabled) {
      background-color: rgb(249 250 251);
      color: rgb(59 130 246);
      border-color: rgb(59 130 246);
    }

    .feedback-btn-active {
      background-color: rgb(59 130 246);
      color: white;
      border-color: rgb(59 130 246);
    }

    .feedback-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .feedback-thanks {
      color: rgb(34 197 94);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .related-section {
      margin: 3rem 0;
    }

    .related-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: rgb(17 24 39);
      margin-bottom: 1.5rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .related-card {
      background-color: white;
      border: 1px solid rgb(229 231 235);
      border-radius: 0.5rem;
      padding: 1.5rem;
      transition: all 0.2s ease-in-out;
    }

    .related-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .related-link {
      text-decoration: none;
      color: inherit;
    }

    .related-article-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(17 24 39);
      margin-bottom: 0.5rem;
    }

    .related-article-excerpt {
      color: rgb(107 114 128);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .related-article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: rgb(156 163 175);
    }

    .related-category {
      background-color: rgb(243 244 246);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .admin-actions {
      margin: 3rem 0;
    }

    .admin-card {
      background-color: rgb(254 249 195);
      border: 1px solid rgb(251 191 36);
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .admin-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(146 64 14);
      margin-bottom: 1rem;
    }

    .admin-buttons {
      display: flex;
      gap: 1rem;
    }

    .loading-state,
    .error-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .article-title {
        color: rgb(243 244 246);
      }

      .category-badge {
        background-color: rgb(30 58 138);
        color: rgb(147 197 253);
      }

      .prose {
        color: rgb(209 213 219);
      }

      .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
        color: rgb(243 244 246);
      }

      .prose code {
        background-color: rgb(55 65 81);
        color: rgb(243 244 246);
      }

      .feedback-card {
        background-color: rgb(31 41 55);
        border-color: rgb(55 65 81);
      }

      .feedback-title {
        color: rgb(243 244 246);
      }

      .related-card {
        background-color: rgb(31 41 55);
        border-color: rgb(55 65 81);
      }

      .related-article-title {
        color: rgb(243 244 246);
      }

      .admin-card {
        background-color: rgb(69 26 3);
        border-color: rgb(146 64 14);
      }

      .admin-title {
        color: rgb(251 191 36);
      }
    }
  `]
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  relatedArticles: Article[] = [];
  error: string | null = null;
  userRating: boolean | null = null;
  hasRated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private knowledgeBaseService: KnowledgeBaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(articleId);
    }
  }

  private loadArticle(id: string): void {
    this.knowledgeBaseService.getArticle(id).subscribe({
      next: (article) => {
        if (article) {
          this.article = article;
          this.loadRelatedArticles();
        } else {
          this.error = 'Article not found';
        }
      },
      error: (error) => {
        this.error = 'Failed to load article';
      }
    });
  }

  private loadRelatedArticles(): void {
    if (this.article) {
      this.knowledgeBaseService.getArticles(this.article.categoryId).subscribe(articles => {
        this.relatedArticles = articles
          .filter(a => a.id !== this.article!.id)
          .slice(0, 3);
      });
    }
  }

  getFormattedContent(): string {
    if (!this.article) return '';
    
    // Convert markdown-like content to HTML
    let content = this.article.content;
    
    // Convert headers
    content = content.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    content = content.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    content = content.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Convert line breaks
    content = content.replace(/\n\n/g, '</p><p>');
    content = content.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (!content.startsWith('<h')) {
      content = '<p>' + content + '</p>';
    }
    
    return content;
  }

  rateArticle(helpful: boolean): void {
    if (this.article && !this.hasRated) {
      this.knowledgeBaseService.rateArticle(this.article.id, helpful).subscribe({
        next: (success) => {
          if (success) {
            this.userRating = helpful;
            this.hasRated = true;
            
            // Update local counts
            if (helpful) {
              this.article!.helpfulCount++;
            } else {
              this.article!.notHelpfulCount++;
            }
          }
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/knowledge-base']);
  }

  get canEditArticle(): boolean {
    return this.authService.hasAnyRole([UserRole.AGENT, UserRole.ADMIN]);
  }
}