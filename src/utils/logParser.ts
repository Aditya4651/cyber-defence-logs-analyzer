// Log parser for different formats
export interface ParsedLog {
  id: string;
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  attackType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'blocked' | 'investigating' | 'resolved';
  description: string;
  payload: string;
  country: string;
  firewall: string;
  signature: string;
  raw: string;
}

// Parse JSON logs
export function parseJSONLog(line: string, index: number): ParsedLog | null {
  try {
    const log = JSON.parse(line);
    return {
      id: `LOG-${Date.now()}-${index}`,
      timestamp: log.timestamp || log['@timestamp'] || log.time || new Date().toISOString(),
      sourceIP: log.sourceIP || log.src_ip || log.source || log.clientip || '0.0.0.0',
      destinationIP: log.destinationIP || log.dst_ip || log.destination || '0.0.0.0',
      sourcePort: parseInt(log.sourcePort || log.src_port || log.sport || '0'),
      destinationPort: parseInt(log.destinationPort || log.dst_port || log.dport || log.port || '0'),
      protocol: log.protocol || log.proto || 'TCP',
      attackType: log.attackType || log.attack_type || log.type || log.event_type || 'Unknown',
      severity: mapSeverity(log.severity || log.level || log.priority || 'info'),
      status: mapStatus(log.status || log.action || 'active'),
      description: log.description || log.message || log.msg || 'Log entry',
      payload: JSON.stringify(log),
      country: log.country || log.src_country || 'US',
      firewall: log.firewall || log.device || log.source_name || 'Unknown',
      signature: log.signature || log.rule || log.sig_id || `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      raw: line,
    };
  } catch {
    return null;
  }
}

// Parse Syslog format
export function parseSyslogLog(line: string, index: number): ParsedLog | null {
  // Example: <134>1 2024-01-15T10:30:00Z firewall01 - - - - action=allow src=192.168.1.100 dst=10.0.0.1
  const syslogRegex = /^<(\d+)>(\d+)\s+(\S+)\s+(\S+)\s+(.*)$/;
  const match = line.match(syslogRegex);
  
  if (match) {
    const [, , , timestamp, host, message] = match;
    const kvPairs = extractKeyValuePairs(message);
    
    return {
      id: `LOG-${Date.now()}-${index}`,
      timestamp: timestamp || new Date().toISOString(),
      sourceIP: kvPairs.src || kvPairs.source || kvPairs.src_ip || '0.0.0.0',
      destinationIP: kvPairs.dst || kvPairs.destination || kvPairs.dst_ip || '0.0.0.0',
      sourcePort: parseInt(kvPairs.sport || kvPairs.src_port || '0'),
      destinationPort: parseInt(kvPairs.dport || kvPairs.dst_port || kvPairs.port || '0'),
      protocol: kvPairs.proto || kvPairs.protocol || 'TCP',
      attackType: kvPairs.action || kvPairs.type || 'Unknown',
      severity: mapSeverity(kvPairs.severity || kvPairs.level || 'info'),
      status: mapStatus(kvPairs.status || kvPairs.action || 'active'),
      description: message.substring(0, 100),
      payload: line,
      country: kvPairs.country || 'US',
      firewall: host || 'Unknown',
      signature: kvPairs.signature || kvPairs.rule || `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      raw: line,
    };
  }
  
  return null;
}

// Parse Apache/Nginx combined log format
export function parseWebServerLog(line: string, index: number): ParsedLog | null {
  // Example: 192.168.1.100 - jdoe [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1234
  const apacheRegex = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d+)\s+(\d+)/;
  const match = line.match(apacheRegex);
  
  if (match) {
    const [, sourceIP, timestamp, request, statusCode, size] = match;
    const [method, path] = request.split(' ');
    
    return {
      id: `LOG-${Date.now()}-${index}`,
      timestamp: parseApacheTimestamp(timestamp),
      sourceIP: sourceIP,
      destinationIP: '0.0.0.0',
      sourcePort: Math.floor(Math.random() * 65535),
      destinationPort: 80,
      protocol: 'HTTP',
      attackType: detectWebAttack(parseInt(statusCode), path),
      severity: mapHTTPSeverity(parseInt(statusCode)),
      status: parseInt(statusCode) >= 400 ? 'active' : 'resolved',
      description: `${method} ${path} - ${statusCode}`,
      payload: line,
      country: 'US',
      firewall: 'Web Server',
      signature: `HTTP-${statusCode}`,
      raw: line,
    };
  }
  
  return null;
}

