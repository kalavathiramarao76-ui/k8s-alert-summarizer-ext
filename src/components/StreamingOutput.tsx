import React, { useRef, useEffect } from 'react';

interface Props {
  content: string;
  isStreaming: boolean;
  error?: string | null;
}

export function StreamingOutput({ content, isStreaming, error }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  if (error) {
    return (
      <div className="card border-red-700 bg-red-950/30">
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error</span>
        </div>
        <p className="mt-2 text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!content && !isStreaming) return null;

  return (
    <div
      ref={containerRef}
      className="card max-h-[500px] overflow-y-auto"
    >
      {isStreaming && !content && (
        <div className="flex items-center gap-2 text-k8s-muted">
          <div className="loading-dots flex gap-1">
            <span className="w-2 h-2 bg-k8s-accent rounded-full inline-block" />
            <span className="w-2 h-2 bg-k8s-accent rounded-full inline-block" />
            <span className="w-2 h-2 bg-k8s-accent rounded-full inline-block" />
          </div>
          <span className="text-sm">Analyzing...</span>
        </div>
      )}
      <div className={`prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed ${isStreaming ? 'streaming-cursor' : ''}`}>
        {formatMarkdown(content)}
      </div>
    </div>
  );
}

function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-k8s-accent font-bold text-base mt-4 mb-2 first:mt-0">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-k8s-text font-semibold text-sm mt-3 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('```')) {
      elements.push(null); // code blocks handled via pre-wrap
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="ml-4 my-0.5 text-k8s-text">
          {line}
        </div>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="ml-4 my-0.5 text-k8s-text">
          {line}
        </div>
      );
    } else if (line.match(/^\*\*.*\*\*$/)) {
      elements.push(
        <div key={i} className="font-bold text-k8s-text mt-2">
          {line.replace(/\*\*/g, '')}
        </div>
      );
    } else {
      elements.push(
        <div key={i} className={line.trim() ? '' : 'h-2'}>
          {line}
        </div>
      );
    }
  });

  return <>{elements}</>;
}
