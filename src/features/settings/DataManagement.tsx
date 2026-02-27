import { useRef } from 'react';
import { exportData, importData } from '../../utils/backup';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Download, Upload, Database, Sun, Moon, Monitor } from 'lucide-react';
import { seedDefaultExercises } from '../../data/db';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/cn';

export function DataManagement() {
    const fileRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useThemeStore();

    const handleExport = async () => {
        try {
            const json = await exportData();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GymPWA_Backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert("Failed to export data");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                await importData(json);
                alert('Data completely imported! Refreshing...');
                window.location.reload();
            } catch (err: any) {
                alert("Failed to import data: " + err.message);
            }
            if (fileRef.current) fileRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleLoadDefaults = async () => {
        if (confirm("Load default predefined exercises? (Won't duplicate existing ones)")) {
            try {
                await seedDefaultExercises();
                alert('Default exercises loaded! Refreshing...');
                window.location.reload();
            } catch (err: any) {
                alert("Failed to load defaults: " + err.message);
            }
        }
    };

    return (
        <GlassCard variant="inset" className="p-5 mt-4 flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-tertiary uppercase tracking-widest border-b border-glass-border/30 pb-3">
                Settings & Data
            </h3>

            {/* Theme Toggle */}
            <div className="flex flex-col gap-2 mb-2">
                <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mt-1">Appearance</h4>
                <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-xl shadow-inner-dark border border-glass-border/30">
                    <button onClick={() => setTheme('dark')} className={cn("flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all tap-highlight", theme === 'dark' ? "bg-glass-elevated text-primary shadow-sm" : "text-secondary hover:text-primary")}>
                        <Moon size={14} /> Dark
                    </button>
                    <button onClick={() => setTheme('light')} className={cn("flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all tap-highlight", theme === 'light' ? "bg-glass-elevated text-primary shadow-sm" : "text-secondary hover:text-primary")}>
                        <Sun size={14} /> Light
                    </button>
                    <button onClick={() => setTheme('system')} className={cn("flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all tap-highlight", theme === 'system' ? "bg-glass-elevated text-primary shadow-sm" : "text-secondary hover:text-primary")}>
                        <Monitor size={14} /> Auto
                    </button>
                </div>
            </div>

            <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mt-2 border-t border-glass-border/30 pt-4">Data Management</h4>
            <div className="flex gap-3">
                <GlassButton variant="secondary" onClick={handleExport} className="flex-1 text-[13px] font-semibold bg-accent/10 hover:bg-accent/20 border-accent/20 text-accent rounded-xl shadow-inner-dark">
                    <Download size={16} className="mr-1.5" /> Backup
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => fileRef.current?.click()} className="flex-1 text-[13px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400 rounded-xl shadow-inner-dark">
                    <Upload size={16} className="mr-1.5" /> Restore
                </GlassButton>
            </div>
            <GlassButton variant="secondary" onClick={handleLoadDefaults} className="w-full text-sm font-semibold bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-500 rounded-xl shadow-inner-dark">
                <Database size={16} className="mr-1.5" /> Load Predefined Exercises
            </GlassButton>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileRef} onChange={handleImport} />
            <p className="text-[11px] font-medium text-tertiary text-center uppercase tracking-widest mt-1">Stored securely offline</p>
        </GlassCard>
    );
}
