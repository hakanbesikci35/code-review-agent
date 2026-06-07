// src/types/promotion.ts

export type Environment = 'development' | 'testing' | 'staging' | 'production';
export type PromotionStatus = 'pending' | 'deploying' | 'success' | 'failed';

export interface Promotion {
  id: string;
  title: string;
  sourceEnv: Environment;
  targetEnv: Environment;
  status: PromotionStatus;
  actor: string;
  durationSeconds: number;
  promotedAt: string;
  version: string;
}
