// src/services/mockData.ts
import type { Tenant } from '../types/tenant';
import type { Integration } from '../types/integration';
import type { ReviewRule, MergeReview } from '../types/review';
import type { TestConfig, FunctionalTestRun } from '../types/test';
import type { EventLog } from '../types/event';
import type { DeveloperStat, SystemStatsSummary } from '../types/stats';
import type { Promotion } from '../types/promotion';

// Delay helper to mock server responses
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
  activeCount?: number;
}

// --- 1. Tenants Store (Internal Use only since page is removed) ---
let tenantsData: Tenant[] = [
  { id: 'tn_1', name: 'Acme Holding', subdomain: 'acme', status: 'active', createdAt: '2026-01-10T12:00:00Z', integrationsCount: 1, userCount: 12, plan: 'enterprise' },
  { id: 'tn_2', name: 'Globex Corp', subdomain: 'globex', status: 'active', createdAt: '2026-03-15T09:30:00Z', integrationsCount: 0, userCount: 5, plan: 'pro' },
];

export const getTenants = async (): Promise<Tenant[]> => {
  await delay(300);
  return [...tenantsData];
};

export const addTenant = async (tenant: Omit<Tenant, 'id' | 'createdAt' | 'integrationsCount' | 'userCount'>): Promise<Tenant> => {
  await delay(500);
  const newTenant: Tenant = {
    ...tenant,
    id: `tn_${Math.random().toString(36).slice(2, 11)}`,
    createdAt: new Date().toISOString(),
    integrationsCount: 0,
    userCount: 1,
  };
  tenantsData.push(newTenant);
  return newTenant;
};

export const toggleTenantStatus = async (id: string): Promise<Tenant> => {
  await delay(300);
  const tenant = tenantsData.find((t) => t.id === id);
  if (!tenant) throw new Error('Kiracı bulunamadı.');
  tenant.status = tenant.status === 'active' ? 'suspended' : 'active';
  return { ...tenant };
};

// --- 2. Integrations Store ---
let integrationsData: Integration[] = [
  {
    id: 'int_1',
    provider: 'github',
    name: 'GitHub Enterprise Connection',
    status: 'connected',
    webhookUrl: 'https://api.lstai.co/webhooks/github/acme_123',
    webhookSecret: 'shh_secret_github_hook_123',
    connectedAt: '2026-01-11T14:22:00Z',
    lastSyncAt: '2026-06-04T08:14:00Z',
  },
  {
    id: 'int_2',
    provider: 'slack',
    name: 'Slack Notification channel',
    status: 'disconnected',
    webhookUrl: 'https://api.lstai.co/webhooks/slack/acme_123',
    webhookSecret: 'shh_secret_slack_hook_123',
    connectedAt: '2026-02-12T10:15:00Z',
  }
];

export const getIntegrations = async (): Promise<Integration[]> => {
  await delay(300);
  return [...integrationsData];
};

export const toggleIntegration = async (id: string): Promise<Integration> => {
  await delay(400);
  const integration = integrationsData.find((i) => i.id === id);
  if (!integration) throw new Error('Entegrasyon bulunamadı.');
  integration.status = integration.status === 'connected' ? 'disconnected' : 'connected';
  if (integration.status === 'connected') {
    integration.lastSyncAt = new Date().toISOString();
  }
  return { ...integration };
};

export const addIntegration = async (integration: Omit<Integration, 'id' | 'webhookUrl' | 'webhookSecret' | 'connectedAt'>): Promise<Integration> => {
  await delay(500);
  const newIntegration: Integration = {
    ...integration,
    id: `int_${Math.random().toString(36).slice(2, 11)}`,
    webhookUrl: `https://api.lstai.co/webhooks/${integration.provider}/acme_${Math.random().toString(36).slice(2, 7)}`,
    webhookSecret: `shh_${Math.random().toString(36).slice(2, 14)}`,
    connectedAt: new Date().toISOString(),
  };
  integrationsData.push(newIntegration);
  return newIntegration;
};

