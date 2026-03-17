import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Scroll, Sparkles } from "lucide-react";
import { storiesApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import StoryCard from "./StoryCard";
import Spinner from "@/components/ui/Spinner";

export default function StoriesSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    data: stories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stories-featured"],
    queryFn: () => storiesApi.getAllStories(true), // featured only
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleLoginPrompt = (slug: string) => {
    navigate(`/login?return=/stories/${slug}`);
  };

  if (isLoading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center py-12">
          <Spinner size="large" />
        </div>
      </section>
    );
  }

  if (!stories || stories.length === 0) {
    if (isError) {
      return (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="card border-red-500/30 bg-red-500/5 text-center py-8">
            <p className="font-sans text-red-300 text-sm">
              Could not load stories right now.
            </p>
          </div>
        </section>
      );
    }

    return null;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      {/* Section header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 full
                        border border-saffron-500/30 bg-saffron-500/10 mb-4"
        >
          <Sparkles className=" text-saffron-400" />
          <span className="font-sans text-sm text-saffron-300 font-medium">
            Sacred Stories
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl text-stone-100 mb-3">
          Tales of Faith & Devotion
        </h2>

        <p className="font-body text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Discover the ancient legends, historical accounts, and cultural
          traditions that have shaped the Nanda Devi Raj Jat Yatra over a
          thousand years.
        </p>
      </div>

      {/* Story cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onLoginPrompt={() => handleLoginPrompt(story.slug)}
          />
        ))}
      </div>

      {/* View all CTA */}
      {!isAuthenticated && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-stone-500 text-sm">
            <Scroll className="w-4 h-4" />
            <span>More stories unlock after login</span>
          </div>
        </div>
      )}
    </section>
  );
}
