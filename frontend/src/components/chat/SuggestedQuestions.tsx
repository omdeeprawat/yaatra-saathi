import { Sparkles } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What is the Nanda Devi Raj Jat Yatra?",
  "How long is the full route and how many days does it take?",
  "What is the significance of the Chausingha ram?",
  "What should I pack for the high-altitude stages?",
  "What happens at Homkund at the end of the Yatra?",
  "How do I prepare physically for the pilgrimage?",
  "What is Bedni Bugyal and why is it significant?",
  "What are the rituals performed at Wan village?",
  "How do I deal with altitude sickness on the route?",
  "What is the Nanda Devi Jagar tradition?",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
        <span className="font-sans text-xs text-stone-500 uppercase tracking-wider">
          Suggested questions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            disabled={disabled}
            className="font-sans text-xs px-3 py-1.5 rounded-full
                       border border-mountain-600/50 bg-mountain-800/40
                       text-stone-400 hover:text-stone-200
                       hover:border-mountain-500 hover:bg-mountain-700/40
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}