// --- 3. Review Rules Store ---
let reviewRulesData: ReviewRule[] = [
  { id: 'rule_1', name: 'SQL Injection Koruması', description: 'Girdi temizliğini ve parametreleştirilmiş sorgu doğruluğunu denetler.', enabled: true, severity: 'critical', type: 'security', customPrompt: 'Sorgularda ham SQL dizgisi birleştirme yapılıp yapılmadığını doğrula.' },
  { id: 'rule_2', name: 'Memory Leak Analizi', description: 'Kapatılmamış akışları, event listener sızıntılarını kontrol eder.', enabled: true, severity: 'warning', type: 'performance' },
  { id: 'rule_3', name: 'Değişken İsimlendirme Formatı', description: 'camelCase ve PascalCase kurallarına uyumluluğu doğrular.', enabled: true, severity: 'info', type: 'style' },
  { id: 'rule_4', name: 'API Dokümantasyon Eksikliği', description: 'Yeni eklenen endpointlerin JSDoc veya OpenAPI şemasını kontrol eder.', enabled: false, severity: 'warning', type: 'doc' },
  { id: 'rule_5', name: 'Kritik Şifre ve Token Kontrolü', description: 'Kod içerisinde açık biçimde yazılmış API key, private key ve şifreleri denetler.', enabled: true, severity: 'critical', type: 'security', customPrompt: 'Kod içinde hardcoded gizli anahtar barındırıp barındırmadığını kontrol et.' },
  { id: 'rule_6', name: 'Gereksiz Paket İthalatı', description: 'Kullanılmayan veya gereksiz yere eklenmiş paket bağımlılıklarını tarar.', enabled: true, severity: 'info', type: 'style' },
  { id: 'rule_7', name: 'Konsol Log Temizliği', description: 'Canlı ortama çıkacak kodlarda konsol log ifadelerini tespit eder.', enabled: true, severity: 'info', type: 'style', customPrompt: 'Production kodundaki console.log ve console.dir ifadelerini uyar.' },
  { id: 'rule_8', name: 'Asenkron Fonksiyon Hata Yakalama', description: 'Async/await bloklarında eksik try-catch yapılandırmalarını kontrol eder.', enabled: true, severity: 'warning', type: 'performance', customPrompt: 'Bütün asenkron fonksiyonların hata yakalama bloklarına sahip olmasını sağla.' },
  { id: 'rule_9', name: 'İç İçe Döngü Optimizasyonu', description: 'Büyük veri kümelerinde iç içe geçmiş O(N^2) ve üzeri döngüleri tespit eder.', enabled: false, severity: 'warning', type: 'performance' },
  { id: 'rule_10', name: 'Dosya Boyutu Sınırı', description: 'Tek bir dosyadaki satır sayısının 500 satırı aşmamasını denetler.', enabled: true, severity: 'info', type: 'style' },
  { id: 'rule_11', name: 'CSS Seçici Karmaşıklığı', description: 'Aşırı karmaşık ve performans düşüren CSS seçicilerini analiz eder.', enabled: false, severity: 'info', type: 'performance' },
];

export const getReviewRules = async (
  page = 1,
  limit = 10,
  search = '',
  severity = '',
  type = ''
): Promise<PaginatedResponse<ReviewRule>> => {
  await delay(350);
  
  let filtered = [...reviewRulesData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (rule) => rule.name.toLowerCase().includes(q) || rule.description.toLowerCase().includes(q) || (rule.customPrompt && rule.customPrompt.toLowerCase().includes(q))
    );
  }
  
  if (severity && severity !== 'all') {
    filtered = filtered.filter((rule) => rule.severity === severity);
  }
  
  if (type && type !== 'all') {
    filtered = filtered.filter((rule) => rule.type === type);
  }
  
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);
  const activeCount = reviewRulesData.filter((r) => r.enabled).length;
  
  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit,
    activeCount
  };
};

export const toggleReviewRule = async (id: string): Promise<ReviewRule> => {
  await delay(200);
  const rule = reviewRulesData.find((r) => r.id === id);
  if (!rule) throw new Error('İnceleme kuralı bulunamadı.');
  rule.enabled = !rule.enabled;
  return { ...rule };
};

