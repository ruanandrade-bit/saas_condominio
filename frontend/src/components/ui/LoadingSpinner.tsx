import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizes: Record<string, string> = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-soft ring-1 ring-slate-200/80">
        <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      </div>
      {text && <p className="text-sm font-semibold text-slate-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
