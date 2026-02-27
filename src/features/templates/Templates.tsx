import { useEffect, useState } from 'react';
import { TemplateRepo } from '../../data/repositories';
import { Template } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Plus, Trash2 } from 'lucide-react';

export default function Templates() {
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        TemplateRepo.getAll().then(setTemplates);
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            await TemplateRepo.delete(id);
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    const handleCreate = async () => {
        const name = prompt('Template Name:');
        if (name) {
            const template = await TemplateRepo.add(name, []);
            setTemplates([...templates, template]);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            <header className="flex items-center justify-between mb-2 mt-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                    <p className="text-white/60">Manage your routines</p>
                </div>
                <GlassButton variant="primary" onClick={handleCreate}>
                    <Plus size={20} />
                </GlassButton>
            </header>

            <div className="flex flex-col gap-4 pb-8">
                {templates.map(t => (
                    <GlassCard key={t.id} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-xl">{t.name}</h3>
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-white/50">{t.exerciseIds.length} exercises configured</p>
                    </GlassCard>
                ))}
                {templates.length === 0 && (
                    <p className="text-center text-white/40 py-8">No templates found.</p>
                )}
            </div>
        </div>
    );
}
