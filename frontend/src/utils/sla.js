
export function getSlaStatus(ticket) {
  if (!ticket || !ticket.created_at) {
    return { label: 'Unknown', variant: 'neutral' };
  }

  const priority = ticket.priority || 'MEDIUM';
  const status = ticket.status;

  if (status === 'RESOLVED' || status === 'CLOSED') {
    return { label: 'Completed', variant: 'success' };
  }

  const created = new Date(ticket.created_at);
  const now = new Date();
  const diffMs = now - created;
  const diffHours = diffMs / (1000 * 60 * 60);

  let slaHours = 48;
  if (priority === 'LOW') slaHours = 72;
  if (priority === 'HIGH') slaHours = 24;
  if (priority === 'CRITICAL') slaHours = 8;

  if (diffHours > slaHours) {
    return { label: 'Overdue', variant: 'danger' };
  }
  if (diffHours > slaHours * 0.7) {
    return { label: 'At risk', variant: 'warning' };
  }
  return { label: 'On track', variant: 'success' };
}

export function getSlaBadgeProps(ticket) {
  const { label, variant } = getSlaStatus(ticket);

  const base =
    'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium';
  const variants = {
    danger: base + ' bg-red-50 text-red-700 border border-red-200',
    warning: base + ' bg-amber-50 text-amber-700 border border-amber-200',
    success: base + ' bg-emerald-50 text-emerald-700 border border-emerald-200',
    neutral: base + ' bg-slate-50 text-slate-600 border border-slate-200',
  };

  return {
    label,
    className: variants[variant] || variants.neutral,
  };
}
