# 📦 Pre-Seeded Log Sources

## ✅ What Was Added

Maine system mein **8 pre-configured log sources** add kar diye hain taaki UI mein data dikhe aur aap turant test kar sako!

---

## 📋 Available Log Sources (8 Total)

### 🔒 Security Category (3 Sources)

#### 1. **Palo Alto - Production**
- **Type:** Firewall
- **Description:** Main production firewall - US East
- **Endpoint:** fw-prod-us-east-01.example.com
- **Port:** 514
- **Protocol:** UDP/Syslog
- **Status:** ✅ Active
- **Stats:** 45,230 logs today · 128 MB
- **Last Ingest:** 2 minutes ago

#### 2. **Suricata IDS - DMZ**
- **Type:** IDS/IPS
- **Description:** Intrusion detection system for DMZ network
- **Endpoint:** ids-dmz-01.example.com
- **Port:** 514
- **Protocol:** UDP/Syslog
- **Format:** EVE JSON
- **Status:** ✅ Active
- **Stats:** 12,847 logs today · 45 MB
- **Last Ingest:** 5 minutes ago

#### 3. **Okta - SSO Authentication**
- **Type:** Authentication
- **Description:** Single sign-on authentication logs
- **Endpoint:** company.okta.com
- **Port:** 443
- **Protocol:** HTTPS/JSON
- **Status:** ✅ Active
- **Stats:** 3,421 logs today · 12 MB
- **Last Ingest:** 8 minutes ago

### 💻 Application Category (2 Sources)

#### 4. **Nginx - Production API**
- **Type:** Web Server
- **Description:** Main API gateway - all regions
- **Endpoint:** api.example.com
- **Port:** 443
- **Protocol:** HTTPS
- **Format:** Combined
- **Status:** ✅ Active
- **Stats:** 234,567 logs today · 1.2 GB
- **Last Ingest:** 30 seconds ago

#### 5. **PostgreSQL - Production DB**
- **Type:** Database
- **Description:** Database query and connection logs
- **Endpoint:** db-prod.example.com
- **Port:** 5432
- **Protocol:** TCP
- **Status:** ❌ Disabled
- **Stats:** 0 logs today · 0 B
- **Last Ingest:** Never

### ☁️ Cloud Category (1 Source)

#### 6. **AWS CloudTrail - Production**
- **Type:** Cloud Platform
- **Description:** AWS API activity logs
- **Endpoint:** cloudtrail.s3.amazonaws.com
- **Port:** 443
- **Protocol:** HTTPS/JSON
- **Status:** ✅ Active
- **Stats:** 8,923 logs today · 67 MB
- **Last Ingest:** 15 minutes ago

### 🖥️ Endpoint Category (1 Source)

#### 7. **Microsoft Defender - Endpoints**
- **Type:** Antivirus/EDR
- **Description:** Endpoint protection and EDR logs
- **Endpoint:** security.microsoft.com
- **Port:** 443
- **Protocol:** HTTPS/JSON
- **Status:** ✅ Active
- **Stats:** 15,678 logs today · 89 MB
- **Last Ingest:** 12 minutes ago

### 🏗️ Infrastructure Category (1 Source)

#### 8. **Kubernetes - Production Cluster**
- **Type:** Container/K8s
- **Description:** K8s cluster logs - all namespaces
- **Endpoint:** k8s-prod.example.com:10250
- **Port:** 10250
- **Protocol:** HTTPS/JSON
- **Status:** ✅ Active
- **Stats:** 567,890 logs today · 2.3 GB
- **Last Ingest:** 1 minute ago

---

## 📊 Summary Statistics

### By Category
- 🔒 **Security:** 3 sources (Firewall, IDS/IPS, Auth)
- 💻 **Application:** 2 sources (Web Server, Database)
- ☁️ **Cloud:** 1 source (AWS CloudTrail)
- 🖥️ **Endpoint:** 1 source (Microsoft Defender)
- 🏗️ **Infrastructure:** 1 source (Kubernetes)

### By Status
- ✅ **Active:** 7 sources
- ❌ **Disabled:** 1 source (PostgreSQL)

### Total Volume
- **Total Logs Today:** 888,556 logs
- **Total Size Today:** ~3.9 GB
- **Average Last Ingest:** < 15 minutes ago

---

## 🎯 What You Can Do Now

### 1. **View Log Sources**
Go to **Settings** tab → Scroll to **Log Sources** section
- See all 8 sources grouped by category
- View icons, colors, and configurations
- Check stats and last ingest times

### 2. **Ingest Logs**
Go to **Settings** → **Log Ingestion**
- Select any source from the visual selector
- Upload a file, paste logs, or use API
- See logs get ingested with the selected source

### 3. **Test Features**
- **Log Explorer:** Search and filter logs
- **Alert Rules:** Create alerts for specific sources
- **Saved Searches:** Save queries for quick access
- **Service Status:** Monitor usage and limits

