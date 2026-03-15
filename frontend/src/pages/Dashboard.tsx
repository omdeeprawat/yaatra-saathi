import { Mountain, MessageSquare, Map, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const quickLinks = [
  {
    to: '/chat',
    icon: MessageSquare,
    title: 'AI Yatra Guide',
    desc: 'Ask anything about the pilgrimage route, rituals, and history.',
    color: 'text-saffron-400',
    bg: 'bg-saffron-500/10 border-saffron-500/20',
  },
  {
    to: '/map',
    icon: Map,
    title: 'Route Map',
    desc: 'Explore the full 280km journey from Nauti to Homkund interactively.',
    color: 'text-mountain-400',
    bg: 'bg-mountain-500/10 border-mountain-500/20',
  },
  {
    to: '/feed',
    icon: Users,
    title: 'Community Feed',
    desc: 'Read and share experiences with fellow pilgrims.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Welcome */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Mountain className="w-7 h-7 text-saffron-500" />
          <span className="font-sans text-[11px] text-stone-600 uppercase tracking-[3px]">
            Dashboard
          </span>
        </div>
        <h1 className="font-display text-4xl text-stone-100">
          Namaste, {user?.full_name.split(' ')[0]} 🙏
        </h1>
        <p className="font-body text-stone-400 mt-2 text-lg">
          Welcome to your Yatra Saathi dashboard. Where would you like to go?
        </p>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`card border hover:scale-[1.02] transition-all duration-200 group ${link.bg}`}
            >
              <Icon className={`w-8 h-8 mb-4 ${link.color}`} />
              <h3 className="font-sans font-semibold text-stone-100 mb-2">{link.title}</h3>
              <p className="font-body text-stone-400 text-sm leading-relaxed">{link.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Account info */}
      <div className="mt-12 card border-mountain-700/30">
        <h2 className="font-sans font-semibold text-stone-200 text-sm uppercase tracking-[2px] mb-4">Your Account</h2>
        <div className="flex items-center gap-4">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-mountain-700 flex items-center justify-center">
              <span className="font-display text-lg text-saffron-400">
                {user?.full_name[0]}
              </span>
            </div>
          )}
          <div>
            <p className="font-sans font-medium text-stone-100">{user?.full_name}</p>
            <p className="font-sans text-sm text-stone-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-mountain-700/50 text-xs font-sans text-stone-400 capitalize">
              {user?.auth_provider} account
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}