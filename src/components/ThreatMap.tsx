import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { LogEntry } from '../types';

interface ThreatMapProps {
  logs: LogEntry[];
}

// Country coordinates for plotting
const countryCoords: Record<string, [number, number]> = {
  'US': [-95.7129, 37.0902],
  'CN': [104.1954, 35.8617],
  'RU': [105.3188, 61.5240],
  'IN': [78.9629, 20.5937],
  'BR': [-51.9253, -14.2350],
  'DE': [10.4515, 51.1657],
  'GB': [-3.4360, 55.3781],
  'FR': [2.2137, 46.2276],
  'JP': [138.2529, 36.2048],
  'AU': [133.7751, -25.2744],
  'KP': [127.5105, 40.3399],
  'IR': [53.6880, 32.4279],
};

const ThreatMap = React.memo(function ThreatMap({ logs }: ThreatMapProps) {
  const [activeAttacks, setActiveAttacks] = useState<Array<{
    id: string;
    from: [number, number];
    to: [number, number];
    severity: string;
    timestamp: number;
  }>>([]);
  const [mapError, setMapError] = useState(false);

  // Memoize severity color function
  const getSeverityColor = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF003C';
      case 'high': return '#FF6B00';
      case 'medium': return '#FFB800';
      case 'low': return '#00F0FF';
      default: return '#6B7280';
    }
  }, []);

  // Simulate live attacks - throttled to 3 seconds for better performance
  useEffect(() => {
    const interval = setInterval(() => {
      if (logs.length === 0) return;

      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const fromCoords = countryCoords[randomLog.country] || [-95.7129, 37.0902];
      const toCoords = countryCoords['US'] || [-95.7129, 37.0902];

      const newAttack = {
        id: `attack-${Date.now()}`,
        from: fromCoords,
        to: toCoords,
        severity: randomLog.severity,
        timestamp: Date.now(),
      };

      setActiveAttacks(prev => [...prev.slice(-9), newAttack]); // Keep last 10
    }, 3000); // Increased from 2000 to 3000ms for better performance

    return () => clearInterval(interval);
  }, [logs]);

  // Remove old attacks
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setActiveAttacks(prev => prev.filter(a => now - a.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="glass-card rounded-lg p-6 relative overflow-hidden">
      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent scan-line"></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Global Threat Map
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full pulse-glow"></span>
          <span className="text-xs text-gray-500">LIVE</span>
        </div>
      </div>

      <div className="relative h-[400px]">
        {mapError ? (
          <div className="flex items-center justify-center h-full bg-[#0a0a0a] border border-[#262626] rounded">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Map data unavailable</p>
              <button 
                onClick={() => setMapError(false)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
        <ComposableMap
          projectionConfig={{
            scale: 147,
            center: [0, 20],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies 
            geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
            onError={() => setMapError(true)}
          >
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1a1a1a"
                  stroke="#262626"
                  strokeWidth={0.5}
                />
              ))
            }
          </Geographies>

          {/* Attack arcs */}
          {activeAttacks.map((attack) => (
            <Line
              key={attack.id}
              from={attack.from}
              to={attack.to}
              stroke={getSeverityColor(attack.severity)}
              strokeWidth={2}
              strokeLinecap="round"
              strokeOpacity={0.6}
            />
          ))}

          {/* Source markers (attack origins) */}
          {activeAttacks.map((attack) => (
            <Marker key={`marker-${attack.id}`} coordinates={attack.from}>
              <circle
                r={4}
                fill={getSeverityColor(attack.severity)}
                className="pulse-glow"
              />
              <circle
                r={8}
                fill={getSeverityColor(attack.severity)}
                fillOpacity={0.2}
                className="pulse-glow"
              />
            </Marker>
          ))}

          {/* Destination markers (targets) */}
          {activeAttacks.map((attack) => (
            <Marker key={`target-${attack.id}`} coordinates={attack.to}>
              <circle
                r={3}
                fill="#00F0FF"
                className="pulse-glow"
              />
            </Marker>
          ))}
        </ComposableMap>
        )}
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-6 left-6 glass-card rounded px-3 py-2">
        <div className="text-xs text-gray-500 mb-1">Active Threats</div>
        <div className="text-2xl font-bold neon-cyan">{activeAttacks.length}</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 glass-card rounded px-3 py-2">
        <div className="text-xs text-gray-500 mb-2">Severity</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF003C' }}></div>
            <span className="text-xs text-gray-400">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B00' }}></div>
            <span className="text-xs text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFB800' }}></div>
            <span className="text-xs text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00F0FF' }}></div>
            <span className="text-xs text-gray-400">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ThreatMap;
