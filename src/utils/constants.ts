// src/utils/constants.ts

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  INTEGRATIONS: '/integrations',
  REVIEW_RULES: '/review-rules',
  TEST_CONFIGS: '/test-configs',
  EVENT_LOGS: '/event-logs',
  MERGE_REVIEWS: '/merge-reviews',
  FUNCTIONAL_TESTS: '/functional-tests',
  PROMOTIONS: '/promotions',
  USER_STATS: '/user-stats',
  SPRINT_DETAIL: '/sprints',
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  PROJECTS: '/projects',
  SPRINTS: (projectId: string) => `/projects/${projectId}/sprints`,
  TASKS: (sprintId: string) => `/sprints/${sprintId}/tasks`,
  MERGE_EVENTS: '/merge-events',
  MERGE_EVENT_DETAILS: (id: string) => `/merge-events/${id}`,
  PIPELINE_REVIEW: (id: string) => `/merge-events/${id}/review`,
  PIPELINE_DEV_MERGE: (id: string) => `/merge-events/${id}/dev-merge`,
  PIPELINE_TEST_RUN: (id: string) => `/merge-events/${id}/test-run`,
  PIPELINE_TEST_PR: (id: string) => `/merge-events/${id}/test-pr`,
  ANALYTICS_SUMMARY: '/analytics/summary',
  ANALYTICS_DEV_STATS: '/analytics/developer-stats',
  ANALYTICS_VELOCITY: '/analytics/sprint-velocity',
};

export const STATUS_COLORS = {
  SUCCESS: 'var(--accent-success)',
  DANGER: 'var(--accent-danger)',
  WARNING: 'var(--accent-warning)',
  INFO: 'var(--accent-info)',
  PRIMARY: 'var(--accent-primary)',
};

export const MOCK_USER_ROLES = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
};
