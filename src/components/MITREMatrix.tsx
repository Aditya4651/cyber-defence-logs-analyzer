import React, { useMemo } from 'react';
import { LogEntry } from '../types';

interface MITREMatrixProps {
  logs: LogEntry[];
}

// MITRE ATT&CK Tactics and Techniques (simplified)
const tactics = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact',
];

const techniques: Record<string, string[]> = {
  'Reconnaissance': ['Active Scanning', 'Gather Victim Info', 'Phishing'],
  'Resource Development': ['Develop Capabilities', 'Obtain Capabilities'],
  'Initial Access': ['Phishing', 'Exploit Public-Facing App', 'Valid Accounts'],
  'Execution': ['User Execution', 'Command Line', 'Scripting'],
  'Persistence': ['Account Manipulation', 'Boot Logon', 'Scheduled Task'],
  'Privilege Escalation': ['Abuse Elevation Control', 'Account Manipulation'],
  'Defense Evasion': ['Obfuscated Files', 'Indicator Removal', 'Masquerading'],
  'Credential Access': ['Brute Force', 'Credential Dumping', 'OS Credential Dumping'],
  'Discovery': ['Account Discovery', 'System Information', 'Network Discovery'],
  'Lateral Movement': ['Remote Services', 'Internal Spearphishing'],
  'Collection': ['Data from Local System', 'Data Staged'],
  'Command and Control': ['Application Layer Protocol', 'Encrypted Channel'],
  'Exfiltration': ['Exfiltration Over C2', 'Automated Exfiltration'],
  'Impact': ['Data Encrypted', 'Data Destruction', 'Service Stop'],
};

// Map attack types to MITRE techniques
const attackTypeToTechnique: Record<string, { tactic: string; technique: string }> = {
  'Port Scan': { tactic: 'Reconnaissance', technique: 'Active Scanning' },
  'DDoS': { tactic: 'Impact', technique: 'Service Stop' },
  'SQL Injection': { tactic: 'Initial Access', technique: 'Exploit Public-Facing App' },
  'XSS': { tactic: 'Initial Access', technique: 'Exploit Public-Facing App' },
  'Brute Force': { tactic: 'Credential Access', technique: 'Brute Force' },
  'Malware': { tactic: 'Execution', technique: 'User Execution' },
  'Phishing': { tactic: 'Initial Access', technique: 'Phishing' },
  'Unauthorized Access': { tactic: 'Initial Access', technique: 'Valid Accounts' },
  'Data Exfiltration': { tactic: 'Exfiltration', technique: 'Exfiltration Over C2' },
  'Privilege Escalation': { tactic: 'Privilege Escalation', technique: 'Abuse Elevation Control' },
};

const MITREMatrix = React.memo(function MITREMatrix({ logs }: MITREMatrixProps) {
  const heatmapData = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};

    // Initialize counts
    tactics.forEach(tactic => {
      counts[tactic] = {};
      techniques[tactic]?.forEach(technique => {
        counts[tactic][technique] = 0;
      });
    });

    // Count logs per technique
    logs.forEach(log => {
      const mapping = attackTypeToTechnique[log.attackType];
      if (mapping && counts[mapping.tactic]?.[mapping.technique] !== undefined) {
        counts[mapping.tactic][mapping.technique]++;
      }
    });

    return counts;
  }, [logs]);

  const getMaxCount = () => {
    let max = 0;
    Object.values(heatmapData).forEach(tactic => {
      Object.values(tactic).forEach(count => {
        if (count > max) max = count;
      });
    });
    return max || 1;
  };

  const getColor = (count: number) => {
    const max = getMaxCount();
    const intensity = count / max;
    
    if (count === 0) return 'bg-gray-900/30';
    if (intensity < 0.25) return 'bg-red-900/40';
    if (intensity < 0.5) return 'bg-red-800/60';
    if (intensity < 0.75) return 'bg-red-700/80';
    return 'bg-red-600';
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          MITRE ATT&CK Matrix
        </h3>
        <div className="text-xs text-gray-500">
          {logs.length} events mapped
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${tactics.length}, 1fr)` }}>
            {tactics.map(tactic => (
              <div
                key={tactic}
                className="text-[10px] text-gray-500 text-center px-1 py-2 truncate"
                title={tactic}
              >
                {tactic.split(' ')[0]}
              </div>
            ))}
          </div>

          {/* Technique rows */}
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${tactics.length}, 1fr)` }}
              >
                {tactics.map(tactic => {
                  const technique = techniques[tactic]?.[rowIdx];
                  const count = technique ? heatmapData[tactic]?.[technique] || 0 : 0;

                  return (
                    <div
                      key={`${tactic}-${rowIdx}`}
                      className={`aspect-square rounded flex items-center justify-center relative group cursor-pointer transition-all hover:scale-105 ${getColor(count)}`}
                      title={technique ? `${technique}: ${count} events` : ''}
                    >
                      {technique && (
                        <>
                          <span className="text-[9px] text-gray-300 text-center px-1 truncate">
                            {technique.split(' ').slice(0, 2).join(' ')}
                          </span>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {technique}: {count}
                          </div>

                          {/* Glow effect for high counts */}
                          {count > getMaxCount() * 0.75 && (
                            <div className="absolute inset-0 rounded bg-red-500/20 blur-sm"></div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-900/30 rounded"></div>
          <span className="text-xs text-gray-500">No Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-900/40 rounded"></div>
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-700/80 rounded"></div>
          <span className="text-xs text-gray-500">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>
    </div>
  );
});

export default MITREMatrix;
