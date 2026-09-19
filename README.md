# CyberShield - Defense Log Analyzer

A production-ready cybersecurity log analysis platform built with a fully free tech stack.

## 🎯 Features

### Core Functionality
- **Real-time Log Analysis**: Analyze security logs with advanced filtering and search
- **Threat Visualization**: Interactive charts showing attack patterns and severity distribution
- **Alert Rules**: Configure custom alerts for critical security events
- **Saved Searches**: Save frequently used queries for quick access
- **Email Notifications**: Receive alerts via email when thresholds are met
- **Rate Limiting**: Built-in protection against API abuse

### Professional UI
- Dark theme with muted grayscale palette
- JetBrains Mono for all data values
- Responsive 12-column grid layout
- Skeleton loaders for better UX
- Keyboard shortcuts (⌘K for search)

## 🏗️ Architecture (Fully Free Stack)

```
User Browser (React + Vite)
   ↓
Zustand (State Management)
   ↓
localStorage (Persistence)
   ↓
Mock Services (Simulating production APIs)
   ├── Clerk (Auth) - 50K MRU free
   ├── Supabase (DB) - 500 MB free
   ├── Axiom (Logs) - 500 GB/month free
   ├── Resend (Email) - 100 emails/day free
   ├── Upstash (Redis) - 256 MB free
   └── Netlify (Deploy) - 300 credits/month free
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

### Backend Services (Simulated)
All services are simulated using localStorage to demonstrate the architecture:

1. **Authentication (Clerk)**
   - Login/Signup flows
   - Session management
   - User profiles

2. **Database (Supabase)**
   - Alert rules storage
   - Saved searches
   - User metadata

3. **Log Storage (Axiom)**
   - Log ingestion simulation
   - Query capabilities
   - Aggregations

4. **Email (Resend)**
   - Email alert sending
   - Rate limiting (100/day)
   - Delivery tracking

5. **Rate Limiting (Upstash)**
   - API call tracking
   - Per-endpoint limits
   - Sliding window algorithm

## 📊 Free Tier Limits

| Service | Limit | Current Usage | Strategy |
|---------|-------|---------------|----------|
| Clerk | 50K MRU | 1 user | Plenty for MVP |
| Supabase | 500 MB | ~1 MB | Store only metadata |
| Axiom | 500 GB/month | ~200 MB | Compress logs |
| Resend | 100 emails/day | Variable | Limit alert frequency |
| Upstash | 500K commands/month | ~1K | Use sparingly |
| Netlify | 300 credits/month | ~50 | Deploy to main only |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd cybershield

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📁 Project Structure

```
src/
├── components/
│   ├── AlertRules.tsx          # Alert rule management
│   ├── AuthScreen.tsx          # Login/Signup UI
│   ├── LiveFeed.tsx            # Real-time threat feed
│   ├── LogViewer.tsx           # Log table with filters
│   ├── Logo.tsx                # Custom SVG logo
│   ├── SavedSearches.tsx       # Saved query management
│   ├── ServiceStatus.tsx       # Backend service status
│   ├── SkeletonLoader.tsx      # Loading skeletons
│   ├── StatsCards.tsx          # Metric cards
│   └── ThreatCharts.tsx        # Data visualizations
├── data/
│   └── sampleLogs.ts           # Mock log generator
├── store/
│   └── appStore.ts             # Zustand state management
├── types.ts                    # TypeScript types
├── App.tsx                     # Main application
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## 🔐 Authentication Flow

1. User visits the app
2. If not authenticated, shown login/signup screen
3. Credentials validated (mock Clerk)
4. User object stored in Zustand + localStorage
5. Protected routes check `isAuthenticated` state
6. Logout clears session

## 📧 Email Alert System

### Creating Alert Rules
1. Navigate to Settings → Alert Rules
2. Click "New Rule"
3. Configure:
   - Rule name
   - Condition (e.g., "Severity = Critical")
   - Threshold (e.g., ≥ 10 events)
   - Channel (email/webhook)
