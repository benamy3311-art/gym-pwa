import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, Clock, Dumbbell, PieChart } from 'lucide-react';
import { useRestStore } from '../features/workout/restStore';
import { cn } from './GlassCard';

export default function Layout() {
    const { isResting, remainingSeconds, stopRest, tick } = useRestStore();

    useEffect(() => {
        let interval: any;
        if (isResting) {
            interval = setInterval(tick, 1000);
        }
        return () => clearInterval(interval);
    }, [isResting, tick]);

    return (
        <div className="min-h-screen flex flex-col pb-20 md:pb-0 relative">
            {isResting && (
                <div className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-80 h-16 bg-glass-elevated border border-glass-border shadow-glass backdrop-blur-2xl rounded-3xl flex items-center justify-between px-5 z-[100] animate-in slide-in-from-top-6 duration-300">
                    <div className="flex flex-col">
                        <span className="font-semibold text-[10px] text-accent uppercase tracking-widest">Rest Timer</span>
                        <span className="font-mono text-xl font-bold text-primary">{Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={stopRest} className="tap-highlight px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 text-primary text-sm font-semibold">Skip</button>
                </div>
            )}
            <main className={`flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col ${isResting ? 'pt-16' : 'pt-8'}`}>
                <Outlet />
            </main>

            {/* Liquid Glass Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[color:var(--glass-base)] border-t border-[color:var(--glass-border)] backdrop-blur-2xl pb-safe z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b [box-shadow:var(--shadow-md)] pt-1 pb-2 md:pb-1">
                <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-center md:gap-8 px-2 pt-2">
                    <NavItem to="/" icon={<Home size={22} />} label="Start" />
                    <NavItem to="/templates" icon={<List size={22} />} label="Routines" />
                    <NavItem to="/exercises" icon={<Dumbbell size={22} />} label="Exercises" />
                    <NavItem to="/history" icon={<Clock size={22} />} label="History" />
                    <NavItem to="/analytics" icon={<PieChart size={22} />} label="Analytics" />
                </div>
            </nav>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-200 w-16 tap-highlight",
                isActive ? "text-[color:var(--accent)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            )}
        >
            {icon}
            <span className="ios-caption mt-1 font-medium">{label}</span>
        </NavLink>
    );
}
