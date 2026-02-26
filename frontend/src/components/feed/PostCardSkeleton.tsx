export default function PostCardSkeleton() {
  return (
    <div className="card border-mountain-700/40 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-mountain-700/60" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-32 rounded bg-mountain-700/60" />
          <div className="h-3 w-20 rounded bg-mountain-800/60" />
        </div>
      </div>
      {/* Content lines */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="h-3.5 w-full rounded bg-mountain-700/40" />
        <div className="h-3.5 w-5/6 rounded bg-mountain-700/40" />
        <div className="h-3.5 w-4/6 rounded bg-mountain-700/40" />
      </div>
    </div>
  );
}
