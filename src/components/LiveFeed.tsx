import { useEffect, useState, useRef } from 'react';
import { LogEntry } from '../types';

interface LiveFeedProps {
  logs: LogEntry[];
}

export default function LiveFeed({ logs }: LiveFeedProps) {
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>(() => logs.slice(0, 10));
  const [flashId, setFlashId] = useState<string | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * logs.length);
      const newLog = { ...logs[randomIdx] };
      counterRef.current += 1;
      const uniqueId = `${newLog.id}-${counterRef.current}`;

      setVisibleLogs(prev => [{ ...newLog, id: uniqueId } as LogEntry, ...prev.slice(0, 9)]);
      setFlashId(uniqueId);
      setTimeout(() => setFlashId(null), 800);
    }, 2500);

    return () => clearInterval(interval);
  }, [logs]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="bg-[#0f1013] border border-[#22252b] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#22252b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Live Feed</h3>
        </div>
        <span className="text-[10px] text-gray-600 font-mono">STREAMING</span>
      </div>
      <div className="divide-y divide-[#1a1d23] max-h-[400px] overflow-y-auto custom-scrollbar">
        {visibleLogs.map((log) => (
          <div
            key={log.id}
            className={`px-3 py-1.5 flex items-center gap-2 text-[11px] transition-colors duration-300 ${
              flashId === log.id ? 'bg-amber-500/5' : ''
            }`}
          >
            <span className="font-mono text-gray-600 w-[70px] shrink-0">{formatTime(log.timestamp)}</span>
            <span className={`font-mono shrink-0 ${log.severity === 'critical' ? 'text-amber-500' : 'text-gray-500'}`}>
              {log.sourceIP}
            </span>
            <span className="text-gray-600 shrink-0">→</span>
            <span className="text-gray-300 truncate">{log.attackType}</span>
            <span className="ml-auto shrink-0 text-gray-600 font-mono">{log.country}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