export const updateReviewRule = async (updatedRule: ReviewRule): Promise<ReviewRule> => {
  await delay(400);
  const index = reviewRulesData.findIndex((r) => r.id === updatedRule.id);
  if (index === -1) throw new Error('İnceleme kuralı bulunamadı.');
  reviewRulesData[index] = { ...updatedRule };
  return { ...updatedRule };
};

export const bulkToggleReviewRules = async (enabled: boolean): Promise<ReviewRule[]> => {
  await delay(300);
  reviewRulesData = reviewRulesData.map((r) => ({ ...r, enabled }));
  return [...reviewRulesData];
};

export const deleteReviewRule = async (id: string): Promise<void> => {
  await delay(200);
  reviewRulesData = reviewRulesData.filter((r) => r.id !== id);
};

export const addReviewRule = async (rule: Omit<ReviewRule, 'id' | 'enabled'>): Promise<ReviewRule> => {
  await delay(300);
  const newRule: ReviewRule = {
    ...rule,
    id: `rule_${Math.random().toString(36).slice(2, 11)}`,
    enabled: true,
  };
  reviewRulesData.push(newRule);
  return newRule;
};

// --- 4. Test Configs Store ---
let testConfigsData: TestConfig[] = [
  { id: 'tcfg_1', name: 'Playwright E2E Test Suite', runner: 'playwright', command: 'npx playwright test --project=chromium', envVariables: { NODE_ENV: 'test', CI: 'true' }, timeoutSeconds: 600, isActive: true },
  { id: 'tcfg_2', name: 'Jest Unit Test Suite', runner: 'jest', command: 'npm run test:unit', envVariables: { NODE_ENV: 'test' }, timeoutSeconds: 180, isActive: true },
  { id: 'tcfg_3', name: 'Vitest Component Run', runner: 'vitest', command: 'npx vitest run', envVariables: { NODE_ENV: 'test' }, timeoutSeconds: 120, isActive: false },
  { id: 'tcfg_4', name: 'Cypress Integration Suite', runner: 'cypress', command: 'npx cypress run', envVariables: { NODE_ENV: 'test', CYPRESS_RECORD_KEY: 'mock_key' }, timeoutSeconds: 300, isActive: true },
  { id: 'tcfg_5', name: 'ESLint Code Style Analysis', runner: 'jest', command: 'npm run lint', envVariables: { NODE_ENV: 'test' }, timeoutSeconds: 60, isActive: true },
  { id: 'tcfg_6', name: 'TypeScript Compile Check', runner: 'vitest', command: 'npx tsc --noEmit', envVariables: { NODE_ENV: 'test' }, timeoutSeconds: 90, isActive: true },
  { id: 'tcfg_7', name: 'Webpack Bundle Size Check', runner: 'vitest', command: 'npm run build:size', envVariables: { NODE_ENV: 'production' }, timeoutSeconds: 120, isActive: false },
];

export const getTestConfigs = async (
  page = 1,
  limit = 10,
  search = '',
  runner = ''
): Promise<PaginatedResponse<TestConfig>> => {
  await delay(300);
  
  let filtered = [...testConfigsData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (cfg) => cfg.name.toLowerCase().includes(q) || cfg.command.toLowerCase().includes(q)
    );
  }
  
  if (runner && runner !== 'all') {
    filtered = filtered.filter((cfg) => cfg.runner === runner);
  }
  
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);
  const activeCount = testConfigsData.filter((c) => c.isActive).length;
  
  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit,
    activeCount
  };
};

export const toggleTestConfig = async (id: string): Promise<TestConfig> => {
  await delay(300);
  const config = testConfigsData.find((c) => c.id === id);
  if (!config) throw new Error('Test yapılandırması bulunamadı.');
  config.isActive = !config.isActive;
  return { ...config };
};

export const updateTestConfig = async (updated: TestConfig): Promise<TestConfig> => {
  await delay(400);
  const index = testConfigsData.findIndex((c) => c.id === updated.id);
  if (index === -1) throw new Error('Test yapılandırması bulunamadı.');
  testConfigsData[index] = { ...updated };
  return { ...updated };
};

