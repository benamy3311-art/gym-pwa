import { useRef } from 'react';
import { exportData, importData } from '../../utils/backup';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Download, Upload } from 'lucide-react';

export function DataManagement() {
    const fileRef = useRef<HTMLInputElement>(null);

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

    return (
        <GlassCard className="p-4 mt-8 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                Data Management
            </h3>
            <div className="flex gap-3">
                <GlassButton variant="secondary" onClick={handleExport} className="flex-1 text-sm bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/30">
                    <Download size={16} className="mr-2" /> Backup Data
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => fileRef.current?.click()} className="flex-1 text-sm bg-purple-500/20 hover:bg-purple-500/40 border-purple-500/30">
                    <Upload size={16} className="mr-2" /> Restore Backup
                </GlassButton>
            </div>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileRef} onChange={handleImport} />
            <p className="text-xs text-white/40 text-center">Your data is stored securely offline on this device.</p>
        </GlassCard>
    );
}
