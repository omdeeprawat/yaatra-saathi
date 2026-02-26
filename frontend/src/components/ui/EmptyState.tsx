import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-mountain-800/60 border border-mountain-700/50
                      flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-stone-500" />
      </div>
      <h3 className="font-sans font-semibold text-stone-300 mb-2">{title}</h3>
      <p className="font-body text-stone-500 text-sm max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