export const deleteTestConfig = async (id: string): Promise<void> => {
  await delay(200);
  testConfigsData = testConfigsData.filter((c) => c.id !== id);
};

// --- 5. Event Logs Store (Populated with 20 items for pagination testing) ---
let eventLogsData: EventLog[] = [
  { id: 'log_1', timestamp: '2026-06-04T11:27:00Z', level: 'success', source: 'webhook', actor: 'KeremGerede', branch: 'sprint2/task-2', message: "GitHub reposundan webhook alındı: 'task_to_sprint_merge' tetiklendi." },
  { id: 'log_2', timestamp: '2026-06-04T11:27:05Z', level: 'info', source: 'review_agent', actor: 'CI_Agent', branch: 'sprint2/task-2', message: 'AI Review Agent başlatıldı. Model: Claude-3.5-Sonnet analiz ediliyor...' },
  { id: 'log_3', timestamp: '2026-06-04T11:27:10Z', level: 'success', source: 'review_agent', actor: 'CI_Agent', branch: 'sprint2/task-2', message: 'AI inceleme tamamlandı. Risk skoru: DÜŞÜK (%95 güvenirlik). TASK-2 onaylandı.' },
  { id: 'log_4', timestamp: '2026-06-04T11:27:12Z', level: 'info', source: 'dev_merge', actor: 'CI_Agent', branch: 'sprint2/task-2', message: "Sprint2/task-2 dalının main'e otomatik birleştirme koşulları doğrulanıyor..." },
  { id: 'log_5', timestamp: '2026-06-04T11:27:15Z', level: 'success', source: 'dev_merge', actor: 'CI_Agent', branch: 'sprint2/task-2', message: 'Otomatik çakışma taraması tamamlandı: Çakışma tespit edilmedi. Birleştirme tamamlandı.' },
  { id: 'log_6', timestamp: '2026-06-04T11:27:16Z', level: 'info', source: 'test_runner', actor: 'CI_Agent', branch: 'sprint2/task-2', message: 'Test Agent tetiklendi. E2E ve Unit test suitleri başlatılıyor...' },
  { id: 'log_7', timestamp: '2026-06-04T11:27:25Z', level: 'success', source: 'test_runner', actor: 'CI_Agent', branch: 'sprint2/task-2', message: 'Tüm testler geçti: 145/145 unit test, 24/24 E2E test başarılı.' },
  { id: 'log_8', timestamp: '2026-06-04T11:27:30Z', level: 'info', source: 'system', actor: 'System', branch: 'main', message: 'Geliştirici KeremGerede için istatistikler güncellendi.' },
  { id: 'log_9', timestamp: '2026-06-04T11:27:35Z', level: 'success', source: 'system', actor: 'CI_Agent', branch: 'main', message: 'Otomatik dağıtım tetiklendi: v2.1.2 Staging ortamına yükleniyor.' },
  { id: 'log_10', timestamp: '2026-06-04T11:28:00Z', level: 'success', source: 'system', actor: 'CI_Agent', branch: 'main', message: 'Staging Dağıtımı BAŞARILI. Sürüm: v2.1.2 aktif.' },
  { id: 'log_11', timestamp: '2026-06-04T10:43:00Z', level: 'success', source: 'webhook', actor: 'KeremGerede', branch: 'sprint2/task-1', message: "GitHub reposundan webhook alındı: 'push' tetiklendi." },
  { id: 'log_12', timestamp: '2026-06-04T10:43:10Z', level: 'info', source: 'review_agent', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'AI Review Agent başlatıldı. Analiz yapılıyor...' },
  { id: 'log_13', timestamp: '2026-06-04T10:44:20Z', level: 'success', source: 'review_agent', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'AI inceleme tamamlandı. TASK-1 onaylandı.' },
  { id: 'log_14', timestamp: '2026-06-04T10:44:30Z', level: 'info', source: 'dev_merge', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'Dal birleştirme kuralları doğrulanıyor...' },
  { id: 'log_15', timestamp: '2026-06-04T10:45:00Z', level: 'success', source: 'dev_merge', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'Otomatik birleştirme tamamlandı.' },
  { id: 'log_16', timestamp: '2026-06-04T10:45:10Z', level: 'info', source: 'test_runner', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'Test suitleri koşturuluyor...' },
  { id: 'log_17', timestamp: '2026-06-04T10:46:15Z', level: 'success', source: 'test_runner', actor: 'CI_Agent', branch: 'sprint2/task-1', message: 'Testler başarıyla tamamlandı.' },
  { id: 'log_18', timestamp: '2026-06-04T09:12:00Z', level: 'warning', source: 'system', actor: 'System', branch: '—', message: 'Slack entegrasyonu bağlantı hatası verdi: Webhook secret geçersiz.' },
  { id: 'log_19', timestamp: '2026-06-04T09:00:00Z', level: 'info', source: 'system', actor: 'System', branch: '—', message: 'LST AI arka plan servisleri başlatıldı.' },
  { id: 'log_20', timestamp: '2026-06-04T08:00:00Z', level: 'success', source: 'system', actor: 'System', branch: 'main', message: 'Sistem önbellekleri temizlendi ve optimize edildi.' }
];

