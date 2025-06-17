import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { User, UserRole, AuthTokens, JWTPayload } from '../types';

export class UserService {
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User> {
    const { email, password, firstName, lastName, role = UserRole.CUSTOMER } = userData;

    // Check if user already exists
    const existingUser = this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, email, firstName, lastName, hashedPassword, role);

    return this.getUserById(userId)!;
  }

  getUserById(id: string): User | null {
    const stmt = db.prepare(`
      SELECT id, email, first_name as firstName, last_name as lastName, 
             role, is_active as isActive, avatar, created_at as createdAt, 
             updated_at as updatedAt
      FROM users WHERE id = ?
    `);

    const user = stmt.get(id) as any;
    if (!user) return null;

    return {
      ...user,
      isActive: Boolean(user.isActive),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  }

  getUserByEmail(email: string): User | null {
    const stmt = db.prepare(`
      SELECT id, email, first_name as firstName, last_name as lastName, 
             role, is_active as isActive, avatar, created_at as createdAt, 
             updated_at as updatedAt
      FROM users WHERE email = ?
    `);

    const user = stmt.get(email) as any;
    if (!user) return null;

    return {
      ...user,
      isActive: Boolean(user.isActive),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const stmt = db.prepare(`
      SELECT id, email, first_name as firstName, last_name as lastName, 
             password, role, is_active as isActive, avatar, 
             created_at as createdAt, updated_at as updatedAt
      FROM users WHERE email = ? AND is_active = 1
    `);

    const user = stmt.get(email) as any;
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      isActive: Boolean(user.isActive),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  }

  generateTokens(user: User): AuthTokens {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
  }

  getAllUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}): { users: User[]; total: number } {
    const { role, isActive, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(isActive ? 1 : 0);
    }

    // Get total count
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`);
    const { count } = countStmt.get(...params) as { count: number };

    // Get users
    const stmt = db.prepare(`
      SELECT id, email, first_name as firstName, last_name as lastName, 
             role, is_active as isActive, avatar, created_at as createdAt, 
             updated_at as updatedAt
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const users = stmt.all(...params, limit, offset) as any[];

    return {
      users: users.map(user => ({
        ...user,
        isActive: Boolean(user.isActive),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      })),
      total: count
    };
  }

  updateUser(id: string, updates: {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    avatar?: string;
  }): User | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(updates.firstName);
    }

    if (updates.lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(updates.lastName);
    }

    if (updates.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.isActive ? 1 : 0);
    }

    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.getUserById(id);
  }

  deleteUser(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userService = new UserService();