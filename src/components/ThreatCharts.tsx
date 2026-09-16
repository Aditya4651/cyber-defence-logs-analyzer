import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { Download, Radio, Shield } from 'lucide-react';
import { LogEntry } from '../types';

interface ThreatChartsProps {
  logs: LogEntry[];
}

const BORDER = '#262626';
const GRID = '#1f1f1f';
const TEXT = '#737373';
const TEXT_LIGHT = '#a3a3a3';
const BAR = '#404040';
const BAR_HOVER = '#ededed';
const LINE = '#ededed';
const ACCENT = '#f59e0b';
const CRITICAL = '#ef4444';

const tooltipStyle = {
  backgroundColor: '#0a0a0a',
  border: `1px solid ${BORDER}`,
  borderRadius: '6px',
  fontSize: '11px',
  color: '#ededed',
  padding: '6px 10px',
  fontFamily: 'JetBrains Mono, monospace',
};

const ThreatCharts = React.memo(function ThreatCharts({ logs }: ThreatChartsProps) {
  const attackChartData = useMemo(() => {
    const data = logs.reduce((acc, log) => {
      acc[log.attackType] = (acc[log.attackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [logs]);

  const severityData = useMemo(() => {
    const data = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const total = logs.length;
    return [
      { name: 'Critical', value: data['critical'] || 0, color: CRITICAL },
      { name: 'High', value: data['high'] || 0, color: ACCENT },
      { name: 'Medium', value: data['medium'] || 0, color: '#737373' },
      { name: 'Low', value: data['low'] || 0, color: '#404040' },
    ].map(d => ({ ...d, pct: total > 0 ? (d.value / total) * 100 : 0 }));
  }, [logs]);

  const timelineData = useMemo(() => {
    const data = logs.reduce((acc, log) => {
      const d = new Date(log.timestamp);
      const hour = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}h`;
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-16);
  }, [logs]);

  const countryData = useMemo(() => {
    const data = logs.reduce((acc, log) => {
      acc[log.country] = (acc[log.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const max = sorted[0]?.value || 1;
    return sorted.map(d => ({ ...d, pct: (d.value / max) * 100 }));
  }, [logs]);

  const [hoveredTimeline, setHoveredTimeline] = useState<string | null>(null);

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ChartCard = ({ title, children, data, filename }: { title: string; children: React.ReactNode; data?: any[]; filename?: string }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="chart-label">{title}</h3>
        {data && (
          <button
            onClick={() => exportCSV(data, filename || title.toLowerCase().replace(/\s+/g, '-'))}
            className="text-[#525252] hover:text-[#a3a3a3] transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Attack Types - Horizontal bars */}
      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="Attack Types" data={attackChartData} filename="attack-types">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={attackChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: TEXT, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: TEXT_LIGHT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: '#1a1a1a' }}
                  contentStyle={tooltipStyle}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 2, 2, 0]}
                  fill={BAR}
                  activeBar={{ fill: BAR_HOVER }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Severity - Progress bars */}
      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="Severity Breakdown" data={severityData} filename="severity">
          <div className="space-y-4 py-2">
            {severityData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#a3a3a3] uppercase tracking-wider font-medium">
                    {item.name}
                  </span>
                  <span className="text-[12px] text-[#ededed] font-mono tabular-nums">
                    {item.value} <span className="text-[#525252]">({item.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Live Feed */}
      <div className="col-span-12 lg:col-span-4">
        <LiveFeedPanel logs={logs} />
      </div>

      {/* Timeline */}
      <div className="col-span-12 lg:col-span-8">
        <ChartCard title="Event Timeline" data={timelineData} filename="timeline">
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state?.activeLabel) setHoveredTimeline(state.activeLabel);
                }}
                onMouseLeave={() => setHoveredTimeline(null)}
              >
                <defs>
                  <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LINE} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={LINE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: TEXT, strokeOpacity: 0.3 }}
                  contentStyle={tooltipStyle}
                />
                {hoveredTimeline && (
                  <ReferenceLine
                    x={hoveredTimeline}
                    stroke={TEXT_LIGHT}
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={LINE}
                  strokeWidth={1.5}
                  fill="url(#timelineFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Countries - List with progress bars */}
      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="Top Source Countries" data={countryData} filename="countries">
          <div className="space-y-2.5">
            {countryData.map((item, idx) => (
              <div key={item.name} className="relative">
                <div className="flex items-center justify-between relative z-10 py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#525252] font-mono w-4 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[12px] text-[#ededed]">{item.name}</span>
                  </div>
                  <span className="text-[12px] text-[#a3a3a3] font-mono tabular-nums">
                    {item.value}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="h-[22px] bg-[#1f1f1f] rounded-sm transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
});

// Inline LiveFeedPanel with empty state
function LiveFeedPanel({ logs }: { logs: LogEntry[] }) {
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>(() => logs.slice(0, 10));
  const [flashId, setFlashId] = useState<string | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (logs.length === 0) return;
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
    <div className="card overflow-hidden h-full flex flex-col">
      <div className="px-5 py-3 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          <h3 className="chart-label">Live Feed</h3>
        </div>
        <span className="text-[10px] text-[#525252] font-mono">STREAMING</span>
      </div>

      {visibleLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-[#525252]" />
          </div>
          <p className="text-[12px] text-[#a3a3a3] mb-1">No active threats</p>
          <p className="text-[11px] text-[#525252]">All systems nominal</p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-[#1a1a1a] overflow-y-auto max-h-[280px]">
          {visibleLogs.map((log) => (
            <div
              key={log.id}
              className={`px-5 py-2 flex items-center gap-3 text-[11px] transition-colors duration-300 ${
                flashId === log.id ? 'bg-amber-500/5' : ''
              }`}
            >
              <span className="font-mono text-[#525252] w-[62px] shrink-0 tabular-nums">
                {formatTime(log.timestamp)}
              </span>
              <span className={`font-mono shrink-0 ${log.severity === 'critical' ? 'text-amber-500' : 'text-[#a3a3a3]'}`}>
                {log.sourceIP}
              </span>
              <span className="text-[#525252] shrink-0">→</span>
              <span className="text-[#ededed] truncate">{log.attackType}</span>
              <span className="ml-auto shrink-0 text-[#525252] font-mono">{log.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThreatCharts;
