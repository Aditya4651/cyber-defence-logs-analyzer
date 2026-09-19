import {
  Shield,
  Network,
  Globe,
  Server,
  Database,
  Cloud,
  Monitor,
  Activity,
  Mail,
  Lock,
  Key,
  Code,
  AlertTriangle,
  Eye,
  Zap,
  HardDrive,
} from 'lucide-react';

export interface LogSourceTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  defaultPort?: number;
  defaultProtocol?: string;
  sampleFormat: string;
  color: string;
}

export const LOG_SOURCE_TYPES: LogSourceTypeConfig[] = [
  // Security Category
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'Palo Alto, Fortinet, Cisco ASA, Check Point',
    icon: Shield,
    category: 'security',
    defaultPort: 514,
    defaultProtocol: 'UDP/Syslog',
    sampleFormat: '<134>1 2024-01-15T10:30:00Z firewall01 - - - - action=allow src=192.168.1.100 dst=10.0.0.1 proto=TCP dport=443',
    color: '#ef4444',
  },
  {
    id: 'ids_ips',
    name: 'IDS/IPS',
    description: 'Snort, Suricata, Cisco Firepower',
    icon: Eye,
    category: 'security',
    defaultPort: 514,
    defaultProtocol: 'UDP/Syslog',
    sampleFormat: '[**] [1:2001219:20] ET POLICY [**] {TCP} 192.168.1.100:54321 -> 10.0.0.1:80',
    color: '#f97316',
  },
  {
    id: 'authentication',
    name: 'Authentication',
    description: 'LDAP, RADIUS, Active Directory, Okta',
    icon: Key,
    category: 'security',
    defaultPort: 636,
    defaultProtocol: 'LDAPS',
    sampleFormat: '2024-01-15T10:30:00Z AUTH: user=jdoe action=login status=success src_ip=192.168.1.100 method=password',
    color: '#eab308',
  },

  // Network Category
  {
    id: 'network',
    name: 'Network Flow',
    description: 'NetFlow, sFlow, IPFIX, packet captures',
    icon: Network,
    category: 'network',
    defaultPort: 2055,
    defaultProtocol: 'UDP/NetFlow',
    sampleFormat: '2024-01-15T10:30:00Z FLOW: src=192.168.1.100 dst=8.8.8.8 proto=UDP sport=54321 dport=53 bytes=128 packets=2',
    color: '#06b6d4',
  },
  {
    id: 'vpn',
    name: 'VPN',
    description: 'OpenVPN, WireGuard, Cisco AnyConnect',
    icon: Lock,
    category: 'network',
    defaultPort: 1194,
    defaultProtocol: 'UDP',
    sampleFormat: '2024-01-15T10:30:00Z VPN: user=jdoe action=connect src_ip=203.0.113.50 assigned_ip=10.8.0.100 duration=3600',
    color: '#8b5cf6',
  },
  {
    id: 'dns',
    name: 'DNS',
    description: 'BIND, PowerDNS, DNS query logs',
    icon: Globe,
    category: 'network',
    defaultPort: 53,
    defaultProtocol: 'UDP/TCP',
    sampleFormat: '15-Jan-2024 10:30:00.123 queries: client 192.168.1.100#54321: query: example.com IN A +',
    color: '#ec4899',
  },

  // Application Category
  {
    id: 'web_server',
    name: 'Web Server',
    description: 'Apache, Nginx, IIS, Tomcat',
    icon: Globe,
    category: 'application',
    defaultPort: 80,
    defaultProtocol: 'HTTP/HTTPS',
    sampleFormat: '192.168.1.100 - jdoe [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0"',
    color: '#10b981',
  },
  {
    id: 'application',
    name: 'Application',
    description: 'Custom apps, microservices, APIs',
    icon: Code,
    category: 'application',
    defaultPort: 8080,
    defaultProtocol: 'HTTP/JSON',
    sampleFormat: '{"timestamp":"2024-01-15T10:30:00Z","level":"INFO","service":"auth-api","message":"User login","user_id":"u123","ip":"192.168.1.100"}',
    color: '#3b82f6',
  },
  {
    id: 'database',
    name: 'Database',
    description: 'MySQL, PostgreSQL, MongoDB, Oracle',
    icon: Database,
    category: 'application',
    defaultPort: 3306,
    defaultProtocol: 'TCP',
    sampleFormat: '2024-01-15T10:30:00.123456Z 12345 [Note] Access granted for user \'app_user\'@\'192.168.1.100\' (using password: YES)',
    color: '#f59e0b',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'SMTP, Exchange, Gmail, Office 365',
    icon: Mail,
    category: 'application',
    defaultPort: 25,
    defaultProtocol: 'SMTP',
    sampleFormat: '2024-01-15T10:30:00Z postfix/smtp[12345]: ABC123: to=<user@example.com>, relay=mail.example.com[10.0.0.1]:25, status=sent',
    color: '#6366f1',
  },

  // Cloud Category
  {
    id: 'cloud',
    name: 'Cloud Platform',
    description: 'AWS CloudTrail, Azure Monitor, GCP Logging',
    icon: Cloud,
    category: 'cloud',
    defaultPort: 443,
    defaultProtocol: 'HTTPS/JSON',
    sampleFormat: '{"eventTime":"2024-01-15T10:30:00Z","eventName":"ConsoleLogin","userIdentity":{"type":"IAMUser"},"sourceIPAddress":"203.0.113.50"}',
    color: '#0ea5e9',
  },
  {
    id: 'serverless',
    name: 'Serverless',
    description: 'AWS Lambda, Azure Functions, Cloudflare Workers',
    icon: Zap,
    category: 'cloud',
    defaultPort: 443,
    defaultProtocol: 'HTTPS',
    sampleFormat: '2024-01-15T10:30:00.123Z INFO RequestId: abc-123 Duration: 45.23 ms Billed Duration: 46 ms Memory Size: 128 MB Max Memory Used: 64 MB',
    color: '#84cc16',
  },

  // Endpoint Category
  {
    id: 'endpoint',
    name: 'Endpoint',
    description: 'Windows Event, Sysmon, osquery, EDR',
    icon: Monitor,
    category: 'endpoint',
    defaultPort: 514,
    defaultProtocol: 'Syslog/JSON',
    sampleFormat: '<134>1 2024-01-15T10:30:00Z WORKSTATION01 Microsoft-Windows-Sysmon 12345 - - - EventID: 1 RuleName: technique_id=T1059',
    color: '#14b8a6',
  },
  {
    id: 'antivirus',
    name: 'Antivirus/EDR',
    description: 'CrowdStrike, Carbon Black, Defender, SentinelOne',
    icon: Shield,
    category: 'endpoint',
    defaultPort: 443,
    defaultProtocol: 'HTTPS/JSON',
    sampleFormat: '{"timestamp":"2024-01-15T10:30:00Z","hostname":"WORKSTATION01","threat_name":"Trojan.Generic","action_taken":"quarantined","file_path":"C:\\malware.exe"}',
    color: '#dc2626',
  },

  // Infrastructure Category
  {
    id: 'load_balancer',
    name: 'Load Balancer',
    description: 'HAProxy, NGINX Plus, AWS ALB, F5',
    icon: Activity,
    category: 'infrastructure',
    defaultPort: 443,
    defaultProtocol: 'HTTPS',
    sampleFormat: '192.168.1.100:54321 [15/Jan/2024:10:30:00] backend_web 0/0/1/5/6 200 1234 - - ---- 50/50/0/0/0 0/0 "GET /api HTTP/1.1"',
    color: '#a855f7',
  },
  {
    id: 'container',
    name: 'Container/K8s',
    description: 'Docker, Kubernetes, containerd logs',
    icon: HardDrive,
    category: 'infrastructure',
    defaultPort: 10250,
    defaultProtocol: 'HTTPS/JSON',
    sampleFormat: '2024-01-15T10:30:00.123456789Z stdout F {"level":"info","ts":"2024-01-15T10:30:00Z","msg":"Request processed","duration":"45ms"}',
    color: '#0891b2',
  },
  {
    id: 'custom',
    name: 'Custom Source',
    description: 'Any custom log format or proprietary system',
    icon: Code,
    category: 'infrastructure',
    defaultPort: 514,
    defaultProtocol: 'Syslog/Custom',
    sampleFormat: '2024-01-15T10:30:00Z [CUSTOM] level=INFO msg="Custom log entry" data={...}',
    color: '#64748b',
  },
];

export const LOG_SOURCE_CATEGORIES = [
  { id: 'security', name: 'Security', icon: Shield, color: '#ef4444' },
  { id: 'network', name: 'Network', icon: Network, color: '#06b6d4' },
  { id: 'application', name: 'Application', icon: Code, color: '#10b981' },
  { id: 'cloud', name: 'Cloud', icon: Cloud, color: '#0ea5e9' },
  { id: 'endpoint', name: 'Endpoint', icon: Monitor, color: '#14b8a6' },
  { id: 'infrastructure', name: 'Infrastructure', icon: Server, color: '#a855f7' },
];

export function getLogSourceTypeById(id: string): LogSourceTypeConfig | undefined {
  return LOG_SOURCE_TYPES.find(type => type.id === id);
}

export function getLogSourceTypesByCategory(category: string): LogSourceTypeConfig[] {
  return LOG_SOURCE_TYPES.filter(type => type.category === category);
}
