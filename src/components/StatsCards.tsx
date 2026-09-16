import { ThreatSummary } from '../types';

interface StatsCardsProps {
  summary: ThreatSummary;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    { label: 'Total Events', value: summary.total },
    { label: 'Critical', value: summary.critical, accent: true },
    { label: 'High', value: summary.high },
    { label: 'Blocked', value: summary.blocked },
    { label: 'Active', value: summary.active },
    { label: 'Investigating', value: summary.total - summary.blocked - summary.active },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#22252b] rounded-lg overflow-hidden border border-[#22252b]">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#0f1013] px-4 py-3"
        >
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            {card.label}
          </div>
          <div className={`text-[22px] font-semibold leading-none tabular-nums ${
            card.accent ? 'text-amber-500' : 'text-gray-100'
          }`}>
            {card.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
