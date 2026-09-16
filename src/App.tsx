import { useState, useMemo } from 'react';
import { Shield, Terminal, RefreshCw, Download, Globe } from 'lucide-react';
import StatsCards from './components/StatsCards';
import ThreatCharts from './components/ThreatCharts';
import LogViewer from './components/LogViewer';
import LiveFeed from './components/LiveFeed';
import { generateLogs } from './data/sampleLogs';
import { ThreatSummary } from './types';

function App() {
  const [logs, setLogs] = useState(() => generateLogs(200));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    }, 800);
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
    a.download = `cyber-defense-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    CyberShield
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Defense Log Analyzer</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">Network: <span className="text-green-400">Protected</span></span>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4">
          <div className="flex gap-1 bg-gray-900/50 border border-gray-800 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gray-800 text-cyan-400 shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-gray-800 text-cyan-400 shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Log Explorer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Stats Cards */}
          <StatsCards summary={summary} />

          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <ThreatCharts logs={logs} />
              </div>
              <div className="space-y-6">
                <LiveFeed logs={logs} />
                
                {/* Quick Stats Panel */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Firewall</span>
                      <span className="text-sm text-green-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">IDS/IPS</span>
                      <span className="text-sm text-green-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Monitoring
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">WAF</span>
                      <span className="text-sm text-green-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Protected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Threat Intel</span>
                      <span className="text-sm text-cyan-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        Updating
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Last Scan</span>
                      <span className="text-sm text-gray-300">2 min ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Rules Updated</span>
                      <span className="text-sm text-gray-300">v4.2.1</span>
                    </div>
                  </div>
                  
                  {/* Threat Level Meter */}
                  <div className="mt-5 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Threat Level</span>
                      <span className="text-sm font-bold text-orange-400">ELEVATED</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-600">Low</span>
                      <span className="text-[10px] text-gray-600">Critical</span>
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
        <footer className="border-t border-gray-800/50 mt-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-600">CyberShield Defense Log Analyzer v2.0</span>
            <span className="text-xs text-gray-600">
              {logs.length} events analyzed • Last update: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
