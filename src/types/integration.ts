// src/types/integration.ts

export type IntegrationProvider = 'github' | 'gitlab' | 'jira' | 'slack';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  webhookUrl: string;
  webhookSecret: string;
  connectedAt: string;
  lastSyncAt?: string;
  errorMessage?: string;
}
