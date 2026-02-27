import React from 'react';
import { cn } from '../utils/cn';

// Re-export cn for backward compatibility if other files import it from here
export { cn };

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'base' | 'elevated' | 'inset';
}

export function GlassCard({ children, className, variant = 'base', ...props }: GlassCardProps) {
    const variants = {
        base: 'bg-[color:var(--glass-base)] border border-[color:var(--glass-border)] [box-shadow:var(--shadow-sm)] backdrop-blur-2xl text-[color:var(--text-primary)]',
        elevated: 'bg-[color:var(--glass-elevated)] border border-[color:var(--glass-border)] [box-shadow:var(--shadow-md)] backdrop-blur-2xl text-[color:var(--text-primary)] shadow-black/5',
        inset: 'bg-[color:var(--glass-inset)] border border-transparent shadow-inner backdrop-blur-md text-[color:var(--text-primary)]',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-3xl p-4 md:p-6 transition-all duration-300',
                variants[variant],
                className
            )}
            {...props}
        >
            {/* Soft inner top-highlight for glass depth */}
            {variant !== 'inset' && (
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-inner-light" />
            )}
            {children}
        </div>
    );
}
