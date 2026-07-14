import { useEffect, useRef, useState } from 'react';
import { exportData, importData } from '../../utils/backup';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Download, Upload, Database, AlertTriangle, Cloud, RefreshCw, LogOut } from 'lucide-react';
import { db, seedDefaultExercises } from '../../data/db';
import { useAuthStore } from '../../store/authStore';
import { firebaseEnabled } from '../../firebase';
import { syncNow, getLastSyncedAt } from '../../data/cloudSync';
import { cn } from '../../utils/cn';

const LAST_BACKUP_KEY = 'gymPwa_lastBackupAt';
const BACKUP_REMINDER_DAYS = 14;

function timeAgo(timestamp: number): string {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export function DataManagement() {
    const fileRef = useRef<HTMLInputElement>(null);
    const { user, signInWithGoogle, signOutUser } = useAuthStore();
    const [lastBackupAt, setLastBackupAt] = useState<number | null>(() => {
        const stored = localStorage.getItem(LAST_BACKUP_KEY);
        return stored ? Number(stored) : null;
    });
    const [hasData, setHasData] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAtState] = useState<number | null>(() => getLastSyncedAt());

    useEffect(() => {
        db.workoutSessions.count().then(count => setHasData(count > 0));
    }, []);

    const handleSyncNow = async () => {
        if (!user) return;
        setSyncing(true);
        try {
            await syncNow(user);
            setLastSyncedAtState(getLastSyncedAt());
        } catch (err: any) {
            alert("Sync failed: " + err.message);
        } finally {
            setSyncing(false);
        }
    };

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

            const now = Date.now();
            localStorage.setItem(LAST_BACKUP_KEY, String(now));
            setLastBackupAt(now);
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

    const daysSinceBackup = lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / 86400000) : null;
    const showBackupWarning = hasData && (daysSinceBackup === null || daysSinceBackup >= BACKUP_REMINDER_DAYS);

    return (
        <GlassCard variant="inset" className="p-5 mt-4 flex flex-col gap-4">
            <h3 className="text-[13px] font-bold text-tertiary uppercase tracking-widest border-b border-glass-elevated pb-3">
                Settings & Data
            </h3>

            {showBackupWarning && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[13px] font-medium leading-snug">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>
                        {daysSinceBackup === null
                            ? "You've never made a backup. All your data lives only on this device and can be cleared by the OS/browser. Tap Backup below to save a copy."
                            : `Your last backup was ${daysSinceBackup} days ago. Tap Backup below so you don't lose your progress.`}
                    </span>
                </div>
            )}

            <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mt-1">Data Management</h4>
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

            {firebaseEnabled && (
                <>
                    <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mt-2 border-t border-glass-elevated pt-4">Cloud Sync</h4>
                    {user ? (
                        <div className="flex flex-col gap-2.5">
                            <p className="text-[13px] text-secondary">
                                Signed in as <span className="text-primary font-medium">{user.email}</span>
                                <br />
                                {syncing ? 'Syncing…' : lastSyncedAt ? `Last synced ${timeAgo(lastSyncedAt)}` : 'Not synced yet'}
                            </p>
                            <div className="flex gap-3">
                                <GlassButton variant="secondary" onClick={handleSyncNow} disabled={syncing} className="flex-1 text-[13px] font-semibold rounded-xl shadow-inner-dark">
                                    <RefreshCw size={16} className={cn("mr-1.5", syncing && "animate-spin")} /> Sync now
                                </GlassButton>
                                <GlassButton variant="ghost" onClick={() => signOutUser()} className="text-[13px] font-semibold rounded-xl">
                                    <LogOut size={16} className="mr-1.5" /> Sign out
                                </GlassButton>
                            </div>
                        </div>
                    ) : (
                        <GlassButton variant="secondary" onClick={() => signInWithGoogle().catch((err: any) => alert('Google sign-in failed: ' + err.message))} className="w-full text-sm font-semibold rounded-xl shadow-inner-dark">
                            <Cloud size={16} className="mr-1.5" /> Sign in with Google to sync
                        </GlassButton>
                    )}
                </>
            )}

            <p className="text-[11px] font-medium text-tertiary text-center uppercase tracking-widest mt-1">Stored securely offline</p>
        </GlassCard>
    );
}
