interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'badge-submitted';
      case 'under review': return 'badge-review';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      case 'active': return 'badge-active';
      case 'expired': return 'badge-expired';
      default: return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
