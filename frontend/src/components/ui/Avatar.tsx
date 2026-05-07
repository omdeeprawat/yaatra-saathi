interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export default function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-mountain-600/50`}
      />
    );
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full bg-mountain-700 ring-1 ring-mountain-600/50
                  flex items-center justify-center font-display font-bold text-saffron-400`}
    >
      {initials}
    </div>
  );
}
