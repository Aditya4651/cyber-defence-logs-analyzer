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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card px-4 py-3"
        >
          <div className="chart-label mb-2">
            {card.label}
          </div>
          <div className={`text-[28px] font-semibold leading-none tabular-nums ${
            card.accent ? 'text-amber-500' : 'text-[#ededed]'
          }`}>
            {card.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
