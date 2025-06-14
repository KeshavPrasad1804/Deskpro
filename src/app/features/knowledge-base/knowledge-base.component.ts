import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { Article, Category, SearchRequest } from '../../core/models/knowledge-base.model';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="kb-layout">
      <!-- Header -->
      <div class="kb-header">
        <h1 class="page-title">Knowledge Base</h1>
        <p class="page-subtitle">Find answers to common questions and browse our documentation</p>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <form [formGroup]="searchForm" (ngSubmit)="performSearch()" class="relative">
          <div class="relative">
            <input
              type="text"
              formControlName="query"
              class="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search articles, guides, and documentation..."
              (input)="onSearchInput()"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <button
              type="submit"
              class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span class="sr-only">Search</span>
              <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </form>

        <!-- Search Suggestions -->
        <div *ngIf="searchSuggestions.length > 0 && showSuggestions" class="mt-2">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div class="p-2">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular searches:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let suggestion of searchSuggestions"
                  (click)="selectSuggestion(suggestion)"
                  class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="kb-content scrollbar-thin">
        <!-- Search Results -->
        <div *ngIf="isSearchMode" class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Search Results
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({{ searchResults.total }} {{ searchResults.total === 1 ? 'result' : 'results' }})
              </span>
            </h2>
            <button (click)="clearSearch()" class="btn-secondary text-sm">
              Clear Search
            </button>
          </div>

          <div class="grid gap-6">
            <article *ngFor="let article of searchResults.articles" class="card p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {{ article.categoryName }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ article.viewCount }} views
                    </span>
                  </div>
                  
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    <a [routerLink]="['/knowledge-base/articles', article.id]" class="hover:text-primary-600 dark:hover:text-primary-400">
                      {{ article.title }}
                    </a>
                  </h3>
                  
                  <p class="text-gray-600 dark:text-gray-300 mb-3">{{ article.excerpt }}</p>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>By {{ article.authorName }}</span>
                    <span>{{ article.updatedAt | date:'mediumDate' }}</span>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <span>{{ article.helpfulCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div *ngIf="searchResults.articles.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p class="text-gray-500 dark:text-gray-400">Try adjusting your search terms or browse categories below.</p>
          </div>
        </div>

        <!-- Categories Grid -->
        <div *ngIf="!isSearchMode">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div *ngFor="let category of categories" class="category-card">
              <div class="category-icon" [style.background-color]="category.color + '20'" [style.color]="category.color">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getCategoryIconPath(category.icon || 'build')"/>
                </svg>
              </div>
              
              <div class="category-content">
                <h3 class="category-title">
                  <a (click)="browseCategory(category.id)" class="cursor-pointer hover:text-primary-600 dark:hover:text-primary-400">
                    {{ category.name }}
                  </a>
                </h3>
                <p class="category-description">{{ category.description }}</p>
                <div class="category-stats">
                  <span class="article-count">{{ category.articleCount }} articles</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Articles -->
          <div class="mb-12">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Popular Articles</h2>
            <div class="grid gap-4">
              <div *ngFor="let article of popularArticles" class="popular-article">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      <a [routerLink]="['/knowledge-base/articles', article.id]" class="hover:text-primary-600 dark:hover:text-primary-400">
                        {{ article.title }}
                      </a>
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ article.categoryName }}</p>
                  </div>
                  
                  <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span>{{ article.viewCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Articles -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recently Updated</h2>
            <div class="grid gap-4">
              <div *ngFor="let article of recentArticles" class="recent-article">
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      <a [routerLink]="['/knowledge-base/articles', article.id]" class="hover:text-primary-600 dark:hover:text-primary-400">
                        {{ article.title }}
                      </a>
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Updated {{ article.updatedAt | date:'mediumDate' }} in {{ article.categoryName }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kb-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 4rem);
      padding: 1.5rem;
      overflow: hidden;
    }

    .kb-header {
      flex-shrink: 0;
      margin-bottom: 2rem;
      text-align: center;
    }

    .search-section {
      flex-shrink: 0;
      max-width: 32rem;
      margin: 0 auto 2rem auto;
      width: 100%;
    }

    .kb-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .category-card {
      @apply bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1;
    }

    .category-icon {
      @apply w-12 h-12 rounded-lg flex items-center justify-center mb-4;
    }

    .category-content {
      @apply space-y-2;
    }

    .category-title {
      @apply text-lg font-medium text-gray-900 dark:text-white;
    }

    .category-description {
      @apply text-gray-600 dark:text-gray-300 text-sm;
    }

    .category-stats {
      @apply pt-2;
    }

    .article-count {
      @apply text-xs text-gray-500 dark:text-gray-400 font-medium;
    }

    .popular-article {
      @apply bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow;
    }

    .recent-article {
      @apply bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .kb-layout {
        padding: 1rem;
        height: calc(100vh - 4rem);
      }

      .kb-header {
        margin-bottom: 1.5rem;
      }

      .search-section {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class KnowledgeBaseComponent implements OnInit {
  categories: Category[] = [];
  popularArticles: Article[] = [];
  recentArticles: Article[] = [];
  searchForm: FormGroup;
  searchResults: any = { articles: [], total: 0 };
  searchSuggestions: string[] = [];
  isSearchMode = false;
  showSuggestions = false;

  constructor(
    private knowledgeBaseService: KnowledgeBaseService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPopularArticles();
    this.loadRecentArticles();
    this.loadSearchSuggestions();
  }

  private loadCategories(): void {
    this.knowledgeBaseService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadPopularArticles(): void {
    this.knowledgeBaseService.getPopularArticles(5).subscribe(articles => {
      this.popularArticles = articles;
    });
  }

  private loadRecentArticles(): void {
    this.knowledgeBaseService.getRecentArticles(5).subscribe(articles => {
      this.recentArticles = articles;
    });
  }

  private loadSearchSuggestions(): void {
    // In a real app, this would come from the API
    this.searchSuggestions = ['password reset', 'login issues', 'account setup', 'billing', 'api documentation'];
  }

  onSearchInput(): void {
    const query = this.searchForm.get('query')?.value;
    this.showSuggestions = query.length === 0;
  }

  performSearch(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (!query) {
      this.clearSearch();
      return;
    }

    const searchRequest: SearchRequest = {
      query: query,
      limit: 20
    };

    this.knowledgeBaseService.searchArticles(searchRequest).subscribe(results => {
      this.searchResults = results;
      this.isSearchMode = true;
      this.showSuggestions = false;
    });
  }

  selectSuggestion(suggestion: string): void {
    this.searchForm.patchValue({ query: suggestion });
    this.performSearch();
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.isSearchMode = false;
    this.showSuggestions = false;
    this.searchResults = { articles: [], total: 0 };
  }

  browseCategory(categoryId: string): void {
    this.knowledgeBaseService.getArticles(categoryId).subscribe(articles => {
      this.searchResults = {
        articles: articles,
        total: articles.length,
        categories: this.categories,
        suggestions: []
      };
      this.isSearchMode = true;
    });
  }

  getCategoryIconPath(icon: string): string {
    const iconPaths: { [key: string]: string } = {
      'rocket_launch': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'account_circle': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'build': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'code': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    };
    
    return iconPaths[icon] || iconPaths['build'];
  }
}