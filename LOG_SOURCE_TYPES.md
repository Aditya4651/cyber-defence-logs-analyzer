# 📡 Log Source Types - Complete Implementation

## 🎯 What Was Added

Maine aapke **Log Sources** feature ko completely overhaul kar diya hai! Ab aap **17 different log source types** choose kar sakte ho, organized into **6 categories**.

---

## 📋 Available Log Source Types

### 🔒 Security Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Firewall** | Palo Alto, Fortinet, Cisco ASA, Check Point | 514 | UDP/Syslog |
| **IDS/IPS** | Snort, Suricata, Cisco Firepower | 514 | UDP/Syslog |
| **Authentication** | LDAP, RADIUS, Active Directory, Okta | 636 | LDAPS |

### 🌐 Network Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Network Flow** | NetFlow, sFlow, IPFIX, packet captures | 2055 | UDP/NetFlow |
| **VPN** | OpenVPN, WireGuard, Cisco AnyConnect | 1194 | UDP |
| **DNS** | BIND, PowerDNS, DNS query logs | 53 | UDP/TCP |

### 💻 Application Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Web Server** | Apache, Nginx, IIS, Tomcat | 80 | HTTP/HTTPS |
| **Application** | Custom apps, microservices, APIs | 8080 | HTTP/JSON |
| **Database** | MySQL, PostgreSQL, MongoDB, Oracle | 3306 | TCP |
| **Email** | SMTP, Exchange, Gmail, Office 365 | 25 | SMTP |

### ☁️ Cloud Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Cloud Platform** | AWS CloudTrail, Azure Monitor, GCP Logging | 443 | HTTPS/JSON |
| **Serverless** | AWS Lambda, Azure Functions, Cloudflare Workers | 443 | HTTPS |

### 🖥️ Endpoint Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Endpoint** | Windows Event, Sysmon, osquery, EDR | 514 | Syslog/JSON |
| **Antivirus/EDR** | CrowdStrike, Carbon Black, Defender, SentinelOne | 443 | HTTPS/JSON |

### 🏗️ Infrastructure Category
| Type | Description | Default Port | Protocol |
|------|-------------|--------------|----------|
| **Load Balancer** | HAProxy, NGINX Plus, AWS ALB, F5 | 443 | HTTPS |
| **Container/K8s** | Docker, Kubernetes, containerd logs | 10250 | HTTPS/JSON |
| **Custom Source** | Any custom log format or proprietary system | 514 | Syslog/Custom |

---

## 🎨 New UI Features

### 1. **Type Selector Modal**
- Full-screen modal with search functionality
- Category filter tabs (All, Security, Network, etc.)
- Grid view with icons and descriptions
- Default port/protocol shown for each type
- Hover effects with cyan accent

### 2. **Type-Specific Configuration**
When you select a type, the form auto-populates:
- **Default port** for that source type
- **Default protocol** (Syslog, HTTPS, etc.)
- **Sample log format** so you know what to expect
- **Icon** and **color** for visual identification

### 3. **Enhanced Source Cards**
Each configured source now shows:
- **Type icon** with brand color
- **Category badge**
- **Configuration details** (port, protocol, endpoint)
- **API key** with copy/regenerate buttons
- **Stats** (logs today, size, last ingest)

---

## 🚀 How To Use

### Adding a New Log Source

1. Click **"Add Source"** button
2. **Browse types** in the modal:
   - Use search to filter
   - Click category tabs to filter by type
3. **Select a type** (e.g., "Firewall")
4. **Configure the source**:
   - Enter a name (e.g., "Palo Alto - Production")
   - Optionally add description
   - Configure port/protocol/endpoint
   - Review sample format
5. Click **"Create Source"**
6. Copy the generated API key

### Filtering Sources
- Use the **category filter tabs** to see specific types
- Use **search** to find by name or description
- All 17 types are always accessible

---

## 📊 Data Structure

