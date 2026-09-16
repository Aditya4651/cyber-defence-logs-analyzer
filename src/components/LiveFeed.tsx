import { useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Radio } from 'lucide-react';

interface LiveFeedProps {
  logs: LogEntry[];
}

const severityDot: Record<string, string> = {
  critical: 'bg-red-500 shadow-red-500/50',
  high: 'bg-orange-500 shadow-orange-500/50',
  medium: 'bg-yellow-500 shadow-yellow-500/50',
  low: 'bg-green-500 shadow-green-500/50',
  info: 'bg-blue-500 shadow-blue-500/50',
};

export default function LiveFeed({ logs }: LiveFeedProps) {
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>(logs.slice(0, 8));
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * logs.length);
      const newLog = logs[randomIdx];
      setVisibleLogs(prev => [newLog, ...prev.slice(0, 7)]);
      setFlash(newLog.id);
      setTimeout(() => setFlash(null), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, [logs]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          Live Threat Feed
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-500">LIVE</span>
        </div>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {visibleLogs.map((log) => (
          <div
            key={log.id + Math.random()}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
              flash === log.id
                ? 'bg-cyan-500/10 border-cyan-500/30 scale-[1.02]'
                : 'bg-gray-800/30 border-gray-800/50 hover:bg-gray-800/50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 shadow-lg ${severityDot[log.severity]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-cyan-400">{log.id}</span>
                <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-300 truncate">{log.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-gray-500">{log.sourceIP}</span>
                <span className="text-[10px] text-gray-600">→</span>
                <span className="text-[10px] text-gray-400">{log.attackType}</span>
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              log.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
              log.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
              log.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {log.severity.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
