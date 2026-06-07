// src/types/review.ts

export type RuleSeverity = 'info' | 'warning' | 'critical';
export type RuleType = 'security' | 'style' | 'performance' | 'doc';

export interface ReviewRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: RuleSeverity;
  type: RuleType;
  customPrompt?: string;
}

export type MergeReviewStatus = 'pending' | 'success' | 'failed' | 'conflict' | 'warning';

export interface MergeReview {
  id: string;
  taskId: string;
  prTitle: string;
  actor: string;
  sourceBranch: string;
  targetBranch: string;
  status: MergeReviewStatus;
  score: number;
  reviewedAt: string;
  changesCount: { additions: number; deletions: number };
  criticalIssuesCount: number;
  suggestionsCount: number;
  projectName?: string;
  sprintName?: string;
}
