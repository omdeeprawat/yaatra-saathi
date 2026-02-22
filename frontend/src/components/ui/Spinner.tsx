import clsx from 'clsx';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Spinner({ size = 'medium', className }: SpinnerProps) {
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-4',
    large: 'w-10 h-10 border-8',
  };
  return (
    <div
      className={clsx(
        'border-t-transparent border-solid animate-spin rounded-full',
        sizes[size],
        className,
      )}
    />
  );
}