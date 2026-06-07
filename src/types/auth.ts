// src/types/auth.ts

export type UserRole = 'admin' | 'developer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  tenantId: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
