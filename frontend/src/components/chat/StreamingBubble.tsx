import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mountain } from 'lucide-react';

interface StreamingBubbleProps {
  content: string;  
}

export default function StreamingBubble({ content }: StreamingBubbleProps) {
  return (
    <div className="flex gap-3 items-start">

      {/* AI avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron-600 to-mountain-600
                      flex items-center justify-center shrink-0 ring-1 ring-saffron-500/30">
        <Mountain className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="flex flex-col gap-1 max-w-[80%] items-start">
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed
                        bg-mountain-800/60 border border-mountain-700/50 text-stone-200">
          {content ? (
            <div className="prose prose-invert prose-sm max-w-none
                            prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                            prose-li:my-0.5 prose-headings:text-stone-100
                            prose-strong:text-saffron-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce [animation-delay:300ms]" />
            </div>
          )}

          {/* Blinking cursor at end of stream */}
          {content && (
            <span className="inline-block w-0.5 h-4 bg-saffron-400 ml-0.5
                             animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}