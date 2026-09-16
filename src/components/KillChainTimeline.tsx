import React, { useMemo } from 'react';
import { LogEntry } from '../types';

interface KillChainTimelineProps {
  logs: LogEntry[];
}

// Cyber Kill Chain stages
const killChainStages = [
  { id: 'recon', name: 'Reconnaissance', color: '#00F0FF' },
  { id: 'weaponize', name: 'Weaponization', color: '#00D4FF' },
  { id: 'deliver', name: 'Delivery', color: '#00B8FF' },
  { id: 'exploit', name: 'Exploitation', color: '#FFB800' },
  { id: 'install', name: 'Installation', color: '#FF6B00' },
  { id: 'c2', name: 'Command & Control', color: '#FF003C' },
  { id: 'action', name: 'Actions on Objectives', color: '#FF0000' },
];

// Map attack types to kill chain stages
const attackToStage: Record<string, string> = {
  'Port Scan': 'recon',
  'DDoS': 'action',
  'SQL Injection': 'exploit',
  'XSS': 'exploit',
  'Brute Force': 'deliver',
  'Malware': 'install',
  'Phishing': 'deliver',
  'Unauthorized Access': 'c2',
  'Data Exfiltration': 'action',
  'Privilege Escalation': 'install',
};

const KillChainTimeline = React.memo(function KillChainTimeline({ logs }: KillChainTimelineProps) {
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    killChainStages.forEach(stage => {
      counts[stage.id] = 0;
    });

    logs.forEach(log => {
      const stage = attackToStage[log.attackType];
      if (stage) {
        counts[stage]++;
      }
    });

    return counts;
  }, [logs]);

  const maxCount = Math.max(...Object.values(stageData), 1);

  const getStageHeight = (count: number) => {
    return `${(count / maxCount) * 100}%`;
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Cyber Kill Chain
        </h3>
        <div className="text-xs text-gray-500">
          Attack progression analysis
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/20 via-yellow-500/20 to-red-500/20"></div>

        {/* Stages */}
        <div className="relative flex items-end justify-between h-48 gap-2">
          {killChainStages.map((stage, idx) => {
            const count = stageData[stage.id];
            const height = getStageHeight(count);
            const isActive = count > 0;

            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center relative group">
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end h-32 relative">
                  <div
                    className="w-full max-w-[60px] rounded-t-lg transition-all duration-500 relative overflow-hidden"
                    style={{
                      height: height,
                      backgroundColor: isActive ? stage.color : '#262626',
                      opacity: isActive ? 0.8 : 0.3,
                    }}
                  >
                    {/* Glow effect */}
                    {isActive && (
                      <div
                        className="absolute inset-0 blur-xl opacity-50"
                        style={{ backgroundColor: stage.color }}
                      ></div>
                    )}

                    {/* Scan line effect */}
                    {isActive && (
                      <div className="absolute inset-x-0 h-px bg-white/30 scan-line"></div>
                    )}
                  </div>

                  {/* Count label */}
                  <div className="absolute -top-6 text-xs font-bold" style={{ color: stage.color }}>
                    {count}
                  </div>
                </div>

                {/* Stage name */}
                <div className="mt-3 text-center">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: isActive ? stage.color : '#6B7280' }}
                  >
                    {stage.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-gray-600">
                    Stage {idx + 1}
                  </div>
                </div>

                {/* Connector dot */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all"
                  style={{
                    borderColor: isActive ? stage.color : '#262626',
                    backgroundColor: isActive ? stage.color : 'transparent',
                    boxShadow: isActive ? `0 0 10px ${stage.color}` : 'none',
                  }}
                ></div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-semibold mb-1" style={{ color: stage.color }}>
                    {stage.name}
                  </div>
                  <div className="text-gray-400">
                    {count} events detected
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Attack Progression</span>
            <span className="neon-magenta">
              {Object.values(stageData).filter(c => c > 0).length} / {killChainStages.length} stages active
            </span>
          </div>
          <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full gradient-border rounded-full transition-all duration-500"
              style={{
                width: `${(Object.values(stageData).filter(c => c > 0).length / killChainStages.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default KillChainTimeline;
