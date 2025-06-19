import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private mockTasks: Task[] = [
    {
      id: 'TSK-001',
      title: 'Initial Setup',
      description: 'Set up project repository',
      status: TaskStatus.DONE,
      priority: TaskPriority.NORMAL,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: 'TSK-002',
      title: 'Design Database',
      description: 'Design application database schema',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04')
    },
    {
      id: 'TSK-003',
      title: 'Implement API',
      description: 'Create REST endpoints',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  getTasks(): Observable<Task[]> {
    return of(this.mockTasks);
  }

  getTask(id: string): Observable<Task | undefined> {
    const task = this.mockTasks.find(t => t.id === id);
    return of(task);
  }

  createTask(request: CreateTaskRequest): Observable<Task> {
    const newTask: Task = {
      id: 'TSK-' + String(this.mockTasks.length + 1).padStart(3, '0'),
      title: request.title,
      description: request.description,
      status: TaskStatus.TODO,
      priority: request.priority,
      assignedTo: request.assignedTo,
      dueDate: request.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockTasks.unshift(newTask);
    return of(newTask);
  }

  updateTask(id: string, request: UpdateTaskRequest): Observable<Task | null> {
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      return of(null);
    }
    const updated = {
      ...this.mockTasks[index],
      ...request,
      updatedAt: new Date()
    };
    this.mockTasks[index] = updated;
    return of(updated);
  }

  deleteTask(id: string): Observable<boolean> {
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
