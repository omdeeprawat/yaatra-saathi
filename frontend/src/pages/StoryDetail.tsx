import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { storiesApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';

const CATEGORY_COLORS: Record<string, string> = {
  mythology: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  historical: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  cultural: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  personal: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: story, isLoading, isError } = useQuery({
    queryKey: ['story', slug],
    queryFn: () => storiesApi.getStoryBySlug(slug!),
    enabled: isAuthenticated && !!slug,
    retry: 1,
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to={`/login?return=/stories/${slug}`} replace />;
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card border-red-500/20 bg-red-500/5 max-w-md text-center">
          <p className="font-sans text-red-400 text-sm">
            Story not found or you don't have access to view it.
          </p>
        </div>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[story.category] || CATEGORY_COLORS.cultural;

  return (
    <div className="min-h-[calc(100vh-4rem)]">

      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-mountain-900 to-mountain-950 px-4 py-12 mb-8">
        <div className="max-w-3xl mx-auto">

          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-200
                       transition-colors mb-6 font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Category badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           text-sm font-sans font-medium border mb-4 ${categoryStyle}`}>
            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl text-stone-100 mb-4 leading-tight">
            {story.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{story.read_time_minutes} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{story.view_count.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <article className="prose prose-invert prose-lg max-w-none
                            prose-headings:font-display prose-headings:text-stone-100
                            prose-h1:text-3xl prose-h1:mb-4
                            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-saffron-300
                            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-stone-300 prose-p:leading-relaxed prose-p:mb-4
                            prose-strong:text-saffron-300 prose-strong:font-semibold
                            prose-em:text-stone-400
                            prose-blockquote:border-l-4 prose-blockquote:border-saffron-500
                            prose-blockquote:pl-4 prose-blockquote:italic
                            prose-blockquote:text-stone-400 prose-blockquote:bg-mountain-800/30
                            prose-blockquote:py-2 prose-blockquote:rounded-r
                            prose-ul:text-stone-300 prose-li:text-stone-300
                            prose-a:text-saffron-400 prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {story.full_content}
          </ReactMarkdown>
        </article>

        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-mountain-700/50 text-center">
          <p className="font-sans text-stone-500 text-sm mb-4">
            Enjoyed this story? Explore more sacred tales of the Yatra.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary py-2 px-6 text-sm"
          >
            Back to Stories
          </button>
        </div>
      </div>
    </div>
  );
}