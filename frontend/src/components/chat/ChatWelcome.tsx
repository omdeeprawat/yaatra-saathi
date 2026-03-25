import { Mountain, Sparkles, Shield, Map } from 'lucide-react';

export default function ChatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-600/30
                      to-mountain-600/30 border border-saffron-500/20
                      flex items-center justify-center mb-6">
        <Mountain className="w-8 h-8 text-saffron-400" />
      </div>

      <h2 className="font-display text-2xl text-stone-100 mb-2">
        Yatra AI Guide
      </h2>
      <p className="font-body text-stone-400 text-sm max-w-sm leading-relaxed mb-8">
        Your AI companion for the Nanda Devi Raj Jat Yatra. Ask about the route,
        rituals, history, packing, altitude safety — anything about the pilgrimage.
      </p>

      
      <div className="flex flex-wrap gap-3 justify-center mb-2">
        {[
          { icon: Sparkles, label: 'RAG-grounded answers' },
          { icon: Shield,   label: 'Safety & altitude info' },
          { icon: Map,      label: 'Route & stage details' },
        ].map(({ icon: Icon, label }) => (
          <div key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full
                       border border-mountain-600/40 bg-mountain-800/30">
            <Icon className="w-3.5 h-3.5 text-saffron-400" />
            <span className="font-sans text-xs text-stone-400">{label}</span>
          </div>
        ))}
      </div>

      <p className="font-sans text-xs text-stone-600 mt-4">
        Jai Nanda Devi 🙏
      </p>
    </div>
  );
}