### LogSource Interface
```typescript
interface LogSource {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: LogSourceType;      // 'firewall' | 'ids_ips' | 'web_server' | ...
  category: LogSourceCategory;  // 'security' | 'network' | 'application' | ...
  apiKey: string;
  enabled: boolean;
  createdAt: string;
  config?: {
    endpoint?: string;
    port?: number;
    protocol?: string;
    format?: string;
  };
  stats: {
    logsToday: number;
    sizeToday: string;
    lastIngest?: string;
  };
}
```

### Type Configuration
```typescript
interface LogSourceTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: any;              // Lucide icon component
  category: string;
  defaultPort?: number;
  defaultProtocol?: string;
  sampleFormat: string;   // Example log format
  color: string;          // Brand color
}
```

---

## 🎨 Visual Design

### Type Icons & Colors
Each type has:
- **Unique icon** from Lucide library
- **Brand color** for visual identification
- **Consistent styling** across the app

### Example Colors:
- 🔴 Firewall: `#ef4444` (Red)
- 🟠 IDS/IPS: `#f97316` (Orange)
- 🟡 Authentication: `#eab308` (Yellow)
- 🔵 Network Flow: `#06b6d4` (Cyan)
- 🟣 VPN: `#8b5cf6` (Purple)
- 🟢 Web Server: `#10b981` (Green)
- 🔵 Cloud: `#0ea5e9` (Sky Blue)
- 🟢 Endpoint: `#14b8a6` (Teal)

---

## 💡 Pro Tips

### For Security Teams
1. **Start with Firewall + IDS/IPS** - Most common security logs
2. **Add Authentication logs** - Track login attempts
3. **Include Endpoint logs** - Monitor workstations
4. **Use Cloud sources** - For cloud infrastructure

### For DevOps Teams
1. **Web Server logs** - Monitor HTTP traffic
2. **Application logs** - Track app errors
3. **Container/K8s logs** - For microservices
4. **Load Balancer logs** - Track traffic distribution

### Best Practices
1. **Use descriptive names**: "Firewall - US-East-Prod"
2. **Add descriptions**: Document what each source monitors
3. **Configure endpoints**: Use hostnames instead of IPs when possible
4. **Monitor stats**: Check logs today to ensure ingestion is working

---

## 🔧 Technical Implementation

### Files Modified
- `src/store/appStore.ts` - Added new type definitions
- `src/components/LogSources.tsx` - Complete rewrite with type selector
- `src/data/logSourceTypes.ts` - New file with type catalog

### New Functions
```typescript
// Get type config by ID
getLogSourceTypeById(id: string): LogSourceTypeConfig | undefined

// Get types by category
getLogSourceTypesByCategory(category: string): LogSourceTypeConfig[]
```

### Store Updates
```typescript
// New action
updateLogSource: (id: string, updates: Partial<LogSource>) => void
```

---

## 📈 Sample Log Formats

### Firewall
```
<134>1 2024-01-15T10:30:00Z firewall01 - - - - action=allow src=192.168.1.100 dst=10.0.0.1 proto=TCP dport=443
```

### IDS/IPS
```
[**] [1:2001219:20] ET POLICY [**] {TCP} 192.168.1.100:54321 -> 10.0.0.1:80
```

### Web Server (Apache)
```
192.168.1.100 - jdoe [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1234
```

### Cloud (AWS CloudTrail)
```json
{
  "eventTime": "2024-01-15T10:30:00Z",
  "eventName": "ConsoleLogin",
  "userIdentity": {"type": "IAMUser"},
  "sourceIPAddress": "203.0.113.50"
}
```

---

## 🎉 Summary

**Before:**
- 3 basic types (API, Upload, Webhook)
- Simple form with minimal configuration
- No visual distinction between source types

**After:**
- ✅ 17 comprehensive log source types
- ✅ 6 organized categories
- ✅ Visual type selector with search
- ✅ Type-specific configuration
- ✅ Sample log formats
- ✅ Icon + color coding
- ✅ Enhanced source cards
- ✅ Professional SOC platform feel

---

**Ab aapke paas ek enterprise-grade log source management system hai! 🚀**

Koi bhi specific source type add karna ho ya customize karna ho, bas batao! 💪
