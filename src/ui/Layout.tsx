import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, Activity, Clock, Dumbbell, PieChart } from 'lucide-react';
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
                <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-blue-600/90 to-blue-500/90 backdrop-blur-md text-white flex items-center justify-between px-6 z-[100] shadow-lg animate-in slide-in-from-top-4 duration-300 shadow-blue-500/20">
                    <span className="font-semibold text-sm opacity-80 uppercase tracking-widest">Rest Timer</span>
                    <span className="font-mono text-xl font-bold">{Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}</span>
                    <button onClick={stopRest} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 active:scale-95 transition-all text-sm font-medium">Skip</button>
                </div>
            )}
            <main className={`flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col ${isResting ? 'pt-16' : 'pt-8'}`}>
                <Outlet />
            </main>

            {/* Bottom Tab Bar for Mobile / Fixed Sidebar for Desktop */}
            <nav className="fixed bottom-0 left-0 right-0 glass-panel border-b-0 border-x-0 rounded-t-3xl p-2 z-50 md:top-0 md:bottom-auto md:rounded-none md:border-t-0 md:border-b">
                <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-center md:gap-8">
                    <NavItem to="/" icon={<Home size={20} />} label="Start" />
                    <NavItem to="/templates" icon={<List size={20} />} label="Routines" />
                    <NavItem to="/exercises" icon={<Dumbbell size={20} />} label="Exercises" />
                    <NavItem to="/history" icon={<Clock size={20} />} label="History" />
                    <NavItem to="/analytics" icon={<PieChart size={20} />} label="Analytics" />
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
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                isActive ? "text-blue-400" : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
        >
            {icon}
            <span className="text-[10px] font-medium hidden md:block">{label}</span>
        </NavLink>
    );
}
