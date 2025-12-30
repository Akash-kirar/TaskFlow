import { User, Task } from '../types';
import bcrypt from 'bcryptjs';

const STORAGE_KEYS = {
  USERS: 'app_users',
  TASKS: 'app_tasks',
  TOKEN: 'app_token',
  CURRENT_USER: 'app_current_user',
};

// Helper to simulate delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const StorageService = {
  getUsers: (): User[] => {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!users) {
        // Seed default demo user if no users exist
        // Use synchronous hash for seeding
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('password', salt);
        
        const demoUser = {
          id: 'demo-user-id',
          username: 'Demo User',
          email: 'demo@example.com',
          passwordHash: hash,
          createdAt: new Date().toISOString(),
        };
        const initialUsers = [demoUser];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
        // Return type needs to match User interface but we store passwordHash internally
        return initialUsers as any;
      }
      return JSON.parse(users);
    } catch (error) {
      console.error("Error parsing users from storage", error);
      return [];
    }
  },

  saveUser: (user: User & { passwordHash: string }) => {
    const users = StorageService.getUsers();
    // Check if updating existing user or adding new
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  findUserByEmail: (email: string) => {
    const users = StorageService.getUsers();
    if (!email) return undefined;
    
    const searchEmail = email.toLowerCase().trim();
    
    // Robust comparison: normalize BOTH stored email and search email
    // This handles cases where legacy data might have leading/trailing spaces
    return users.find((u: any) => {
      const storedEmail = (u.email || '').toLowerCase().trim();
      return storedEmail === searchEmail;
    });
  },

  getTasks: (): Task[] => {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  clearAllData: () => {
    localStorage.clear();
    window.location.reload();
  },

  setCurrentUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }
};