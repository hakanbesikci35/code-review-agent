// src/types/tenant.ts

export type TenantStatus = 'active' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: string;
  integrationsCount: number;
  userCount: number;
  plan: 'basic' | 'pro' | 'enterprise';
}
