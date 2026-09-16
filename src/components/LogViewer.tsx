import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { Search, X, ChevronDown, ChevronUp, AlertCircle, Copy, ExternalLink, Eye, Ban } from 'lucide-react';
import { LogEntry, Severity, AttackType, LogStatus } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

const severityColors: Record<Severity, string> = {
  critical: 'text-amber-500',
  high: 'text-orange-500',
  medium: 'text-gray-300',
  low: 'text-gray-500',
  info: 'text-gray-600',
};

const statusColors: Record<LogStatus, string> = {
  active: 'text-red-400',
  blocked: 'text-gray-400',
  investigating: 'text-amber-400',
  resolved: 'text-gray-600',
};

interface ContextMenuState {
  x: number;
  y: number;
  log: LogEntry;
}

export default function LogViewer({ logs }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [attackFilter, setAttackFilter] = useState<AttackType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LogStatus | 'all'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [columnWidths, setColumnWidths] = useState({
    id: 90,
    timestamp: 130,
    sourceIP: 140,
    attackType: 130,
    severity: 80,
    status: 90,
    country: 50,
    firewall: 90,
  });
  const pageSize = 25;
  const searchRef = useRef<HTMLInputElement>(null);
  const resizingRef = useRef<{ col: keyof typeof columnWidths; startX: number; startWidth: number } | null>(null);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setContextMenu(null);
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // Column resize handlers
  const handleResizeStart = useCallback((col: keyof typeof columnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = { col, startX: e.clientX, startWidth: columnWidths[col] };

    const handleMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(40, resizingRef.current.startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [resizingRef.current!.col]: newWidth }));
    };

    const handleUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [columnWidths]);

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
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  const handleContextMenu = (e: React.MouseEvent, log: LogEntry) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, log });
  };

  const handleCopyRow = (log: LogEntry) => {
    const text = `${log.id} | ${log.sourceIP} | ${log.attackType} | ${log.severity} | ${log.description}`;
    navigator.clipboard.writeText(text);
    setContextMenu(null);
  };

  const handleBlockIP = (log: LogEntry) => {
    alert(`IP ${log.sourceIP} added to blocklist`);
    setContextMenu(null);
  };

  const activeFilters = [
    severityFilter !== 'all' && { label: `Severity: ${severityFilter}`, onRemove: () => setSeverityFilter('all') },
    attackFilter !== 'all' && { label: `Type: ${attackFilter}`, onRemove: () => setAttackFilter('all') },
    statusFilter !== 'all' && { label: `Status: ${statusFilter}`, onRemove: () => setStatusFilter('all') },
    searchTerm && { label: `Search: "${searchTerm}"`, onRemove: () => setSearchTerm('') },
  ].filter(Boolean) as { label: string; onRemove: () => void }[];

  const ColHeader = ({ label, width, sortKey, col }: { label: string; width: number; sortKey?: 'timestamp' | 'severity'; col: keyof typeof columnWidths }) => (
    <th
      className="relative px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider select-none"
      style={{ width, minWidth: width }}
    >
      <span
        className={sortKey ? 'cursor-pointer hover:text-gray-300 flex items-center gap-1' : ''}
        onClick={() => sortKey && toggleSort(sortKey)}
      >
        {label}
        {sortKey && sortField === sortKey && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
      <div
        className="resize-handle"
        onMouseDown={(e) => handleResizeStart(col, e)}
      />
    </th>
  );

  return (
    <div className="bg-[#0f1013] border border-[#22252b] rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="px-3 py-2 border-b border-[#22252b] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search logs... (press /)"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-12 py-1.5 bg-[#14161a] border border-[#22252b] rounded text-[12px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</kbd>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value as Severity | 'all'); setPage(1); }}
            className="px-2 py-1.5 bg-[#14161a] border border-[#22252b] rounded text-[12px] text-gray-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          <select
            value={attackFilter}
            onChange={(e) => { setAttackFilter(e.target.value as AttackType | 'all'); setPage(1); }}
            className="px-2 py-1.5 bg-[#14161a] border border-[#22252b] rounded text-[12px] text-gray-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
          >
            <option value="all">All Types</option>
            {(['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan', 'Malware', 'Phishing', 'Unauthorized Access', 'Data Exfiltration', 'Privilege Escalation'] as AttackType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as LogStatus | 'all'); setPage(1); }}
            className="px-2 py-1.5 bg-[#14161a] border border-[#22252b] rounded text-[12px] text-gray-300 focus:outline-none focus:border-amber-500/40 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Filters:</span>
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="filter-chip inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-400"
              >
                {f.label}
                <button onClick={f.onRemove} className="hover:text-amber-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setSeverityFilter('all'); setAttackFilter('all'); setStatusFilter('all'); setSearchTerm(''); }}
              className="text-[11px] text-gray-500 hover:text-gray-300 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="text-[11px] text-gray-600">
          {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full sticky-header" style={{ minWidth: 820 }}>
          <thead>
            <tr className="border-b border-[#22252b]">
              <ColHeader label="ID" width={columnWidths.id} col="id" />
              <ColHeader label="Timestamp" width={columnWidths.timestamp} sortKey="timestamp" col="timestamp" />
              <ColHeader label="Source" width={columnWidths.sourceIP} col="sourceIP" />
              <ColHeader label="Attack" width={columnWidths.attackType} col="attackType" />
              <ColHeader label="Severity" width={columnWidths.severity} sortKey="severity" col="severity" />
              <ColHeader label="Status" width={columnWidths.status} col="status" />
              <ColHeader label="CC" width={columnWidths.country} col="country" />
              <ColHeader label="Firewall" width={columnWidths.firewall} col="firewall" />
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <Fragment key={log.id}>
                <tr
                  className="log-row border-b border-[#1a1d23] cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  onContextMenu={(e) => handleContextMenu(e, log)}
                >
                  <td className="px-2 py-1.5 font-mono text-[11px] text-gray-500" style={{ width: columnWidths.id }}>
                    {log.id}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-[11px] text-gray-400" style={{ width: columnWidths.timestamp }}>
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-[11px] text-gray-300" style={{ width: columnWidths.sourceIP }}>
                    {log.sourceIP}
                    <span className="text-gray-700 ml-0.5">:{log.sourcePort}</span>
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-300" style={{ width: columnWidths.attackType }}>
                    {log.attackType}
                  </td>
                  <td className="px-2 py-1.5" style={{ width: columnWidths.severity }}>
                    <span className={`text-[11px] font-medium uppercase ${severityColors[log.severity]}`}>
                      {log.severity === 'critical' ? 'CRIT' : log.severity.slice(0, 4).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-1.5" style={{ width: columnWidths.status }}>
                    <span className={`text-[11px] ${statusColors[log.status]}`}>
                      {log.status === 'investigating' ? 'INV' : log.status.slice(0, 3).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-[11px] text-gray-500" style={{ width: columnWidths.country }}>
                    {log.country}
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-500" style={{ width: columnWidths.firewall }}>
                    {log.firewall}
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr className="bg-[#0c0d10]">
                    <td colSpan={8} className="px-3 py-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-[11px]">
                        <div>
                          <span className="text-gray-600 block mb-0.5">Description</span>
                          <span className="text-gray-300">{log.description}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-0.5">Destination</span>
                          <span className="text-gray-300 font-mono">{log.destinationIP}:{log.destinationPort} / {log.protocol}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-0.5">Signature</span>
                          <span className="text-gray-400 font-mono">{log.signature}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-0.5">Log ID</span>
                          <span className="text-gray-400 font-mono">{log.id}</span>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <span className="text-gray-600 block mb-0.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Payload
                          </span>
                          <div className="bg-[#0a0b0d] border border-[#1a1d23] rounded px-2 py-1.5 font-mono text-[11px] text-amber-500/80 break-all">
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
      <div className="px-3 py-2 border-t border-[#22252b] flex items-center justify-between text-[11px]">
        <div className="text-gray-500">
          Page {page} of {totalPages} · {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedLogs.length)} of {sortedLogs.length}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            «
          </button>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-6 h-6 rounded text-[11px] tabular-nums ${
                  page === pageNum
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1d23]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2 py-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            »
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu fixed z-50 bg-[#14161a] border border-[#2a2d35] rounded-md shadow-2xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCopyRow(contextMenu.log)}
            className="w-full px-3 py-1.5 text-left text-[12px] text-gray-300 hover:bg-[#1a1d23] flex items-center gap-2"
          >
            <Copy className="w-3 h-3" /> Copy row
          </button>
          <button
            onClick={() => { setExpandedRow(contextMenu.log.id); setContextMenu(null); }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-gray-300 hover:bg-[#1a1d23] flex items-center gap-2"
          >
            <Eye className="w-3 h-3" /> View details
          </button>
          <button
            onClick={() => handleBlockIP(contextMenu.log)}
            className="w-full px-3 py-1.5 text-left text-[12px] text-gray-300 hover:bg-[#1a1d23] flex items-center gap-2"
          >
            <Ban className="w-3 h-3" /> Block IP
          </button>
          <div className="border-t border-[#22252b] my-1"></div>
          <button
            onClick={() => {
              setSearchTerm(contextMenu.log.sourceIP);
              setPage(1);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-gray-300 hover:bg-[#1a1d23] flex items-center gap-2"
          >
            <Search className="w-3 h-3" /> Filter by this IP
          </button>
          <button
            onClick={() => { setContextMenu(null); }}
            className="w-full px-3 py-1.5 text-left text-[12px] text-gray-300 hover:bg-[#1a1d23] flex items-center gap-2"
          >
            <ExternalLink className="w-3 h-3" /> Open in SIEM
          </button>
        </div>
      )}
    </div>
  );
}
