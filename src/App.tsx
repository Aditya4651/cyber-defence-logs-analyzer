import { useState, useMemo, useEffect } from 'react';
import { Terminal, RefreshCw, Download, Activity, Wifi } from 'lucide-react';
import StatsCards from './components/StatsCards';
import ThreatCharts from './components/ThreatCharts';
import LogViewer from './components/LogViewer';
import LiveFeed from './components/LiveFeed';
import Logo from './components/Logo';
import { generateLogs } from './data/sampleLogs';
import { ThreatSummary } from './types';

function App() {
  const [logs, setLogs] = useState(() => generateLogs(200));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
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
      setLogs(generateLogs(200));
      setIsRefreshing(false);
    }, 600);
  };

  const handleExport = () => {
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

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-gray-100">
      {/* Header */}
      <header className="border-b border-[#1a1d23] bg-[#0a0b0d] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Logo />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-semibold text-gray-100 tracking-tight">CyberShield</span>
                <span className="text-[10px] text-gray-600 font-mono">v4.2.1</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-gray-100 bg-[#1a1d23]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  activeTab === 'logs'
                    ? 'text-gray-100 bg-[#1a1d23]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  Log Explorer
                </span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 mr-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-green-500">Connected</span>
              </span>
              <span className="font-mono tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-gray-400 hover:text-gray-200 border border-[#22252b] rounded hover:border-[#2a2d35] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-gray-400 hover:text-gray-200 border border-[#22252b] rounded hover:border-[#2a2d35] transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-[#1a1d23] px-4 py-2 flex gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-3 py-1.5 text-[12px] rounded ${
            activeTab === 'dashboard' ? 'text-gray-100 bg-[#1a1d23]' : 'text-gray-500'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-3 py-1.5 text-[12px] rounded ${
            activeTab === 'logs' ? 'text-gray-100 bg-[#1a1d23]' : 'text-gray-500'
          }`}
        >
          Log Explorer
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <StatsCards summary={summary} />

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <ThreatCharts logs={logs} />
            </div>
            <div className="space-y-4">
              <LiveFeed logs={logs} />

              {/* System Status */}
              <div className="bg-[#0f1013] border border-[#22252b] rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-[#22252b]">
                  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">System Status</h3>
                </div>
                <div className="p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Firewall</span>
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">IDS/IPS</span>
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      Monitoring
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">WAF</span>
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      Protected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Threat Intel</span>
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
                      Updating
                    </span>
                  </div>
                  <div className="border-t border-[#1a1d23] pt-2 mt-2 flex items-center justify-between">
                    <span className="text-gray-500">Threat Level</span>
                    <span className="text-amber-500 font-medium">ELEVATED</span>
                  </div>
                  <div className="w-full h-1 bg-[#1a1d23] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-400 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <LogViewer logs={logs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1d23] mt-6">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between text-[10px] text-gray-600 font-mono">
          <span>CYBERSHIELD DEFENSE ANALYZER · BUILD 2026.01.14</span>
          <span>{logs.length} events indexed · last sync {currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
