import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-2 block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`min-h-[104px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-slate-950 shadow-sm shadow-slate-900/[0.018] outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 hover:shadow-md focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;
