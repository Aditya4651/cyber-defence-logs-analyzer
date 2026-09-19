import { useAppStore } from '../store/appStore';
import { Activity, Database, Mail, Server, Shield, Zap } from 'lucide-react';

export default function ServiceStatus() {
  const { emailLogs, alertRules, savedSearches } = useAppStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emailsToday = emailLogs.filter(log => {
    const logDate = new Date(log.sentAt);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  }).length;

  const services = [
    {
      name: 'Clerk',
      icon: Shield,
      status: 'operational',
      usage: '1 / 50,000 MRU',
      usagePercent: 0.002,
      description: 'Authentication',
    },
    {
      name: 'Supabase',
      icon: Database,
      status: 'operational',
      usage: `${alertRules.length + savedSearches.length} records / 500 MB`,
      usagePercent: 0.1,
      description: 'Metadata DB',
    },
    {
      name: 'Axiom',
      icon: Activity,
      status: 'operational',
      usage: '~200 MB / 500 GB',
      usagePercent: 0.04,
      description: 'Log Storage',
    },
    {
      name: 'Resend',
      icon: Mail,
      status: emailsToday >= 90 ? 'warning' : 'operational',
      usage: `${emailsToday} / 100 emails today`,
      usagePercent: (emailsToday / 100) * 100,
      description: 'Email Alerts',
    },
    {
      name: 'Upstash',
      icon: Zap,
      status: 'operational',
      usage: '~1 MB / 256 MB',
      usagePercent: 0.4,
      description: 'Rate Limiting',
    },
    {
      name: 'Netlify',
      icon: Server,
      status: 'operational',
      usage: '~50 / 300 credits',
      usagePercent: 16.7,
      description: 'Deployment',
    },
  ];

  const statusColors = {
    operational: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#ededed] mb-1">Service Status</h2>
        <p className="text-[11px] text-[#525252]">
          All services operational · Free tier usage monitoring
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="p-3 bg-[#0a0a0a] border border-[#262626] rounded hover:border-[#404040] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <service.icon className="w-4 h-4 text-[#525252]" />
                <div>
                  <h3 className="text-sm font-medium text-[#ededed]">{service.name}</h3>
                  <p className="text-[10px] text-[#525252]">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[service.status as keyof typeof statusColors]}`}></span>
                <span className="text-[10px] text-[#a3a3a3] uppercase">
                  {service.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-[#525252]">Usage</span>
              <span className="text-[#a3a3a3] font-mono">{service.usage}</span>
            </div>

            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  service.usagePercent > 80 ? 'bg-red-500' :
                  service.usagePercent > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(service.usagePercent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#262626]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#525252]">Total monthly cost</span>
          <span className="text-[#ededed] font-semibold">$0.00</span>
        </div>
        <p className="text-[10px] text-[#404040] mt-1">
          All services running on free tiers
        </p>
      </div>
    </div>
  );
}
