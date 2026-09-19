import { useState, useMemo, useEffect } from 'react';
import { Terminal, RefreshCw, Download, Activity, Wifi, Settings, Command, X } from 'lucide-react';
import StatsCards from './components/StatsCards';
import ThreatCharts from './components/ThreatCharts';
import ThreatMap from './components/ThreatMap';
import MITREMatrix from './components/MITREMatrix';
import KillChainTimeline from './components/KillChainTimeline';
import CommandPalette from './components/CommandPalette';
import LogViewer from './components/LogViewer';
import Logo from './components/Logo';
import AuthScreen from './components/AuthScreen';
import AlertRules from './components/AlertRules';
import SavedSearches from './components/SavedSearches';
import ServiceStatus from './components/ServiceStatus';
import LogSources from './components/LogSources';
import LogIngestion from './components/LogIngestion';
import { ThreatSummary } from './types';
import { useAppStore } from './store/appStore';
import { Toaster } from 'react-hot-toast';
import { parseLogFile } from './utils/logParser';

function App() {
  const { isAuthenticated, user, logout, realLogs } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'settings'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Use real logs from store
  const logs = realLogs;

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+K shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const summary: ThreatSummary = useMemo(() => ({
    total: logs.length,
    critical: logs.filter(l => l.severity === 'critical').length,
    high: logs.filter(l => l.severity === 'high').length,
    medium: logs.filter(l => l.severity === 'medium').length,
    low: logs.filter(l => l.severity === 'low').length,
    info: logs.filter(l => l.severity === 'info').length,
    blocked: logs.filter(l => l.status === 'blocked').length,
    active: logs.filter(l => l.status === 'active').length,
  }), [logs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Refresh is just a visual indicator now
      // Real logs come from the store
      setIsRefreshing(false);
    }, 600);
  };

  const handleExport = () => {
    if (logs.length === 0) {
      alert('No logs to export. Please upload some logs first.');
      return;
    }
    
    const csv = [
      'ID,Timestamp,Source IP,Destination IP,Source Port,Dest Port,Protocol,Attack Type,Severity,Status,Description,Country,Firewall,Signature',
      ...logs.map(l => `${l.id},${l.timestamp},${l.sourceIP},${l.destinationIP},${l.sourcePort},${l.destinationPort},${l.protocol},${l.attackType},${l.severity},${l.status},"${l.description}",${l.country},${l.firewall},${l.signature}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybershield-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = async () => {
    try {
      const response = await fetch('/sample-logs.json');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data');
      }
      const text = await response.text();
      const parsedLogs = parseLogFile(text);
      
      if (parsedLogs.length > 0) {
        useAppStore.getState().ingestLogs(parsedLogs);
        alert(`✅ Successfully loaded ${parsedLogs.length} sample logs!`);
      } else {
        alert('No valid logs found in sample data.');
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Error loading sample data. Please try again.');
    }
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthScreen />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
        {/* Header */}
        <header className="border-b border-[#262626] bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Logo />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-semibold text-[#ededed] tracking-tight">CyberShield</span>
                <span className="text-[10px] text-[#525252] font-mono">v4.2.1</span>
              </div>
            </div>

            {/* Underline tabs */}
            <nav className="hidden md:flex items-center gap-6 h-full">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`h-full px-1 text-[12px] flex items-center gap-1.5 transition-colors relative ${
                  activeTab === 'dashboard' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
                }`}
              >
                <Terminal className="w-3 h-3" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`h-full px-1 text-[12px] flex items-center gap-1.5 transition-colors relative ${
                  activeTab === 'logs' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
                }`}
              >
                <Activity className="w-3 h-3" />
                Log Explorer
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`h-full px-1 text-[12px] flex items-center gap-1.5 transition-colors relative ${
                  activeTab === 'settings' ? 'tab-active text-[#ededed]' : 'text-[#525252] hover:text-[#a3a3a3]'
                }`}
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-[#525252]">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-green-500">Protected</span>
              </span>
              {logs.length > 0 && (
                <span className="flex items-center gap-1.5 text-[#525252]">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 font-mono tabular-nums">{logs.length.toLocaleString()}</span>
                  <span>logs</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[#525252]">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                All systems nominal
              </span>
              <span className="font-mono tabular-nums text-[#525252]">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#a3a3a3] hover:text-cyan-400 border border-[#262626] rounded hover:border-cyan-500/30 transition-colors"
              title="Command Palette (⌘K)"
            >
              <Command className="w-3 h-3" />
              <span className="hidden sm:inline">⌘K</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#a3a3a3] hover:text-[#ededed] border border-[#262626] rounded hover:border-[#404040] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {logs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
                    useAppStore.getState().clearLogs();
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#a3a3a3] hover:text-red-400 border border-[#262626] rounded hover:border-red-500/30 transition-colors"
                title="Clear all logs"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#a3a3a3] hover:text-[#ededed] border border-[#262626] rounded hover:border-[#404040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              Export {logs.length > 0 && `(${logs.length})`}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-[#262626] px-6 flex gap-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 text-[12px] relative ${
            activeTab === 'dashboard' ? 'tab-active text-[#ededed]' : 'text-[#525252]'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 text-[12px] relative ${
            activeTab === 'logs' ? 'tab-active text-[#ededed]' : 'text-[#525252]'
          }`}
        >
          Log Explorer
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 text-[12px] relative ${
            activeTab === 'settings' ? 'tab-active text-[#ededed]' : 'text-[#525252]'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-3 w-20 mb-3"></div>
                  <div className="skeleton h-7 w-16"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-4 card p-5">
                <div className="skeleton h-3 w-24 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-6"></div>)}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 card p-5">
                <div className="skeleton h-3 w-24 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8"></div>)}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 card p-5">
                <div className="skeleton h-3 w-24 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-5"></div>)}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'dashboard' ? (
          <>
            <StatsCards summary={summary} />
            
            {/* Quick Actions - Show when no logs */}
            {logs.length === 0 && (
              <div className="card p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#ededed] mb-2">
                    Welcome to CyberShield
                  </h2>
                  <p className="text-sm text-[#a3a3a3] mb-6">
                    Start by uploading your log files or load sample data to explore the dashboard
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleLoadSampleData}
                      className="px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors"
                    >
                      Load Sample Data
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-6 py-2.5 bg-[#1a1a1a] border border-[#262626] text-[#a3a3a3] rounded-lg text-sm font-medium hover:bg-[#262626] hover:text-[#ededed] transition-colors"
                    >
                      Upload Log Files
                    </button>
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                      <div className="text-cyan-400 text-xs font-semibold mb-1">STEP 1</div>
                      <div className="text-sm text-[#ededed] mb-1">Upload Logs</div>
                      <div className="text-xs text-[#525252]">Upload JSON, Syslog, Apache, or CSV files</div>
                    </div>
                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                      <div className="text-cyan-400 text-xs font-semibold mb-1">STEP 2</div>
                      <div className="text-sm text-[#ededed] mb-1">Analyze Threats</div>
                      <div className="text-xs text-[#525252]">View real-time threat map and analytics</div>
                    </div>
                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                      <div className="text-cyan-400 text-xs font-semibold mb-1">STEP 3</div>
                      <div className="text-sm text-[#ededed] mb-1">Explore & Export</div>
                      <div className="text-xs text-[#525252]">Search, filter, and export your logs</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cyber Command Center - Unique Dashboard */}
            {logs.length > 0 && (
              <div className="grid grid-cols-12 gap-6">
                {/* Global Threat Map - Full width */}
                <div className="col-span-12">
                  <ThreatMap logs={logs} />
                </div>

                {/* MITRE ATT&CK Matrix */}
                <div className="col-span-12 lg:col-span-8">
                  <MITREMatrix logs={logs} />
                </div>

                {/* Kill Chain Timeline */}
                <div className="col-span-12 lg:col-span-4">
                  <KillChainTimeline logs={logs} />
                </div>

                {/* Original Charts - Still useful */}
                <div className="col-span-12">
                  <ThreatCharts logs={logs} />
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'logs' ? (
          <LogViewer logs={logs} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <LogIngestion />
              <LogSources />
            </div>
            <div className="space-y-6">
              <AlertRules />
              <SavedSearches />
              <ServiceStatus />
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-[#ededed] mb-4">Account</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                    <span className="text-[11px] text-[#525252] uppercase tracking-wider">Email</span>
                    <span className="text-sm text-[#ededed] font-mono">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                    <span className="text-[11px] text-[#525252] uppercase tracking-wider">Name</span>
                    <span className="text-sm text-[#ededed]">{user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#262626]">
                    <span className="text-[11px] text-[#525252] uppercase tracking-wider">Role</span>
                    <span className="text-sm text-[#ededed] capitalize">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[11px] text-[#525252] uppercase tracking-wider">Member since</span>
                    <span className="text-sm text-[#ededed] font-mono">
                      {new Date(user?.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full mt-6 py-2 border border-[#262626] text-[#a3a3a3] rounded text-xs hover:bg-[#1a1a1a] hover:text-[#ededed] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - thin status bar */}
      <footer className="border-t border-[#1a1a1a] mt-6">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] text-[#525252] font-mono">
          <span>CYBERSHIELD DEFENSE ANALYZER · BUILD 2026.01.14</span>
          <div className="flex items-center gap-4">
            <span>{logs.length} events indexed</span>
            <span>last sync {currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              operational
            </span>
          </div>
        </div>
      </footer>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab as any);
          setIsCommandPaletteOpen(false);
        }}
      />
      </div>
    </>
  );
}

export default App;
