// src/types/event.ts

export type LogLevel = 'info' | 'warning' | 'error' | 'success' | 'debug';

export interface EventLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: 'webhook' | 'review_agent' | 'dev_merge' | 'test_runner' | 'system';
  message: string;
  actor?: string;
  branch?: string;
  details?: string;
  durationMs?: number;
}