4. Save the rule

### Triggering Alerts
When log data matches alert conditions:
1. System checks if threshold is met
2. If yes, sends email via Resend (mock)
3. Logs email in emailLogs array
4. Updates rule's `lastTriggered` timestamp

### Rate Limiting
- Maximum 100 emails per day (Resend free tier)
- System tracks daily email count
- Returns error if limit exceeded

## 🔍 Saved Searches

1. Navigate to Log Explorer
2. Apply filters/search
3. Click "Save Search" in Settings
4. Name the search and enter query
5. Access saved searches from Settings page
6. Click to apply saved search instantly

## 📈 Service Status Monitoring

The Service Status panel shows:
- Real-time status of all backend services
- Current usage vs. free tier limits
- Visual progress bars
- Cost tracking ($0.00 - all free)

## 🎨 Design System

### Colors
- Background: `#0a0a0a`
- Cards: `#141414`
- Borders: `#262626`
- Text Primary: `#ededed`
- Text Secondary: `#a3a3a3`
- Text Muted: `#525252`
- Accent (Critical): `#f59e0b` (amber)
- Success: `#22c55e` (green)
- Error: `#ef4444` (red)

### Typography
- Body: Inter
- Monospace: JetBrains Mono
- Chart labels: 11px uppercase, 0.5px letter-spacing

### Spacing
- Card padding: 24px
- Grid gap: 24px
- Section spacing: 24px

## ⌨️ Keyboard Shortcuts

- `/` or `⌘K` - Focus search input
- `Esc` - Clear search / close modals
- Click row - Expand details
- Right-click row - Context menu

## 🔄 Data Persistence

All data is persisted in localStorage:
- User session
- Alert rules
- Saved searches
- Email logs
- API call history

This simulates a real backend while keeping everything client-side.

## 🚀 Deployment (Netlify)

### Option 1: Netlify Drop
1. Run `npm run build`
2. Drag `dist/` folder to Netlify Drop
3. Site is live instantly

### Option 2: Git Integration
1. Push code to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Auto-deploys on push

### Environment Variables
For production with real services:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_AXIOM_TOKEN=your_token
VITE_RESEND_API_KEY=your_key
VITE_UPSTASH_REDIS_URL=your_url
```

## 📝 Production Migration Guide

To migrate from mock services to real APIs:

### 1. Replace Auth (Clerk)
```bash
npm install @clerk/clerk-react
```
```tsx
import { ClerkProvider, useAuth } from '@clerk/clerk-react';

// Wrap app in ClerkProvider
// Replace mock login with Clerk components
```

### 2. Replace Database (Supabase)
```bash
npm install @supabase/supabase-js
```
```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);

// Replace localStorage calls with Supabase queries
```

### 3. Replace Log Storage (Axiom)
```bash
npm install @axiomhq/js
```
```tsx
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({ token: process.env.AXIOM_TOKEN });

// Send logs to Axiom dataset
await axiom.ingest('dataset-name', [logData]);
```

### 4. Replace Email (Resend)
```bash
npm install resend
```
```tsx
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'alerts@yourdomain.com',
  to: userEmail,
  subject: 'Alert Triggered',
  html: '<p>Alert details...</p>'
});
```

### 5. Replace Rate Limiting (Upstash)
```bash
npm install @upstash/redis @upstash/ratelimit
```
```tsx
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({ url, token });
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npm run typecheck
```

### State Not Persisting
- Check localStorage is enabled
- Clear browser cache
- Check Zustand persist middleware config

## 📚 Resources

- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Axiom Documentation](https://axiom.co/docs)
- [Resend Documentation](https://resend.com/docs)

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 💡 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Multi-tenant support
- [ ] Custom dashboard builder
- [ ] Webhook integrations
- [ ] Advanced analytics
- [ ] Role-based access control
- [ ] Audit logging
- [ ] API key management

---

**Built with ❤️ using a 100% free tech stack**

Total monthly cost: **$0.00**
