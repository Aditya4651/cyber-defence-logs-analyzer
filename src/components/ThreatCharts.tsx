import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { LogEntry } from '../types';

interface ThreatChartsProps {
  logs: LogEntry[];
}

export default function ThreatCharts({ logs }: ThreatChartsProps) {
  // Attack type distribution
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

  // Severity distribution
  const severityChartData = useMemo(() => {
    const severityData = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Critical', value: severityData['critical'] || 0, color: '#ef4444' },
      { name: 'High', value: severityData['high'] || 0, color: '#f97316' },
      { name: 'Medium', value: severityData['medium'] || 0, color: '#eab308' },
      { name: 'Low', value: severityData['low'] || 0, color: '#22c55e' },
      { name: 'Info', value: severityData['info'] || 0, color: '#3b82f6' },
    ];
  }, [logs]);

  // Timeline data (events per hour)
  const timelineChartData = useMemo(() => {
    const timelineData = logs.reduce((acc, log) => {
      const date = new Date(log.timestamp);
      const hour = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(timelineData)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const [aDate] = a.time.split(' ');
        const [bDate] = b.time.split(' ');
        return aDate.localeCompare(bDate);
      })
      .slice(-12);
  }, [logs]);

  // Top source countries
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attack Types Bar Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          Attack Type Distribution
        </h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={attackChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#d1d5db' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity Pie Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          Severity Distribution
        </h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={severityChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#d1d5db' }}
                itemStyle={{ color: '#06b6d4' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {severityChartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-gray-400">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Area Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Threat Timeline
        </h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <AreaChart data={timelineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#d1d5db' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Countries Bar Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Top Source Countries
        </h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={countryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={30} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#d1d5db' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
