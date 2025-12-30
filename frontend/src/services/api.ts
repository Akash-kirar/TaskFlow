import { User, Task, AuthResponse, TaskStatus } from '../types';
import { StorageService, delay } from './storage';
import bcrypt from 'bcryptjs';

// Simulated latency
const NETWORK_DELAY = 600;

export const api = {
  auth: {
    register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
      await delay(NETWORK_DELAY);
      
      const cleanEmail = email.toLowerCase().trim();
      const existingUser = StorageService.findUserByEmail(cleanEmail);
      if (existingUser) {
        throw new Error('User already exists with this email.');
      }

      // Real bcrypt hashing
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        id: crypto.randomUUID(),
        username,
        email: cleanEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      StorageService.saveUser(newUser);

      const { passwordHash: _, ...userProfile } = newUser;
      const token = `mock-jwt-${crypto.randomUUID()}`;
      
      StorageService.setToken(token);
      StorageService.setCurrentUser(userProfile);

      return { user: userProfile, token };
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      await delay(NETWORK_DELAY);

      const cleanEmail = email.toLowerCase().trim();
      const user = StorageService.findUserByEmail(cleanEmail) as (User & { passwordHash: string }) | undefined;
      
      if (!user) {
        throw new Error('User not found. Please register first.');
      }

      // Strict bcrypt comparison
      let isValidPassword = false;
      try {
        isValidPassword = await bcrypt.compare(password, user.passwordHash);
      } catch (e) {
        console.error('Password comparison error', e);
        isValidPassword = false;
      }

      if (!isValidPassword) {
        throw new Error('Invalid email or password.');
      }

      const { passwordHash, ...userProfile } = user;
      const token = `mock-jwt-${crypto.randomUUID()}`;

      StorageService.setToken(token);
      StorageService.setCurrentUser(userProfile);

      return { user: userProfile, token };
    },

    logout: async () => {
      await delay(200);
      StorageService.clearAuth();
    },

    getProfile: async (): Promise<User> => {
      await delay(NETWORK_DELAY);
      const user = StorageService.getCurrentUser();
      if (!user) throw new Error('Unauthorized');
      return user;
    },

    updateProfile: async (updates: { username?: string; email?: string; password?: string }): Promise<User> => {
      await delay(NETWORK_DELAY);
      const currentUser = StorageService.getCurrentUser();
      if (!currentUser) throw new Error('Unauthorized');

      const users = StorageService.getUsers() as unknown as (User & { passwordHash: string })[];
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) throw new Error('User not found');
      
      const userRecord = users[userIndex];

      if (updates.username) userRecord.username = updates.username;
      
      if (updates.email) {
        const cleanEmail = updates.email.toLowerCase().trim();
        if (cleanEmail !== userRecord.email) {
            const existing = StorageService.findUserByEmail(cleanEmail);
            if (existing) {
                throw new Error('Email already in use');
            }
            userRecord.email = cleanEmail;
        }
      }

      if (updates.password) {
          const salt = await bcrypt.genSalt(10);
          userRecord.passwordHash = await bcrypt.hash(updates.password, salt);
      }

      StorageService.saveUser(userRecord);
      
      const { passwordHash, ...safeUser } = userRecord;
      StorageService.setCurrentUser(safeUser);
      
      return safeUser;
    }
  },

  tasks: {
    list: async (): Promise<Task[]> => {
      await delay(NETWORK_DELAY);
      const user = StorageService.getCurrentUser();
      if (!user) throw new Error('Unauthorized');

      const allTasks = StorageService.getTasks();
      return allTasks.filter(t => t.userId === user.id).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    create: async (title: string, description: string): Promise<Task> => {
      await delay(NETWORK_DELAY);
      const user = StorageService.getCurrentUser();
      if (!user) throw new Error('Unauthorized');

      const newTask: Task = {
        id: crypto.randomUUID(),
        userId: user.id,
        title,
        description,
        status: TaskStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tasks = StorageService.getTasks();
      tasks.push(newTask);
      StorageService.saveTasks(tasks);

      return newTask;
    },

    update: async (id: string, updates: Partial<Task>): Promise<Task> => {
      await delay(NETWORK_DELAY);
      const user = StorageService.getCurrentUser();
      if (!user) throw new Error('Unauthorized');

      const tasks = StorageService.getTasks();
      const taskIndex = tasks.findIndex(t => t.id === id && t.userId === user.id);

      if (taskIndex === -1) throw new Error('Task not found');

      const updatedTask = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      tasks[taskIndex] = updatedTask;
      StorageService.saveTasks(tasks);

      return updatedTask;
    },

    delete: async (id: string): Promise<void> => {
      await delay(NETWORK_DELAY);
      const user = StorageService.getCurrentUser();
      if (!user) throw new Error('Unauthorized');

      const tasks = StorageService.getTasks();
      const filteredTasks = tasks.filter(t => !(t.id === id && t.userId === user.id));
      
      StorageService.saveTasks(filteredTasks);
    }
  }
};