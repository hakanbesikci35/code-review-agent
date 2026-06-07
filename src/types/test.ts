// src/types/test.ts

export type TestRunner = 'jest' | 'playwright' | 'cypress' | 'vitest';

export interface TestConfig {
  id: string;
  name: string;
  runner: TestRunner;
  command: string;
  envVariables: Record<string, string>;
  timeoutSeconds: number;
  isActive: boolean;
}

export type TestStatus = 'passed' | 'failed' | 'running' | 'skipped';

export interface FunctionalTestRun {
  id: string;
  name: string;
  runNumber: number;
  status: TestStatus;
  passedCount: number;
  failedCount: number;
  durationSeconds: number;
  coveragePercent: number;
  executedBy: string;
  completedAt: string;
}