### 4. **Manage Sources**
- **Enable/Disable:** Toggle sources on/off
- **Edit:** Update configurations
- **Delete:** Remove sources
- **Regenerate API Keys:** Create new keys

---

## 🔧 Technical Details

### Data Structure
```typescript
interface LogSource {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: LogSourceType;
  category: LogSourceCategory;
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

### Seed Data Location
- **File:** `src/store/appStore.ts`
- **Location:** Initial state of `logSources` array
- **Trigger:** App loads with pre-seeded data
- **Persistence:** Data persists in localStorage

### API Keys
Each source has a unique API key:
```
csk_fw_prod_xxxxxx
csk_ids_dmz_xxxxxx
csk_nginx_prod_xxxxxx
csk_aws_ct_xxxxxx
csk_okta_sso_xxxxxx
csk_k8s_prod_xxxxxx
csk_defender_xxxxxx
csk_pg_prod_xxxxxx
```

---

## 💡 Use Cases

### For Testing
1. **Log Ingestion:** Upload files to different sources
2. **Search & Filter:** Test queries across multiple sources
3. **Alert Rules:** Create rules for specific sources
4. **Dashboard:** See data from all sources

### For Demo
1. **Show variety:** 8 different source types
2. **Real-world examples:** Palo Alto, Nginx, AWS, etc.
3. **Active monitoring:** Stats show recent activity
4. **Professional look:** Icons, colors, configurations

### For Development
1. **Quick start:** No need to manually create sources
2. **Test features:** All features work immediately
3. **Realistic data:** Stats and timestamps are dynamic
4. **Easy reset:** Clear localStorage to reset

---

## 🎨 Visual Display

### Log Sources Section
```
┌─────────────────────────────────────────────┐
│ Log Sources (8 configured)                  │
├─────────────────────────────────────────────┤
│ 🔒 Security (3)                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🛡️ Palo Alto - Production               │ │
│ │    Firewall · :514 · UDP/Syslog         │ │
│ │    45,230 logs · 128 MB · 2 min ago     │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 👁️ Suricata IDS - DMZ                  │ │
│ │    IDS/IPS · :514 · UDP/Syslog          │ │
│ │    12,847 logs · 45 MB · 5 min ago      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔑 Okta - SSO Authentication            │ │
│ │    Auth · :443 · HTTPS/JSON             │ │
│ │    3,421 logs · 12 MB · 8 min ago       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 💻 Application (2)                          │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Log Ingestion Selector
```
┌─────────────────────────────────────────────┐
│ Select Log Source                           │
├─────────────────────────────────────────────┤
│ 🔒 Security (3)                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🛡️ Palo Alto - Production               │ │
│ │    Firewall · :514 · UDP/Syslog         │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 👁️ Suricata IDS - DMZ                  │ │
│ │    IDS/IPS · :514 · UDP/Syslog          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 💻 Application (2)                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 🌐 Nginx - Production API               │ │
│ │    Web Server · :443 · HTTPS            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ✓ Selected: Palo Alto - Production          │
└─────────────────────────────────────────────┘
```

---

## 🔄 Dynamic Stats

The `lastIngest` timestamps are **dynamically calculated** relative to current time:
- Palo Alto: `Date.now() - 2 minutes`
- Suricata: `Date.now() - 5 minutes`
- Okta: `Date.now() - 8 minutes`
- Nginx: `Date.now() - 30 seconds`
- AWS CloudTrail: `Date.now() - 15 minutes`
- Defender: `Date.now() - 12 minutes`
- Kubernetes: `Date.now() - 1 minute`
- PostgreSQL: `undefined` (never ingested)

This makes the UI feel **alive and realistic**!

---

## 🚀 Next Steps

### To Add More Sources
1. Go to **Settings → Log Sources**
2. Click **"Add Source"**
3. Choose from 17 available types
4. Configure and create

### To Test Ingestion
1. Go to **Settings → Log Ingestion**
2. Select a source (e.g., "Nginx - Production API")
3. Upload a file or paste logs
4. See logs get ingested

### To Create Alerts
1. Go to **Settings → Alert Rules**
2. Click **"New Rule"**
3. Select condition (e.g., "Severity = Critical")
4. Set threshold and channel
5. Save rule

---

## 🎉 Summary

**Before:**
- Empty log sources list
- No data to display
- Hard to test features

**After:**
- ✅ 8 pre-configured log sources
- ✅ Realistic names and configurations
- ✅ Dynamic stats and timestamps
- ✅ Multiple categories represented
- ✅ Ready to test all features
- ✅ Professional demo experience

---

**Ab aapke paas ek fully functional log analyzer hai with realistic data! 🚀**

8 sources, 6 categories, dynamic stats - sab kuch ready hai testing aur demo ke liye! 💪

Build successful - sab kuch working hai! ✅
