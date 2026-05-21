export type Theme = 'light' | 'dark';

export interface User {
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export type RuleSeverity = 'high' | 'medium' | 'low';

export interface ChecklistRule {
  id: string;
  category: string;
  description: string;
  severity: RuleSeverity;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  date: string;
  content: string;
  shortSummary: string;
  relatedRuleIds: string[]; // IDs of rules this email matches/violates
  read: boolean;
}

export interface DecisionItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'SUCCESS' | 'PENDING' | 'BLOCKED' | 'SECURED' | 'OPTIMIZED';
  statusText: string;
  details?: string;
  value?: string;
  latency?: string;
  timestamp: string;
}

export interface ActiveNode {
  id: string;
  name: string;
  avatarUrl: string;
}
