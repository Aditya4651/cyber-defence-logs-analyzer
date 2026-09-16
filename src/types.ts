export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type LogStatus = 'active' | 'blocked' | 'investigating' | 'resolved';
export type AttackType = 
  | 'DDoS'
  | 'SQL Injection'
  | 'XSS'
  | 'Brute Force'
  | 'Port Scan'
  | 'Malware'
  | 'Phishing'
  | 'Unauthorized Access'
  | 'Data Exfiltration'
  | 'Privilege Escalation';

export interface LogEntry {
  id: string;
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  attackType: AttackType;
  severity: Severity;
  status: LogStatus;
  description: string;
  payload?: string;
  country: string;
  firewall: string;
  signature: string;
}

export interface ThreatSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  blocked: number;
  active: number;
}
