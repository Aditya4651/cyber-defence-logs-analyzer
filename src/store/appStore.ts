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
  ingestLogs: (logs: any[]) => void;
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

      // Log Sources
      logSources: [],

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
      ingestionStats: { totalIngested: 0 },

      ingestLogs: (logs) => {
        set(state => ({
          ingestionStats: {
            totalIngested: state.ingestionStats.totalIngested + logs.length,
            lastIngest: new Date().toISOString(),
          },
        }));
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
