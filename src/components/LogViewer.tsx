import { useState, Fragment } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LogEntry, Severity, AttackType, LogStatus } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

const severityColors: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const statusColors: Record<LogStatus, string> = {
  active: 'bg-red-500/20 text-red-400',
  blocked: 'bg-green-500/20 text-green-400',
  investigating: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-gray-500/20 text-gray-400',
};

export default function LogViewer({ logs }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [attackFilter, setAttackFilter] = useState<AttackType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LogStatus | 'all'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchTerm === '' ||
      log.sourceIP.includes(searchTerm) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.attackType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.signature.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAttack = attackFilter === 'all' || log.attackType === attackFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesAttack && matchesStatus;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortField === 'timestamp') {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortDir === 'asc' ? diff : -diff;
    }
    const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
    const diff = severityOrder[a.severity] - severityOrder[b.severity];
    return sortDir === 'asc' ? diff : -diff;
  });

  const totalPages = Math.ceil(sortedLogs.length / pageSize);
  const paginatedLogs = sortedLogs.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: 'timestamp' | 'severity') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by IP, description, attack type, ID, signature..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value as Severity | 'all'); setPage(1); }}
                className="pl-8 pr-8 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
            <select
              value={attackFilter}
              onChange={(e) => { setAttackFilter(e.target.value as AttackType | 'all'); setPage(1); }}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {(['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan', 'Malware', 'Phishing', 'Unauthorized Access', 'Data Exfiltration', 'Privilege Escalation'] as AttackType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as LogStatus | 'all'); setPage(1); }}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Showing {paginatedLogs.length} of {filteredLogs.length} entries
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/30">
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">ID</th>
              <th
                className="text-left px-4 py-3 text-gray-400 font-medium text-xs cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => toggleSort('timestamp')}
              >
                <span className="flex items-center gap-1">
                  Timestamp
                  {sortField === 'timestamp' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </span>
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Source IP</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Attack Type</th>
              <th
                className="text-left px-4 py-3 text-gray-400 font-medium text-xs cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => toggleSort('severity')}
              >
                <span className="flex items-center gap-1">
                  Severity
                  {sortField === 'severity' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </span>
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Country</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Firewall</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <Fragment key={log.id}>
                <tr
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-cyan-400">{log.id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{formatTime(log.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-300">{log.sourceIP}</span>
                    <span className="text-gray-600 text-xs ml-1">:{log.sourcePort}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-200">{log.attackType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${severityColors[log.severity]}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 font-mono">{log.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{log.firewall}</span>
                  </td>
                  <td className="px-4 py-3">
                    {expandedRow === log.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr className="bg-gray-800/20">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500 block mb-1">Description</span>
                          <span className="text-gray-300">{log.description}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Destination</span>
                          <span className="text-gray-300 font-mono">{log.destinationIP}:{log.destinationPort} ({log.protocol})</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Signature</span>
                          <span className="text-cyan-400 font-mono">{log.signature}</span>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <span className="text-gray-500 block mb-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Payload / Evidence
                          </span>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-red-300/80 break-all">
                            {log.payload}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
