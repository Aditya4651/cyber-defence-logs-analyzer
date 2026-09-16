import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { LogEntry } from '../types';

interface ThreatChartsProps {
  logs: LogEntry[];
}

const CHART_BG = '#0f1013';
const GRID_COLOR = '#1a1d23';
const TEXT_COLOR = '#6b7280';
const ACCENT = '#f59e0b';
const ACCENT_DIM = '#78350f';

export default function ThreatCharts({ logs }: ThreatChartsProps) {
  const attackChartData = useMemo(() => {
    const attackTypeData = logs.reduce((acc, log) => {
      acc[log.attackType] = (acc[log.attackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(attackTypeData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [logs]);

  const severityChartData = useMemo(() => {
    const severityData = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Critical', value: severityData['critical'] || 0, color: ACCENT },
      { name: 'High', value: severityData['high'] || 0, color: '#d97706' },
      { name: 'Medium', value: severityData['medium'] || 0, color: '#92400e' },
      { name: 'Low', value: severityData['low'] || 0, color: '#451a03' },
      { name: 'Info', value: severityData['info'] || 0, color: '#292524' },
    ];
  }, [logs]);

  const timelineChartData = useMemo(() => {
    const timelineData = logs.reduce((acc, log) => {
      const date = new Date(log.timestamp);
      const hour = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}h`;
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(timelineData)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-14);
  }, [logs]);

  const countryChartData = useMemo(() => {
    const countryData = logs.reduce((acc, log) => {
      acc[log.country] = (acc[log.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [logs]);

  const tooltipStyle = {
    backgroundColor: '#14161a',
    border: '1px solid #2a2d35',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#e5e7eb',
    padding: '6px 10px',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#22252b] rounded-lg overflow-hidden border border-[#22252b]">
      {/* Attack Types */}
      <div className="bg-[#0f1013] p-4">
        <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">
          Attack Types
        </h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={attackChartData} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TEXT_COLOR, fontSize: 10 }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} height={50} />
              <YAxis tick={{ fill: TEXT_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#1a1d23' }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={ACCENT} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity */}
      <div className="bg-[#0f1013] p-4">
        <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">
          Severity Breakdown
        </h3>
        <div className="flex items-center gap-4">
          <div style={{ width: '50%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {severityChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-gray-300 font-mono tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#0f1013] p-4">
        <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">
          Event Timeline
        </h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={timelineChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="time" tick={{ fill: TEXT_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TEXT_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={1.5} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-[#0f1013] p-4">
        <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">
          Top Source Countries
        </h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={countryChartData} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={{ fill: TEXT_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: TEXT_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip cursor={{ fill: '#1a1d23' }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={ACCENT_DIM} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
