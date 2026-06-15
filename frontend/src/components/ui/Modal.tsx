import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-5">
        <button
          type="button"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] transition-opacity"
          onClick={onClose}
          aria-label="Fechar modal"
        />
        <div className={`animate-scale-in relative w-full ${sizes[size]} max-h-[92vh] overflow-hidden rounded-t-3xl bg-white shadow-elevated ring-1 ring-slate-950/5 sm:rounded-2xl`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <p className="eyebrow mb-1">Condomínio em Dia</p>
              <h3 className="text-lg font-extrabold tracking-[-0.025em] text-slate-950">{title}</h3>
            </div>
            <button onClick={onClose} className="icon-button" aria-label="Fechar modal">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