export const getEventLogs = async (
  page = 1,
  limit = 10,
  search = '',
  level = '',
  source = ''
): Promise<PaginatedResponse<EventLog>> => {
  await delay(250);
  
  let filtered = [...eventLogsData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (log) => log.message.toLowerCase().includes(q) || log.source.toLowerCase().includes(q)
    );
  }
  
  if (level) {
    filtered = filtered.filter((log) => log.level === level);
  }

  if (source) {
    filtered = filtered.filter((log) => log.source === source);
  }
  
  // Sort descending by default to show newest logs first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit
  };
};

export const addEventLog = (log: Omit<EventLog, 'id' | 'timestamp'>): EventLog => {
  const newLog: EventLog = {
    ...log,
    id: `log_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date().toISOString()
  };
  eventLogsData.push(newLog);
  return newLog;
};

// --- 6. Merge Reviews Store ---
let mergeReviewsData: MergeReview[] = [
  { id: 'rev_1', taskId: 'TASK-2', prTitle: 'Sprint 2 Task-2 Merge Request', actor: 'KeremGerede', sourceBranch: 'sprint2/task-2', targetBranch: 'main', status: 'success', score: 95, reviewedAt: '2026-06-04T11:27:10Z', changesCount: { additions: 140, deletions: 20 }, criticalIssuesCount: 0, suggestionsCount: 2, projectName: 'LST AI Portal', sprintName: 'Sprint 2' },
  { id: 'rev_2', taskId: 'TASK-1', prTitle: 'Dashboard Altyapısı Entegrasyonu', actor: 'KeremGerede', sourceBranch: 'sprint2/task-1', targetBranch: 'main', status: 'success', score: 88, reviewedAt: '2026-06-04T10:45:00Z', changesCount: { additions: 450, deletions: 110 }, criticalIssuesCount: 0, suggestionsCount: 5, projectName: 'LST AI Portal', sprintName: 'Sprint 2' },
  { id: 'rev_3', taskId: 'TASK-8', prTitle: 'SQL Injection Koruma Kuralı Ekleme', actor: 'MelisKara', sourceBranch: 'security/sql-inject', targetBranch: 'main', status: 'success', score: 98, reviewedAt: '2026-06-03T15:30:00Z', changesCount: { additions: 65, deletions: 5 }, criticalIssuesCount: 0, suggestionsCount: 1, projectName: 'LST AI API', sprintName: 'Sprint 2' },
  { id: 'rev_4', taskId: 'TASK-5', prTitle: 'CSS Grid Mobil Uyumluluk Güncellemesi', actor: 'ZeynepKaya', sourceBranch: 'fix/mobile-grid', targetBranch: 'main', status: 'success', score: 92, reviewedAt: '2026-06-02T09:15:00Z', changesCount: { additions: 120, deletions: 45 }, criticalIssuesCount: 0, suggestionsCount: 3, projectName: 'LST AI Portal', sprintName: 'Sprint 2' },
  { id: 'rev_5', taskId: 'TASK-12', prTitle: 'Redis Cache Entegrasyon Katmanı', actor: 'CanYilmaz', sourceBranch: 'feature/redis-cache', targetBranch: 'main', status: 'success', score: 76, reviewedAt: '2026-06-01T14:20:00Z', changesCount: { additions: 310, deletions: 80 }, criticalIssuesCount: 1, suggestionsCount: 6, projectName: 'LST AI API', sprintName: 'Sprint 1' },
  { id: 'rev_6', taskId: 'TASK-14', prTitle: 'Docker Compose Local Setup', actor: 'ArdaDemir', sourceBranch: 'devops/docker-compose', targetBranch: 'main', status: 'failed', score: 45, reviewedAt: '2026-05-28T11:00:00Z', changesCount: { additions: 45, deletions: 12 }, criticalIssuesCount: 2, suggestionsCount: 4, projectName: 'DevOps Infrastructure', sprintName: 'Sprint 1' },
  { id: 'rev_7', taskId: 'TASK-19', prTitle: 'GraphQL API Query Resolver Refaktörü', actor: 'MelisKara', sourceBranch: 'refactor/graphql', targetBranch: 'main', status: 'success', score: 90, reviewedAt: '2026-05-25T16:45:00Z', changesCount: { additions: 185, deletions: 95 }, criticalIssuesCount: 0, suggestionsCount: 2, projectName: 'LST AI API', sprintName: 'Sprint 1' },
  { id: 'rev_8', taskId: 'TASK-21', prTitle: 'Jest Unit Test Altyapısı Revizyonu', actor: 'KeremGerede', sourceBranch: 'test/jest-upgrade', targetBranch: 'main', status: 'success', score: 87, reviewedAt: '2026-05-20T10:10:00Z', changesCount: { additions: 220, deletions: 50 }, criticalIssuesCount: 0, suggestionsCount: 4, projectName: 'LST AI Core', sprintName: 'Sprint 1' },
];

export const getMergeReviews = async (
  page = 1,
  limit = 10,
  search = '',
  startDate = '',
  endDate = ''
): Promise<PaginatedResponse<MergeReview>> => {
  await delay(300);
  
  let filtered = [...mergeReviewsData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (rev) => rev.prTitle.toLowerCase().includes(q) || rev.taskId.toLowerCase().includes(q) || rev.actor.toLowerCase().includes(q)
    );
  }

  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter(rev => new Date(rev.reviewedAt).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const endMs = end.getTime();
    filtered = filtered.filter(rev => new Date(rev.reviewedAt).getTime() <= endMs);
  }
  
  filtered.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
  
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit
  };
};

// --- 7. Functional Tests Store ---
let functionalTestsData: FunctionalTestRun[] = [
  { id: 'tr_1', name: 'Playwright E2E Run', runNumber: 42, status: 'passed', passedCount: 24, failedCount: 0, durationSeconds: 45, coveragePercent: 88, executedBy: 'CI_Agent', completedAt: '2026-06-04T11:27:25Z' },
  { id: 'tr_2', name: 'Jest Unit Test Run', runNumber: 84, status: 'passed', passedCount: 145, failedCount: 0, durationSeconds: 15, coveragePercent: 92, executedBy: 'CI_Agent', completedAt: '2026-06-04T11:27:20Z' },
];

export const getFunctionalTestRuns = async (
  page = 1,
  limit = 10,
  search = ''
): Promise<PaginatedResponse<FunctionalTestRun>> => {
  await delay(300);
  
  let filtered = [...functionalTestsData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (run) => run.name.toLowerCase().includes(q) || run.executedBy.toLowerCase().includes(q)
    );
  }
  
  filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit
  };
};

export const addFunctionalTestRun = async (
  run: Omit<FunctionalTestRun, 'id' | 'runNumber' | 'completedAt'>
): Promise<FunctionalTestRun> => {
  await delay(100);
  
  // Find maximum runNumber
  const maxRunNum = functionalTestsData.reduce((max, r) => r.runNumber > max ? r.runNumber : max, 0);
  
  const newRun: FunctionalTestRun = {
    ...run,
    id: `tr_${Math.random().toString(36).slice(2, 11)}`,
    runNumber: maxRunNum + 1,
    completedAt: new Date().toISOString(),
  };
  
  // Add to start of array
  functionalTestsData.unshift(newRun);
  
  // Also push a system event log
  eventLogsData.unshift({
    id: `log_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date().toISOString(),
    level: run.status === 'passed' ? 'success' : 'error',
    source: 'test_runner',
    message: `${run.name} #${maxRunNum + 1} tamamlandı. Sonuç: ${run.status.toUpperCase()} (${run.passedCount} başarılı, ${run.failedCount} başarısız). Kapsama: %${run.coveragePercent}.`
  });

  return newRun;
};

