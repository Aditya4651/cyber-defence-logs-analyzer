import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AlertRule {
  id: string;
  userId: string;
  name: string;
  condition: string;
  threshold: number;
  channel: 'email' | 'webhook';
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
}

interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  createdAt: string;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

interface LogSource {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: LogSourceType;
  category: LogSourceCategory;
  apiKey: string;
  enabled: boolean;
  createdAt: string;
  config?: {
    endpoint?: string;
    port?: number;
    protocol?: string;
    format?: string;
  };
  stats: {
    logsToday: number;
    sizeToday: string;
    lastIngest?: string;
  };
}

type LogSourceType =
  | 'firewall'
  | 'ids_ips'
  | 'web_server'
  | 'application'
  | 'database'
  | 'cloud'
  | 'endpoint'
  | 'network'
  | 'email'
  | 'vpn'
  | 'authentication'
  | 'container'
  | 'antivirus'
  | 'custom';

type LogSourceCategory =
  | 'network'
  | 'security'
  | 'application'
  | 'cloud'
  | 'endpoint'
  | 'infrastructure';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;

  // Alert Rules
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'userId' | 'createdAt'>) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlertRule: (id: string) => void;
  triggerAlert: (ruleId: string) => void;

  // Saved Searches
  savedSearches: SavedSearch[];
  addSavedSearch: (search: Omit<SavedSearch, 'id' | 'userId' | 'createdAt'>) => void;
  deleteSavedSearch: (id: string) => void;

  // Email Logs
  emailLogs: EmailLog[];
  sendEmail: (to: string, subject: string) => Promise<boolean>;
  getEmailCount: (date: Date) => number;

  // Log Sources
  logSources: LogSource[];
  addLogSource: (source: Omit<LogSource, 'id' | 'userId' | 'createdAt' | 'apiKey' | 'stats'>) => void;
  deleteLogSource: (id: string) => void;
  regenerateApiKey: (id: string) => void;
  updateLogSource: (id: string, updates: Partial<LogSource>) => void;

  // Log Ingestion
  realLogs: any[];
  ingestLogs: (logs: any[]) => void;
  clearLogs: () => void;
  ingestionStats: { totalIngested: number; lastIngest?: string };

  // Rate Limiting
  apiCalls: { timestamp: number; endpoint: string }[];
  checkRateLimit: (endpoint: string) => boolean;
  recordApiCall: (endpoint: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock authentication
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simple validation (in real app, this would call Clerk)
        if (email && password.length >= 6) {
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: async (email: string, password: string, name: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (email && password.length >= 6 && name) {
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name,
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      // Alert Rules
      alertRules: [],

      addAlertRule: (rule) => {
        const { user } = get();
        if (!user) return;

        const newRule: AlertRule = {
          ...rule,
          id: `alert_${Date.now()}`,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };

        set(state => ({ alertRules: [...state.alertRules, newRule] }));
      },

      updateAlertRule: (id, updates) => {
        set(state => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        }));
      },

      deleteAlertRule: (id) => {
        set(state => ({
          alertRules: state.alertRules.filter(rule => rule.id !== id),
        }));
      },

      triggerAlert: (ruleId) => {
        set(state => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === ruleId ? { ...rule, lastTriggered: new Date().toISOString() } : rule
          ),
        }));
      },

      // Saved Searches
      savedSearches: [],

      addSavedSearch: (search) => {
        const { user } = get();
        if (!user) return;

        const newSearch: SavedSearch = {
          ...search,
          id: `search_${Date.now()}`,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };

        set(state => ({ savedSearches: [...state.savedSearches, newSearch] }));
      },

      deleteSavedSearch: (id) => {
        set(state => ({
          savedSearches: state.savedSearches.filter(search => search.id !== id),
        }));
      },

      // Email Logs
      emailLogs: [],

      sendEmail: async (to: string, subject: string) => {
        // Mock email sending (simulates Resend API)
        await new Promise(resolve => setTimeout(resolve, 300));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const emailCount = get().getEmailCount(today);
        
        // Rate limit: 100 emails/day (Resend free tier)
        if (emailCount >= 100) {
          return false;
        }

        const emailLog: EmailLog = {
          id: `email_${Date.now()}`,
          to,
          subject,
          sentAt: new Date().toISOString(),
          status: 'sent',
        };

        set(state => ({ emailLogs: [...state.emailLogs, emailLog] }));
        return true;
      },

      getEmailCount: (date: Date) => {
        const { emailLogs } = get();
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return emailLogs.filter(log => {
          const logDate = new Date(log.sentAt);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === targetDate.getTime();
        }).length;
      },

      // Log Sources - Pre-seeded with sample sources
      logSources: [
        {
          id: 'source_fw_prod',
          userId: 'demo_user',
          name: 'Palo Alto - Production',
          description: 'Main production firewall - US East',
          type: 'firewall',
          category: 'security',
          apiKey: 'csk_fw_prod_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'fw-prod-us-east-01.example.com',
            port: 514,
            protocol: 'UDP/Syslog',
            format: 'syslog'
          },
          stats: {
            logsToday: 45230,
            sizeToday: '128 MB',
            lastIngest: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_ids_dmz',
          userId: 'demo_user',
          name: 'Suricata IDS - DMZ',
          description: 'Intrusion detection system for DMZ network',
          type: 'ids_ips',
          category: 'security',
          apiKey: 'csk_ids_dmz_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'ids-dmz-01.example.com',
            port: 514,
            protocol: 'UDP/Syslog',
            format: 'eve-json'
          },
          stats: {
            logsToday: 12847,
            sizeToday: '45 MB',
            lastIngest: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_nginx_prod',
          userId: 'demo_user',
          name: 'Nginx - Production API',
          description: 'Main API gateway - all regions',
          type: 'web_server',
          category: 'application',
          apiKey: 'csk_nginx_prod_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'api.example.com',
            port: 443,
            protocol: 'HTTPS',
            format: 'combined'
          },
          stats: {
            logsToday: 234567,
            sizeToday: '1.2 GB',
            lastIngest: new Date(Date.now() - 30 * 1000).toISOString()
          }
        },
        {
          id: 'source_aws_cloudtrail',
          userId: 'demo_user',
          name: 'AWS CloudTrail - Production',
          description: 'AWS API activity logs',
          type: 'cloud',
          category: 'cloud',
          apiKey: 'csk_aws_ct_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'cloudtrail.s3.amazonaws.com',
            port: 443,
            protocol: 'HTTPS/JSON',
            format: 'json'
          },
          stats: {
            logsToday: 8923,
            sizeToday: '67 MB',
            lastIngest: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_auth_okta',
          userId: 'demo_user',
          name: 'Okta - SSO Authentication',
          description: 'Single sign-on authentication logs',
          type: 'authentication',
          category: 'security',
          apiKey: 'csk_okta_sso_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'company.okta.com',
            port: 443,
            protocol: 'HTTPS/JSON',
            format: 'json'
          },
          stats: {
            logsToday: 3421,
            sizeToday: '12 MB',
            lastIngest: new Date(Date.now() - 8 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_k8s_prod',
          userId: 'demo_user',
          name: 'Kubernetes - Production Cluster',
          description: 'K8s cluster logs - all namespaces',
          type: 'container',
          category: 'infrastructure',
          apiKey: 'csk_k8s_prod_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'k8s-prod.example.com:10250',
            port: 10250,
            protocol: 'HTTPS/JSON',
            format: 'json'
          },
          stats: {
            logsToday: 567890,
            sizeToday: '2.3 GB',
            lastIngest: new Date(Date.now() - 1 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_defender',
          userId: 'demo_user',
          name: 'Microsoft Defender - Endpoints',
          description: 'Endpoint protection and EDR logs',
          type: 'antivirus',
          category: 'endpoint',
          apiKey: 'csk_defender_' + Math.random().toString(36).substring(2, 15),
          enabled: true,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'security.microsoft.com',
            port: 443,
            protocol: 'HTTPS/JSON',
            format: 'json'
          },
          stats: {
            logsToday: 15678,
            sizeToday: '89 MB',
            lastIngest: new Date(Date.now() - 12 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'source_postgres',
          userId: 'demo_user',
          name: 'PostgreSQL - Production DB',
          description: 'Database query and connection logs',
          type: 'database',
          category: 'application',
          apiKey: 'csk_pg_prod_' + Math.random().toString(36).substring(2, 15),
          enabled: false,
          createdAt: '2024-01-10T10:00:00Z',
          config: {
            endpoint: 'db-prod.example.com',
            port: 5432,
            protocol: 'TCP',
            format: 'syslog'
          },
          stats: {
            logsToday: 0,
            sizeToday: '0 B',
            lastIngest: undefined
          }
        }
      ],

      addLogSource: (source) => {
        const { user } = get();
        if (!user) return;

        const newSource: LogSource = {
          ...source,
          id: `source_${Date.now()}`,
          userId: user.id,
          apiKey: `csk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          enabled: true,
          createdAt: new Date().toISOString(),
          config: source.config || {},
          stats: {
            logsToday: 0,
            sizeToday: '0 B',
          },
        };

        set(state => ({ logSources: [...state.logSources, newSource] }));
      },

      deleteLogSource: (id) => {
        set(state => ({
          logSources: state.logSources.filter(source => source.id !== id),
        }));
      },

      updateLogSource: (id, updates) => {
        set(state => ({
          logSources: state.logSources.map(source =>
            source.id === id ? { ...source, ...updates } : source
          ),
        }));
      },

      regenerateApiKey: (id) => {
        set(state => ({
          logSources: state.logSources.map(source =>
            source.id === id
              ? { ...source, apiKey: `csk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` }
              : source
          ),
        }));
      },

      // Log Ingestion
      realLogs: [],
      ingestionStats: { totalIngested: 0 },

      ingestLogs: (logs) => {
        set(state => ({
          realLogs: [...logs, ...state.realLogs].slice(0, 10000), // Keep last 10000 logs
          ingestionStats: {
            totalIngested: state.ingestionStats.totalIngested + logs.length,
            lastIngest: new Date().toISOString(),
          },
        }));
      },

      clearLogs: () => {
        set({ realLogs: [], ingestionStats: { totalIngested: 0 } });
      },

      // Rate Limiting
      apiCalls: [],

      checkRateLimit: (endpoint: string) => {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        const { apiCalls } = get();
        const recentCalls = apiCalls.filter(
          call => call.endpoint === endpoint && call.timestamp > oneMinuteAgo
        );

        // Rate limit: 60 calls per minute per endpoint
        return recentCalls.length < 60;
      },

      recordApiCall: (endpoint: string) => {
        set(state => ({
          apiCalls: [
            ...state.apiCalls.filter(call => call.timestamp > Date.now() - 60000),
            { timestamp: Date.now(), endpoint },
          ],
        }));
      },
    }),
    {
      name: 'cybershield-storage',
    }
  )
);
