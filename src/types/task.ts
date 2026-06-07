export type ReviewStatus = 'none' | 'pending' | 'completed' | 'error';
export type ReviewDecision = 'none' | 'approved' | 'rejected';
export type DevMergeStatus = 'none' | 'success' | 'failed' | 'conflict' | 'manually_resolved' | 'stale';
export type TaskTestStatus = 'none' | 'pending' | 'passed' | 'failed';
export type TestPRStatus = 'none' | 'open' | 'merged' | 'closed';

export interface ConflictDetails {
  files: string[];
  platformUrl: string;
  detectedAt: string;
}

export interface Task {
  id: string;
  sprintId: string;
  externalTaskId: string;
  title: string;
  assignee: string;
  branchName: string;
  reviewStatus: ReviewStatus;
  reviewDecision: ReviewDecision;
  reviewScore?: number;
  reviewCriticalIssues?: number;
  devMergeStatus: DevMergeStatus;
  testStatus: TaskTestStatus;
  testPrStatus: TestPRStatus;
  testPrUrl?: string;
  conflictDetails?: ConflictDetails;
  createdAt: string;
}

export interface PipelineMergeEvent {
  commitHash: string;
  sourceBranch: string;
  mergedAt: string;
  actor: string;
}

export interface PipelineReview {
  score: number;
  decision: 'approved' | 'rejected';
  summary: string;
  issues: Array<{ severity: 'high' | 'medium' | 'low'; file: string; line: number; description: string }>;
  suggestions: string[];
  reviewedAt: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export interface PipelineDevMerge {
  status: DevMergeStatus;
  targetBranch: string;
  conflictDetails?: ConflictDetails;
  mergedAt?: string;
}

export interface PipelineTestRun {
  score: number;
  decision: 'passed' | 'failed';
  summary: string;
  passedCases: string[];
  failedCases: Array<{ name: string; reason: string }>;
  coverageEstimate: string;
  executedAt: string;
  durationSeconds: number;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export interface PipelineTestPR {
  prUrl: string;
  targetBranch: string;
  status: TestPRStatus;
  createdAt: string;
}

export interface PipelineDetail {
  task: Task;
  mergeEvent?: PipelineMergeEvent;
  review?: PipelineReview;
  devMerge?: PipelineDevMerge;
  testRun?: PipelineTestRun;
  testPR?: PipelineTestPR;
}
