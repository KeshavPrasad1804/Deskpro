import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-responsive py-6">
      <div class="page-header mb-4">
        <h1 class="page-title">Tasks</h1>
        <p class="page-subtitle">Manage tasks</p>
      </div>
      <div class="card overflow-hidden">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">Title</th>
              <th class="table-header-cell">Status</th>
              <th class="table-header-cell">Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of tasks" class="table-row">
              <td class="table-cell">{{ task.title }}</td>
              <td class="table-cell">{{ task.status | titlecase }}</td>
              <td class="table-cell">{{ task.priority | titlecase }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(t => (this.tasks = t));
  }
}
