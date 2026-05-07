import { useState } from "react";
import { Clock, Eye, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { StoryTeaser } from "@/services/api";

interface StoryCardProps {
  story: StoryTeaser;
  onLoginPrompt?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  mythology: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  historical: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  cultural: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  personal: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export default function StoryCard({ story, onLoginPrompt }: StoryCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showFullTeaser, setShowFullTeaser] = useState(false);

  const categoryStyle =
    CATEGORY_COLORS[story.category] || CATEGORY_COLORS.cultural;
  const categoryShape = ["mythology", "historical"].includes(story.category)
    ? "rounded-md"
    : "rounded-full";

  const handleReadMore = () => {
    if (!isAuthenticated && onLoginPrompt) {
      onLoginPrompt();
      return;
    }

    if (!isAuthenticated) {
      navigate(`/login?return=/stories/${story.slug}`);
    }
  };

  return (
    <div
      className="card border-mountain-600/40 hover:border-mountain-500 transition-all
                    duration-200 group overflow-hidden"
    >
      {/* Category badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1
                       text-xs font-sans font-medium border mb-3 ${categoryStyle} ${categoryShape}`}
      >
        {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
      </div>

      {/* Title */}
      <h3
        className="font-display text-xl text-stone-100 mb-3 group-hover:text-saffron-300
                     transition-colors leading-tight"
      >
        {story.title}
      </h3>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{story.read_time_minutes} min read</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{story.view_count.toLocaleString()} views</span>
        </div>
      </div>

      {/* Teaser text with blur effect */}
      <div className="relative">
        <div
          className={`font-body text-sm text-stone-300 leading-relaxed mb-4
                         ${!showFullTeaser ? "line-clamp-4" : ""}`}
        >
          {story.teaser}
        </div>

        {/* Gradient overlay when collapsed */}
        {!showFullTeaser && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16
                          bg-gradient-to-t from-mountain-900 via-mountain-900/80 to-transparent"
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4">
        {isAuthenticated ? (
          <Link
            to={`/stories/${story.slug}`}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            Read Full Story
          </Link>
        ) : (
          <button
            onClick={handleReadMore}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Login to Read
          </button>
        )}

        {!showFullTeaser && (
          <button
            onClick={() => setShowFullTeaser(true)}
            className="btn-secondary text-sm py-2 px-4"
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
}
