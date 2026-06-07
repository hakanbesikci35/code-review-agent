// src/types/stats.ts

export interface DeveloperStat {
  id: string;
  name: string;
  avatarUrl?: string;
  commitsCount: number;
  reviewsCompleted: number;
  approvedCount: number;
  rejectedCount: number;
  tokenUsage: number;
  costUsd: number;
}

export interface SystemStatsSummary {
  totalTenants: number;
  totalIntegrations: number;
  totalReviewsSuccess: number;
  totalReviewsFailed: number;
  totalTestsSuccess: number;
  totalTestsFailed: number;
  totalEventsCount: number;
  totalReviewsCount: number;
}

export interface AnalyticsTimePoint {
  label: string;
  approved: number;
  rejected: number;
}

export interface SprintVelocityPoint {
  sprint: string;
  completed: number;
  total: number;
}

export interface LLMCostPoint {
  developer: string;
  tokens: number;
  costUsd: number;
}

export interface TestTrendPoint {
  label: string;
  passed: number;
  failed: number;
}
