import type { Sprint } from '../types/sprint';
import type { Task, PipelineDetail } from '../types/task';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Sprints ───────────────────────────────────────────────────────────────
const sprintsData: Sprint[] = [
  {
    id: 'sprint_2',
    name: 'Sprint 2',
    branchName: 'sprint/sprint-2',
    projectName: 'LST AI Portal',
    startDate: '2026-05-26',
    endDate: '2026-06-06',
    status: 'active',
    taskCount: 7,
    completedTaskCount: 2,
  },
  {
    id: 'sprint_1',
    name: 'Sprint 1',
    branchName: 'sprint/sprint-1',
    projectName: 'LST AI Portal',
    startDate: '2026-05-12',
    endDate: '2026-05-23',
    status: 'completed',
    taskCount: 5,
    completedTaskCount: 4,
  },
];

// ─── Tasks ─────────────────────────────────────────────────────────────────
const tasksData: Task[] = [
  // Sprint 2 tasks
  {
    id: 'task_1',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-1',
    title: 'Dashboard Altyapısı Entegrasyonu',
    assignee: 'KeremGerede',
    branchName: 'sprint2/task-1',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 88,
    reviewCriticalIssues: 0,
    devMergeStatus: 'success',
    testStatus: 'passed',
    testPrStatus: 'open',
    testPrUrl: 'https://github.com/lstai/portal/pull/41',
    createdAt: '2026-06-04T09:00:00Z',
  },
  {
    id: 'task_2',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-2',
    title: 'Sprint 2 Task-2 Merge Request',
    assignee: 'KeremGerede',
    branchName: 'sprint2/task-2',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 95,
    reviewCriticalIssues: 0,
    devMergeStatus: 'success',
    testStatus: 'passed',
    testPrStatus: 'open',
    testPrUrl: 'https://github.com/lstai/portal/pull/42',
    createdAt: '2026-06-04T11:00:00Z',
  },
  {
    id: 'task_3',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-3',
    title: 'Auth Middleware Refaktörü',
    assignee: 'ZeynepKaya',
    branchName: 'sprint2/task-3',
    reviewStatus: 'pending',
    reviewDecision: 'none',
    devMergeStatus: 'none',
    testStatus: 'none',
    testPrStatus: 'none',
    createdAt: '2026-06-04T13:00:00Z',
  },
  {
    id: 'task_4',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-4',
    title: 'WebSocket Bağlantı Güvenliği',
    assignee: 'ArdaDemir',
    branchName: 'sprint2/task-4',
    reviewStatus: 'completed',
    reviewDecision: 'rejected',
    reviewScore: 42,
    reviewCriticalIssues: 2,
    devMergeStatus: 'none',
    testStatus: 'none',
    testPrStatus: 'none',
    createdAt: '2026-06-03T10:00:00Z',
  },
  {
    id: 'task_5',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-5',
    title: 'CSS Grid Mobil Uyumluluk Güncellemesi',
    assignee: 'ZeynepKaya',
    branchName: 'fix/mobile-grid',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 92,
    reviewCriticalIssues: 0,
    devMergeStatus: 'conflict',
    testStatus: 'none',
    testPrStatus: 'none',
    conflictDetails: {
      files: ['src/layouts/AppLayout.tsx', 'src/styles/variables.css'],
      platformUrl: 'https://github.com/lstai/portal/pull/38/conflicts',
      detectedAt: '2026-06-02T09:15:00Z',
    },
    createdAt: '2026-06-02T08:00:00Z',
  },
  {
    id: 'task_6',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-6',
    title: 'Rate Limiting Implementasyonu',
    assignee: 'CanYilmaz',
    branchName: 'sprint2/task-6',
    reviewStatus: 'none',
    reviewDecision: 'none',
    devMergeStatus: 'none',
    testStatus: 'none',
    testPrStatus: 'none',
    createdAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 'task_7',
    sprintId: 'sprint_2',
    externalTaskId: 'TASK-7',
    title: 'Redis Cache Invalidasyon Stratejisi',
    assignee: 'MelisKara',
    branchName: 'sprint2/task-7',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 81,
    reviewCriticalIssues: 0,
    devMergeStatus: 'stale',
    testStatus: 'none',
    testPrStatus: 'none',
    conflictDetails: {
      files: ['src/services/cache.ts', 'src/api/middleware.ts', 'src/config/redis.ts'],
      platformUrl: 'https://github.com/lstai/portal/pull/35/conflicts',
      detectedAt: '2026-05-26T14:30:00Z',
    },
    createdAt: '2026-05-26T10:00:00Z',
  },
  // Sprint 1 tasks
  {
    id: 'task_8',
    sprintId: 'sprint_1',
    externalTaskId: 'TASK-8',
    title: 'SQL Injection Koruma Kuralı Ekleme',
    assignee: 'MelisKara',
    branchName: 'security/sql-inject',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 98,
    reviewCriticalIssues: 0,
    devMergeStatus: 'success',
    testStatus: 'passed',
    testPrStatus: 'merged',
    testPrUrl: 'https://github.com/lstai/portal/pull/28',
    createdAt: '2026-06-03T14:00:00Z',
  },
  {
    id: 'task_12',
    sprintId: 'sprint_1',
    externalTaskId: 'TASK-12',
    title: 'Redis Cache Entegrasyon Katmanı',
    assignee: 'CanYilmaz',
    branchName: 'feature/redis-cache',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 76,
    reviewCriticalIssues: 1,
    devMergeStatus: 'manually_resolved',
    testStatus: 'passed',
    testPrStatus: 'merged',
    testPrUrl: 'https://github.com/lstai/portal/pull/22',
    createdAt: '2026-06-01T13:00:00Z',
  },
  {
    id: 'task_14',
    sprintId: 'sprint_1',
    externalTaskId: 'TASK-14',
    title: 'Docker Compose Local Setup',
    assignee: 'ArdaDemir',
    branchName: 'devops/docker-compose',
    reviewStatus: 'completed',
    reviewDecision: 'rejected',
    reviewScore: 45,
    reviewCriticalIssues: 2,
    devMergeStatus: 'none',
    testStatus: 'none',
    testPrStatus: 'none',
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'task_19',
    sprintId: 'sprint_1',
    externalTaskId: 'TASK-19',
    title: 'GraphQL API Query Resolver Refaktörü',
    assignee: 'MelisKara',
    branchName: 'refactor/graphql',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 90,
    reviewCriticalIssues: 0,
    devMergeStatus: 'success',
    testStatus: 'passed',
    testPrStatus: 'merged',
    testPrUrl: 'https://github.com/lstai/portal/pull/19',
    createdAt: '2026-05-25T15:00:00Z',
  },
  {
    id: 'task_21',
    sprintId: 'sprint_1',
    externalTaskId: 'TASK-21',
    title: 'Jest Unit Test Altyapısı Revizyonu',
    assignee: 'KeremGerede',
    branchName: 'test/jest-upgrade',
    reviewStatus: 'completed',
    reviewDecision: 'approved',
    reviewScore: 87,
    reviewCriticalIssues: 0,
    devMergeStatus: 'success',
    testStatus: 'passed',
    testPrStatus: 'merged',
    testPrUrl: 'https://github.com/lstai/portal/pull/16',
    createdAt: '2026-05-20T09:00:00Z',
  },
];