// Parse CSV logs
export function parseCSVLog(line: string, index: number, headers: string[]): ParsedLog | null {
  const values = line.split(',').map(v => v.trim());
  const log: any = {};
  
  headers.forEach((header, i) => {
    log[header.toLowerCase()] = values[i];
  });
  
  return {
    id: `LOG-${Date.now()}-${index}`,
    timestamp: log.timestamp || log.time || log.date || new Date().toISOString(),
    sourceIP: log.sourceip || log.src_ip || log.source || '0.0.0.0',
    destinationIP: log.destinationip || log.dst_ip || log.destination || '0.0.0.0',
    sourcePort: parseInt(log.sourceport || log.src_port || '0'),
    destinationPort: parseInt(log.destinationport || log.dst_port || '0'),
    protocol: log.protocol || 'TCP',
    attackType: log.attacktype || log.type || 'Unknown',
    severity: mapSeverity(log.severity || log.level || 'info'),
    status: mapStatus(log.status || 'active'),
    description: log.description || log.message || 'Log entry',
    payload: line,
    country: log.country || 'US',
    firewall: log.firewall || 'Unknown',
    signature: log.signature || `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    raw: line,
  };
}

// Helper functions
function extractKeyValuePairs(text: string): Record<string, string> {
  const pairs: Record<string, string> = {};
  const regex = /(\w+)=(?:"([^"]+)"|(\S+))/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    pairs[match[1]] = match[2] || match[3];
  }
  
  return pairs;
}

function parseApacheTimestamp(ts: string): string {
  // Convert "15/Jan/2024:10:30:00 +0000" to ISO format
  try {
    const date = new Date(ts);
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function mapSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  const s = severity.toLowerCase();
  if (s.includes('crit') || s === '0' || s === '1') return 'critical';
  if (s.includes('high') || s.includes('err') || s === '2' || s === '3') return 'high';
  if (s.includes('med') || s.includes('warn') || s === '4') return 'medium';
  if (s.includes('low') || s === '5' || s === '6') return 'low';
  return 'info';
}

function mapStatus(status: string): 'active' | 'blocked' | 'investigating' | 'resolved' {
  const s = status.toLowerCase();
  if (s.includes('block') || s.includes('deny') || s.includes('drop')) return 'blocked';
  if (s.includes('investigat')) return 'investigating';
  if (s.includes('resolve') || s.includes('allow') || s.includes('accept')) return 'resolved';
  return 'active';
}

function detectWebAttack(statusCode: number, path: string): string {
  if (statusCode === 401 || statusCode === 403) return 'Unauthorized Access';
  if (statusCode === 404) return 'Port Scan';
  if (path.includes('admin') || path.includes('login')) return 'Brute Force';
  if (path.includes('.php') || path.includes('.asp')) return 'SQL Injection';
  if (path.includes('<script>') || path.includes('javascript:')) return 'XSS';
  return 'Web Request';
}

function mapHTTPSeverity(statusCode: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  if (statusCode >= 500) return 'high';
  if (statusCode === 401 || statusCode === 403) return 'medium';
  if (statusCode === 404) return 'low';
  return 'info';
}

// Auto-detect format and parse
export function parseLogFile(content: string): ParsedLog[] {
  const lines = content.split('\n').filter(line => line.trim());
  const logs: ParsedLog[] = [];
  
  // Try to detect format
  const firstLine = lines[0];
  let format: 'json' | 'syslog' | 'apache' | 'csv' | 'unknown' = 'unknown';
  let csvHeaders: string[] = [];
  
  if (firstLine.startsWith('{')) {
    format = 'json';
  } else if (firstLine.startsWith('<')) {
    format = 'syslog';
  } else if (/^\d+\.\d+\.\d+\.\d+.*\[.*\]/.test(firstLine)) {
    format = 'apache';
  } else if (firstLine.includes(',') && !firstLine.startsWith('{')) {
    format = 'csv';
    csvHeaders = firstLine.split(',').map(h => h.trim().toLowerCase());
  }
  
  lines.forEach((line, index) => {
    if (format === 'csv' && index === 0) return; // Skip CSV header
    
    let log: ParsedLog | null = null;
    
    switch (format) {
      case 'json':
        log = parseJSONLog(line, index);
        break;
      case 'syslog':
        log = parseSyslogLog(line, index);
        break;
      case 'apache':
        log = parseWebServerLog(line, index);
        break;
      case 'csv':
        log = parseCSVLog(line, index, csvHeaders);
        break;
      default:
        // Try all parsers
        log = parseJSONLog(line, index) || parseSyslogLog(line, index) || parseWebServerLog(line, index);
    }
    
    if (log) {
      logs.push(log);
    }
  });
  
  return logs;
}
