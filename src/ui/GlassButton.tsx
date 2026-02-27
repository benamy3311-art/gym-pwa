import React from 'react';
import { cn } from '../utils/cn';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ children, className, variant = 'secondary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-accent/80 hover:bg-accent border-accent/50 text-white shadow-glass-sm',
            secondary: 'bg-glass-elevated border-glass-border hover:bg-white/20 text-primary shadow-glass-sm',
            danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400',
            ghost: 'bg-transparent border-transparent hover:bg-white/10 text-secondary hover:text-primary',
        };

        const sizes = {
            sm: 'py-1.5 px-3 text-sm rounded-xl',
            md: 'py-2.5 px-4 text-base rounded-2xl',
            lg: 'py-3.5 px-6 text-lg rounded-3xl font-semibold tracking-wide',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'tap-highlight relative overflow-hidden backdrop-blur-md font-medium border flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {/* Subtle top inner light for depth */}
                {variant !== 'ghost' && <div className="absolute inset-0 rounded-[inherit] shadow-inner-light pointer-events-none" />}
                {children}
            </button>
        );
    }
);

GlassButton.displayName = 'GlassButton';
