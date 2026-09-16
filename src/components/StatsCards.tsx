import { Shield, AlertTriangle, Ban, Eye, Activity, Zap } from 'lucide-react';
import { ThreatSummary } from '../types';

interface StatsCardsProps {
  summary: ThreatSummary;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Threats',
      value: summary.total,
      icon: Shield,
      color: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20'
    },
    {
      title: 'Critical',
      value: summary.critical,
      icon: AlertTriangle,
      color: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      iconBg: 'bg-red-500/20'
    },
    {
      title: 'Blocked',
      value: summary.blocked,
      icon: Ban,
      color: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      iconBg: 'bg-green-500/20'
    },
    {
      title: 'Active Threats',
      value: summary.active,
      icon: Activity,
      color: 'from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20'
    },
    {
      title: 'Investigating',
      value: summary.total - summary.blocked - summary.active,
      icon: Eye,
      color: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20'
    },
    {
      title: 'High Severity',
      value: summary.high,
      icon: Zap,
      color: 'from-yellow-500/20 to-yellow-600/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`relative overflow-hidden rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.color} backdrop-blur-sm p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/20`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.icon className={`w-4 h-4 ${card.textColor}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
          <div className="text-xs text-gray-400 mt-1">{card.title}</div>
          <div className="absolute -right-2 -bottom-2 opacity-5">
            <card.icon className="w-16 h-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
