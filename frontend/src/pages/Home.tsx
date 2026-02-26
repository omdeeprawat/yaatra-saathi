import { Link } from 'react-router-dom';
import {
  Mountains as MountainsIcon,
  ChatCircleDots as ChatIcon,
  MapTrifold as MapIcon,
  UsersThree as UsersIcon,
  Sparkle as SparkleIcon,
  ArrowRight as ArrowRightIcon,
  MapPinSimpleArea as MapPinSimpleAreaIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/services/api';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';

export default function Home() {
  // Fetch first 3 posts for preview (public endpoint — no auth needed)
  const { data: feedData, isLoading } = useQuery({
    queryKey: ['home-feed-preview'],
    queryFn: () => postsApi.getPosts(1, 3),
    staleTime: 1000 * 60 * 2,
  });

  const posts = feedData?.items ?? [];

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-mountain-900 via-mountain-950 to-mountain-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full
                          bg-saffron-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full
                          bg-mountain-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          border border-saffron-500/30 bg-saffron-500/10 mb-6">
            <SparkleIcon size={16} className="text-saffron-400" />
            <span className="font-sans text-sm text-saffron-300 font-medium">
              AI-Powered Pilgrimage Companion
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold
                         text-stone-100 leading-tight mb-6">
            Your Guide to the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r
                             from-saffron-400 to-saffron-600">
              Nanda Devi Raj Jat Yatra
            </span>
          </h1>

          <p className="font-body text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto
                        leading-relaxed mb-10">
            The world's largest Himalayan pilgrimage — a 280km sacred journey through
            the mountains of Uttarakhand, held once every twelve years.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary py-3 px-8 text-base
                                            flex items-center justify-center gap-2 group">
              Get Started
              <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/map" className="btn-secondary py-3 px-8 text-base
                                       flex items-center justify-center gap-2">
              <MapPinSimpleAreaIcon size={20} />
              Explore Route
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: '280km', label: 'Total Distance' },
              { value: '4,200m', label: 'Peak Altitude' },
              { value: '~20 days', label: 'Journey Duration' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-saffron-400 mb-1">
                  {stat.value}
                </p>
                <p className="font-sans text-xs sm:text-sm text-stone-500 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-sans text-sm text-saffron-400 uppercase tracking-widest">
            Features
          </span>
          <h2 className="font-display text-3xl text-stone-100 mt-2">
            Everything You Need for the Journey
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ChatIcon,
              title: 'AI Yatra Guide',
              desc: 'Chat with an AI trained on the complete pilgrimage knowledge base. Ask about routes, rituals, safety, and history — get instant, grounded answers.',
              to: '/chat',
              color: 'text-saffron-400 bg-saffron-500/10 border-saffron-500/30',
            },
            {
              icon: MapIcon,
              title: 'Interactive Route Map',
              desc: 'Explore the full 11-stage journey from Nauti to Homkund on a 3D terrain map. View altitude profiles, stage distances, and sacred stop details.',
              to: '/map',
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
            },
            {
              icon: UsersIcon,
              title: 'Pilgrim Community',
              desc: 'Share experiences, ask questions, and connect with fellow pilgrims. Read stories from past Yatras and contribute your own journey.',
              to: '/feed',
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            },
          ].map(feature => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.to}
                to={feature.to}
                className="card border-mountain-600/40 hover:border-mountain-500
                           hover:scale-[1.02] transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center
                                 mb-4 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sans font-semibold text-stone-100 mb-2
                               group-hover:text-saffron-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="font-body text-stone-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Live Feed Preview ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-sans text-sm text-saffron-400 uppercase tracking-widest">
              Community
            </span>
            <h2 className="font-display text-3xl text-stone-100 mt-1">
              Latest from Pilgrims
            </h2>
          </div>
          <Link
            to="/feed"
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            View All
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={() => {}} />
            ))}
          </div>
        ) : (
          <div className="card border-mountain-600/30 text-center py-12">
            <UsersIcon size={40} className="text-stone-600 mx-auto mb-3" />
            <p className="font-sans text-stone-500 text-sm">
              No posts yet — be the first to share your journey!
            </p>
          </div>
        )}
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="card border-saffron-500/30 bg-gradient-to-br from-saffron-500/10
                        to-mountain-600/10 text-center py-12">
          <MountainsIcon size={48} className="text-saffron-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-stone-100 mb-3">
            Ready to Begin Your Journey?
          </h2>
          <p className="font-body text-stone-400 max-w-lg mx-auto leading-relaxed mb-6">
            Join Yatra Saathi today and access the complete pilgrimage companion —
            AI guide, route maps, and a community of fellow pilgrims.
          </p>
          <Link to="/register" className="btn-primary py-3 px-8 inline-flex items-center gap-2">
            Create Free Account
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
