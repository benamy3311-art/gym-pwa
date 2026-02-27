import React from 'react';
import { cn } from './GlassCard'; // using cn from here to save file count, or just move cn to a utils later

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({
    children,
    className,
    variant = 'secondary',
    size = 'md',
    ...props
}: GlassButtonProps) {

    const variants = {
        primary: 'bg-blue-600/50 hover:bg-blue-600/60 border-blue-400/30 text-white',
        secondary: 'bg-white/10 hover:bg-white/15 border-white/10 text-white',
        danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-200',
        ghost: 'bg-transparent border-transparent hover:bg-white/5 text-white/70 hover:text-white',
    };

    const sizes = {
        sm: 'py-1.5 px-3 text-sm rounded-lg',
        md: 'py-2.5 px-4 text-base rounded-xl',
        lg: 'py-3.5 px-6 text-lg rounded-xl font-semibold',
    };

    return (
        <button
            className={cn('glass-button', variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
