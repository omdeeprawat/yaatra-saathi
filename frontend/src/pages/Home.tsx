import { Link } from "react-router-dom";
import {
  Mountains as MountainsIcon,
  ChatCircleDots as ChatIcon,
  MapTrifold as MapIcon,
  UsersThree as UsersIcon,
  Sparkle as SparkleIcon,
  ArrowRight as ArrowRightIcon,
  MapPinSimpleArea as MapPinSimpleAreaIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/services/api";
import PostCard from "@/components/feed/PostCard";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef } from "react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { data: feedData, isLoading } = useQuery({
    queryKey: ["home-feed-preview"],
    queryFn: () => postsApi.getPosts(1, 3),
    staleTime: 1000 * 60 * 2,
  });

  const posts = feedData?.items ?? [];

  const heroRef = useFadeIn();
  const featuresRef = useFadeIn();
  const feedRef = useFadeIn();
  const ctaRef = useFadeIn();

  return (
    <div className="overflow-x-hidden">
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isLight
              ? "bg-gradient-to-b from-blue-50 via-white to-slate-50"
              : "bg-gradient-to-b from-mountain-900 via-mountain-950 to-mountain-950"
          }`}
        />
        <div className="absolute inset-0">
          <div
            className={`absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse transition-colors duration-500 ${
              isLight ? "bg-saffron-400/15" : "bg-saffron-500/10"
            }`}
          />
          <div
            className={`absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl transition-colors duration-500 ${
              isLight ? "bg-indigo-200/25" : "bg-mountain-600/20"
            }`}
          />
        </div>

        <div
          ref={heroRef}
          className="relative max-w-5xl mx-auto text-center opacity-0 translate-y-6 transition-all duration-700 ease-out"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded border mb-6 transition-colors duration-300 ${
              isLight
                ? "border-saffron-500/40 bg-saffron-500/10"
                : "border-saffron-500/30 bg-saffron-500/10"
            }`}
          >
            <SparkleIcon size={16} className="text-saffron-400" />
            <span className="font-sans text-xs text-saffron-300 font-medium tracking-widest uppercase">
              AI-Powered Pilgrimage Companion
            </span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-5xl font-bold
                         text-stone-100 leading-tight mb-6"
          >
            <span className="inline-block hover:scale-105 transition-transform duration-300 cursor-default">
              Your Guide to the
            </span>
            <br />
            <span
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r
                             from-saffron-400 to-saffron-600
                             hover:scale-105 transition-transform duration-300 cursor-default"
            >
              Nanda Devi Raj Jat Yatra
            </span>
          </h1>

          <p
            className="font-body text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto
                        leading-relaxed mb-10"
          >
            The world's largest Himalayan pilgrimage — a 280 km sacred journey
            through the mountains of Uttarakhand, held once every twelve years.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary py-3 px-8 text-base flex items-center justify-center gap-2 group
                         hover:scale-105 transition-transform duration-200"
            >
              Get Started
              <ArrowRightIcon
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/map"
              className="btn-secondary py-3 px-8 text-base flex items-center justify-center gap-2
                         hover:scale-105 transition-transform duration-200"
            >
              <MapPinSimpleAreaIcon size={20} />
              Explore Route
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: "280km", label: "Total Distance" },
              { value: "4,200m", label: "Peak Altitude" },
              { value: "~20 days", label: "Journey Duration" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center group cursor-default hover:scale-110 transition-transform duration-300"
              >
                <p className="font-display text-2xl sm:text-3xl font-bold text-saffron-400 mb-1 group-hover:text-saffron-300 transition-colors">
                  {stat.value}
                </p>
                <p className="font-sans text-[14px] text-stone-600 uppercase tracking-[3px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        className="max-w-6xl mx-auto px-4 py-16 opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <div className="text-center mb-12">
          <span className="font-sans text-[18px] text-stone-600 uppercase tracking-[3px]">
            Features
          </span>
          <h2 className="font-display text-2xl text-stone-100 mt-3 inline-block transition-transform duration-300 cursor-default">
            Everything You Need for the Journey
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ChatIcon,
              title: "AI Yatra Guide",
              desc: "Chat with an AI trained on the complete pilgrimage knowledge base. Ask about routes, rituals, safety, and history — get instant, grounded answers.",
              to: "/chat",
              color: "text-saffron-400 bg-saffron-500/10 border-saffron-500/30",
            },
            {
              icon: MapIcon,
              title: "Interactive Route Map",
              desc: "Explore the full 11-stage journey from Nauti to Homkund on a 3D terrain map. View altitude profiles, stage distances, and sacred stop details.",
              to: "/map",
              color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
            },
            {
              icon: UsersIcon,
              title: "Pilgrim Community",
              desc: "Share experiences, ask questions, and connect with fellow pilgrims. Read stories from past Yatras and contribute your own journey.",
              to: "/feed",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.to}
                to={feature.to}
                className={`card hover:scale-[1.04] hover:-translate-y-1 transition-all duration-300 group ${
                  isLight
                    ? "border-slate-200 hover:border-saffron-400/50 hover:shadow-lg hover:shadow-saffron-500/10"
                    : "border-mountain-600/40 hover:border-mountain-500"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded border flex items-center justify-center
                                 mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={24} />
                </div>
                <h3
                  className="font-sans font-semibold text-stone-100 mb-2
                               group-hover:text-saffron-400 transition-colors duration-200"
                >
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
      <section
        ref={feedRef}
        className="max-w-3xl mx-auto px-4 py-16 opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-sans text-[18px] text-stone-600 uppercase tracking-[3px]">
              Community
            </span>
            <h2 className="font-display text-2xl text-stone-100 mt-2 inline-block duration-300 cursor-default">
              Latest from Pilgrims
            </h2>
          </div>
          <Link
            to="/feed"
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 hover:scale-105 transition-transform duration-200"
          >
            View All
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
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
      <section
        ref={ctaRef}
        className="max-w-4xl mx-auto px-4 py-16 opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <div
          className={`card text-center py-12 hover:scale-[1.01] transition-all duration-300 ${
            isLight
              ? "border-saffron-400/40 bg-gradient-to-br from-saffron-500/10 to-blue-50 hover:shadow-xl hover:shadow-saffron-500/10"
              : "border-saffron-500/30 bg-gradient-to-br from-saffron-500/10 to-mountain-600/10"
          }`}
        >
          <MountainsIcon
            size={48}
            className="text-saffron-400 mx-auto mb-4 hover:scale-110 transition-transform duration-300"
          />
          <h2 className="font-display text-2xl text-stone-100 mb-3 hover:scale-105 inline-block transition-transform duration-300 cursor-default">
            Ready to Begin Your Journey?
          </h2>
          <p className="font-body text-stone-400 max-w-lg mx-auto leading-relaxed mb-6">
            Join Yatra Saathi today and access the complete pilgrimage companion
            — AI guide, route maps, and a community of fellow pilgrims.
          </p>
          <Link
            to="/register"
            className="btn-primary py-3 px-8 inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200"
          >
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
