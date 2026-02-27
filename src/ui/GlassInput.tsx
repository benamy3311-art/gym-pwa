import React from 'react';
import { cn } from './GlassCard';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && <label className="text-sm font-medium text-white/80 ml-1">{label}</label>}
                <input
                    ref={ref}
                    className={cn('glass-input w-full', error && 'border-red-500/50 focus:ring-red-500/50', className)}
                    {...props}
                />
                {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
            </div>
        );
    }
);

GlassInput.displayName = 'GlassInput';
