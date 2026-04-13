import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon?: LucideIcon;
  variant?: "blue" | "green" | "amber" | "red";
}

export default function MetricCard({ label, value, change, changeType, icon: Icon, variant = "blue" }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${variant}`}>
        {Icon && <Icon />}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-trend ${changeType === 'positive' ? 'up' : 'down'}`}>
          {change}
        </div>
      )}
    </div>
  );
}