// --- 8. Promotions Store ---
let promotionsData: Promotion[] = [
  { id: 'prm_1', title: 'Task-2 Staging Promotion', sourceEnv: 'testing', targetEnv: 'staging', status: 'success', actor: 'KeremGerede', durationSeconds: 120, promotedAt: '2026-06-04T11:28:00Z', version: 'v2.1.2' },
];

export const getPromotions = async (
  page = 1,
  limit = 10,
  search = ''
): Promise<PaginatedResponse<Promotion>> => {
  await delay(300);
  
  let filtered = [...promotionsData];
  
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (promo) => promo.title.toLowerCase().includes(q) || promo.actor.toLowerCase().includes(q) || promo.version.toLowerCase().includes(q)
    );
  }
  
  filtered.sort((a, b) => new Date(b.promotedAt).getTime() - new Date(a.promotedAt).getTime());
  
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    totalCount,
    totalPages,
    page,
    limit
  };
};

export const createPromotion = async (promo: Omit<Promotion, 'id' | 'status' | 'durationSeconds' | 'promotedAt' | 'version'>): Promise<Promotion> => {
  await delay(800);
  const newPromo: Promotion = {
    ...promo,
    id: `prm_${Math.random().toString(36).slice(2, 11)}`,
    status: 'success', // Simulated success
    durationSeconds: Math.floor(Math.random() * 60) + 60,
    promotedAt: new Date().toISOString(),
    version: `v${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
  };
  promotionsData.push(newPromo);
  return newPromo;
};

// --- 9. Developer Stats Store ---
let developerStatsData: DeveloperStat[] = [
  { id: 'dev_1', name: 'KeremGerede', commitsCount: 42, reviewsCompleted: 12, approvedCount: 10, rejectedCount: 2, tokenUsage: 250000, costUsd: 4.25 },
  { id: 'dev_2', name: 'MelisKara', commitsCount: 64, reviewsCompleted: 20, approvedCount: 18, rejectedCount: 2, tokenUsage: 410000, costUsd: 6.95 },
  { id: 'dev_3', name: 'CanYilmaz', commitsCount: 35, reviewsCompleted: 8, approvedCount: 7, rejectedCount: 1, tokenUsage: 180000, costUsd: 3.10 },
  { id: 'dev_4', name: 'ZeynepKaya', commitsCount: 51, reviewsCompleted: 15, approvedCount: 11, rejectedCount: 4, tokenUsage: 320000, costUsd: 5.45 },
  { id: 'dev_5', name: 'ArdaDemir', commitsCount: 28, reviewsCompleted: 10, approvedCount: 8, rejectedCount: 2, tokenUsage: 150000, costUsd: 2.55 },
];

export const getDeveloperStats = async (): Promise<DeveloperStat[]> => {
  await delay(300);
  return [...developerStatsData];
};

// --- 10. System Stats Aggregations ---
export const getSystemStatsSummary = async (): Promise<SystemStatsSummary> => {
  await delay(200);
  return {
    totalTenants: tenantsData.length,
    totalIntegrations: integrationsData.filter((i) => i.status === 'connected').length,
    totalReviewsSuccess: mergeReviewsData.filter((r) => r.status === 'success').length,
    totalReviewsFailed: mergeReviewsData.filter((r) => r.status === 'failed').length,
    totalTestsSuccess: functionalTestsData.filter((t) => t.status === 'passed').length,
    totalTestsFailed: functionalTestsData.filter((t) => t.status === 'failed').length,
    totalEventsCount: eventLogsData.length,
    totalReviewsCount: mergeReviewsData.length,
  };
};
