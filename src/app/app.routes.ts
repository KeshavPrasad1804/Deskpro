import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets',
    loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets/new',
    loadComponent: () => import('./features/tickets/ticket-create/ticket-create.component').then(m => m.TicketCreateComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets/:id',
    loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'live-chat',
    loadComponent: () => import('./features/live-chat/live-chat.component').then(m => m.LiveChatComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.AGENT, UserRole.ADMIN] }
  },
  {
    path: 'knowledge-base',
    loadComponent: () => import('./features/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'knowledge-base/articles/:id',
    loadComponent: () => import('./features/knowledge-base/article-detail/article-detail.component').then(m => m.ArticleDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.AGENT, UserRole.ADMIN] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];