// ─── Pipeline Details ──────────────────────────────────────────────────────
const pipelineDetailsData: Record<string, PipelineDetail> = {
  task_2: {
    task: tasksData.find((t) => t.id === 'task_2')!,
    mergeEvent: {
      commitHash: 'a3f8c12d',
      sourceBranch: 'sprint2/task-2',
      mergedAt: '2026-06-04T11:27:00Z',
      actor: 'KeremGerede',
    },
    review: {
      score: 95,
      decision: 'approved',
      summary: 'Kod kalitesi oldukça yüksek. Sprint 2 Task-2 gereksinimlerini eksiksiz karşılıyor. Küçük stil önerileri mevcut.',
      issues: [
        { severity: 'low', file: 'src/components/MergeCard.tsx', line: 42, description: 'Inline style yerine CSS değişkeni kullanılabilir.' },
      ],
      suggestions: [
        'NavLink aktif state için daha belirgin renk kullanılabilir.',
        'Pagination bileşeni ayrı component\'e çıkarılabilir.',
      ],
      reviewedAt: '2026-06-04T11:27:10Z',
      promptTokens: 3200,
      completionTokens: 890,
      costUsd: 0.0421,
    },
    devMerge: {
      status: 'success',
      targetBranch: 'develop',
      mergedAt: '2026-06-04T11:27:15Z',
    },
    testRun: {
      score: 92,
      decision: 'passed',
      summary: 'Tüm fonksiyonel testler başarıyla tamamlandı. Bileşen render ve entegrasyon testleri geçti.',
      passedCases: [
        'Dashboard KPI kartlarının doğru veri gösterimi',
        'Son Olaylar tablosunun sayfalama mantığı',
        'Son İncelemeler filtreleme işlevi',
        'Mobil görünüm responsive davranışı',
      ],
      failedCases: [],
      coverageEstimate: '%92 bileşen coverage',
      executedAt: '2026-06-04T11:27:20Z',
      durationSeconds: 45,
      promptTokens: 2800,
      completionTokens: 720,
      costUsd: 0.0336,
    },
    testPR: {
      prUrl: 'https://github.com/lstai/portal/pull/42',
      targetBranch: 'staging',
      status: 'open',
      createdAt: '2026-06-04T11:28:00Z',
    },
  },
  task_1: {
    task: tasksData.find((t) => t.id === 'task_1')!,
    mergeEvent: {
      commitHash: 'b7d4e90f',
      sourceBranch: 'sprint2/task-1',
      mergedAt: '2026-06-04T10:43:00Z',
      actor: 'KeremGerede',
    },
    review: {
      score: 88,
      decision: 'approved',
      summary: 'Dashboard altyapısı sağlam temeller üzerine kurulmuş. GSAP animasyonları performans açısından optimize edilmiş.',
      issues: [
        { severity: 'low', file: 'src/pages/DashboardPage.tsx', line: 128, description: 'useEffect bağımlılık dizisi eksik eleman içeriyor.' },
        { severity: 'low', file: 'src/services/mockData.ts', line: 69, description: 'Math.random ID üretimi UUID ile değiştirilmeli.' },
      ],
      suggestions: [
        'React Query ile veri yönetimi centralise edilmeli.',
        'Loading skeleton komponenti eklenebilir.',
        'Error boundary eklenmesi önerilir.',
      ],
      reviewedAt: '2026-06-04T10:44:20Z',
      promptTokens: 5100,
      completionTokens: 1240,
      costUsd: 0.0612,
    },
    devMerge: {
      status: 'success',
      targetBranch: 'develop',
      mergedAt: '2026-06-04T10:45:00Z',
    },
    testRun: {
      score: 88,
      decision: 'passed',
      summary: 'Dashboard bileşenleri için fonksiyonel testler tamamlandı. 5 test senaryosu başarıyla geçti.',
      passedCases: [
        'KPI kart sayaç animasyonu doğruluğu',
        'Arama filtresi çalışma mantığı',
        'Sayfalama state yönetimi',
        'Theme değişikliğinde layout stabilitesi',
        'API error state handling',
      ],
      failedCases: [],
      coverageEstimate: '%88 kod coverage',
      executedAt: '2026-06-04T10:46:00Z',
      durationSeconds: 38,
      promptTokens: 3400,
      completionTokens: 890,
      costUsd: 0.0408,
    },
    testPR: {
      prUrl: 'https://github.com/lstai/portal/pull/41',
      targetBranch: 'staging',
      status: 'open',
      createdAt: '2026-06-04T10:47:00Z',
    },
  },
  task_4: {
    task: tasksData.find((t) => t.id === 'task_4')!,
    mergeEvent: {
      commitHash: 'c2a9f341',
      sourceBranch: 'sprint2/task-4',
      mergedAt: '2026-06-03T09:30:00Z',
      actor: 'ArdaDemir',
    },
    review: {
      score: 42,
      decision: 'rejected',
      summary: 'Kritik güvenlik açıkları tespit edildi. WebSocket bağlantılarında kimlik doğrulama mekanizması eksik. Düzeltme gerekli.',
      issues: [
        { severity: 'high', file: 'src/server/websocket.ts', line: 15, description: 'WebSocket bağlantısında JWT token doğrulaması yapılmıyor.' },
        { severity: 'high', file: 'src/server/websocket.ts', line: 67, description: 'Tenant izolasyonu eksik: tüm mesajlar broadcast ediliyor.' },
        { severity: 'medium', file: 'src/server/websocket.ts', line: 89, description: 'Bağlantı limiti kontrolü yok, DoS saldırısına açık.' },
      ],
      suggestions: [
        'JWT middleware WebSocket handshake\'e entegre edilmeli.',
        'Room tabanlı mesajlaşma ile tenant izolasyonu sağlanmalı.',
      ],
      reviewedAt: '2026-06-03T09:35:00Z',
      promptTokens: 4200,
      completionTokens: 1100,
      costUsd: 0.0503,
    },
    devMerge: {
      status: 'none',
      targetBranch: 'develop',
    },
  },
  task_5: {
    task: tasksData.find((t) => t.id === 'task_5')!,
    mergeEvent: {
      commitHash: 'd5b8a712',
      sourceBranch: 'fix/mobile-grid',
      mergedAt: '2026-06-02T08:30:00Z',
      actor: 'ZeynepKaya',
    },
    review: {
      score: 92,
      decision: 'approved',
      summary: 'Mobil uyumluluk düzeltmeleri başarılı. CSS Grid implementasyonu modern standartlara uygun.',
      issues: [
        { severity: 'low', file: 'src/styles/variables.css', line: 44, description: 'sidebar-width değişkeni mobil için override edilmeli.' },
      ],
      suggestions: ['CSS container queries kullanımı incelenebilir.'],
      reviewedAt: '2026-06-02T08:45:00Z',
      promptTokens: 2100,
      completionTokens: 580,
      costUsd: 0.0249,
    },
    devMerge: {
      status: 'conflict',
      targetBranch: 'develop',
      conflictDetails: {
        files: ['src/layouts/AppLayout.tsx', 'src/styles/variables.css'],
        platformUrl: 'https://github.com/lstai/portal/pull/38/conflicts',
        detectedAt: '2026-06-02T09:15:00Z',
      },
    },
  },
  task_8: {
    task: tasksData.find((t) => t.id === 'task_8')!,
    mergeEvent: {
      commitHash: 'e9c3d521',
      sourceBranch: 'security/sql-inject',
      mergedAt: '2026-06-03T14:30:00Z',
      actor: 'MelisKara',
    },
    review: {
      score: 98,
      decision: 'approved',
      summary: 'Mükemmel güvenlik implementasyonu. Parametrize sorgular ve girdi validasyonu eksiksiz uygulanmış.',
      issues: [],
      suggestions: ['Ek olarak prepared statements kullanımı belgelenebilir.'],
      reviewedAt: '2026-06-03T15:30:00Z',
      promptTokens: 2800,
      completionTokens: 640,
      costUsd: 0.0333,
    },
    devMerge: {
      status: 'success',
      targetBranch: 'develop',
      mergedAt: '2026-06-03T15:35:00Z',
    },
    testRun: {
      score: 96,
      decision: 'passed',
      summary: 'SQL Injection koruma testleri başarıyla tamamlandı.',
      passedCases: [
        'Basic SQL injection girdi temizleme testi',
        'Parametrize sorgu doğrulama',
        'Hatalı girdi reddedilme testi',
        'Boundary case analizleri',
      ],
      failedCases: [],
      coverageEstimate: '%96 güvenlik coverage',
      executedAt: '2026-06-03T15:40:00Z',
      durationSeconds: 22,
      promptTokens: 2200,
      completionTokens: 560,
      costUsd: 0.0261,
    },
    testPR: {
      prUrl: 'https://github.com/lstai/portal/pull/28',
      targetBranch: 'staging',
      status: 'merged',
      createdAt: '2026-06-03T15:45:00Z',
    },
  },
};

// ─── Service Functions ─────────────────────────────────────────────────────
export const getSprints = async (): Promise<Sprint[]> => {
  await delay(300);
  return [...sprintsData];
};

export const getSprintById = async (id: string): Promise<Sprint | undefined> => {
  await delay(200);
  return sprintsData.find((s) => s.id === id);
};

export const getSprintTasks = async (sprintId: string): Promise<Task[]> => {
  await delay(350);
  return tasksData.filter((t) => t.sprintId === sprintId);
};

export const getTaskById = async (taskId: string): Promise<Task | undefined> => {
  await delay(200);
  return tasksData.find((t) => t.id === taskId || t.externalTaskId === taskId);
};

export const getPipelineDetail = async (taskId: string): Promise<PipelineDetail | undefined> => {
  await delay(400);
  const task = tasksData.find((t) => t.id === taskId || t.externalTaskId === taskId);
  if (!task) return undefined;
  return pipelineDetailsData[task.id] ?? { task };
};

export const getConflicts = async (): Promise<Task[]> => {
  await delay(300);
  return tasksData.filter((t) => t.devMergeStatus === 'conflict' || t.devMergeStatus === 'stale');
};
