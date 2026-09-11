// VELVET — Empty State Component

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto rounded-[20px] bg-white/[0.04] border border-white/10 backdrop-blur-[14px] shadow-[0_0_30px_rgba(0,0,0,0.3)]">
      {icon && (
        <div className="mb-4 text-primary text-4xl">{icon}</div>
      )}
      <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
