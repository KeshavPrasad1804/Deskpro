import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { Task, TaskStatus, TaskPriority } from '../types';

export class TaskService {
  createTask(taskData: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assignedTo?: string;
    dueDate?: Date;
  }): Task {
    const { title, description, priority, assignedTo, dueDate } = taskData;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      title,
      description || null,
      TaskStatus.TODO,
      priority,
      assignedTo || null,
      dueDate ? dueDate.toISOString() : null
    );
    return this.getTaskById(id)!;
  }

  getTaskById(id: string): Task | null {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id) as any;
    if (!task) return null;
    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assigned_to || undefined,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    };
  }

  getAllTasks(filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    page?: number;
    limit?: number;
  } = {}): { tasks: Task[]; total: number } {
    const { status, priority, assignedTo, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }
    if (assignedTo) {
      whereClause += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM tasks ${whereClause}`);
    const { count } = countStmt.get(...params) as { count: number };

    const stmt = db.prepare(`
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(...params, limit, offset) as any[];

    const tasks = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to || undefined,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));

    return { tasks, total: count };
  }

  updateTask(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      dueDate?: Date | null;
    }
  ): Task | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.assignedTo !== undefined) {
      fields.push('assigned_to = ?');
      values.push(updates.assignedTo);
    }
    if (updates.dueDate !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.dueDate ? updates.dueDate.toISOString() : null);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    return this.getTaskById(id);
  }

  deleteTask(id: string): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const taskService = new TaskService();
