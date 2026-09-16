import { Shield, AlertTriangle, Ban, Activity, Eye, Zap } from 'lucide-react';
import { ThreatSummary } from '../types';

interface StatsCardsProps {
  summary: ThreatSummary;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Events',
      value: summary.total,
      icon: Shield,
      highlight: false,
    },
    {
      title: 'Critical',
      value: summary.critical,
      icon: AlertTriangle,
      highlight: true,
    },
    {
      title: 'High',
      value: summary.high,
      icon: Zap,
      highlight: summary.high > 0,
    },
    {
      title: 'Blocked',
      value: summary.blocked,
      icon: Ban,
      highlight: false,
    },
    {
      title: 'Active Threats',
      value: summary.active,
      icon: Activity,
      highlight: summary.active > 0,
    },
    {
      title: 'Investigating',
      value: summary.total - summary.blocked - summary.active,
      icon: Eye,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative bg-[#14161a] border border-[#22252b] rounded-lg p-4 transition-colors hover:border-[#2d3039]"
        >
          <div className="flex items-center gap-2 mb-3">
            <card.icon className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              {card.title}
            </span>
          </div>
          <div
            className={`text-[28px] font-semibold leading-none ${
              card.highlight ? 'text-red-500' : 'text-gray-100'
            }`}
          >
            {card.value.toLocaleString()}
          </div>
          {card.highlight && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/60 rounded-t-lg"></div>
          )}
        </div>
      ))}
    </div>
  );
}
