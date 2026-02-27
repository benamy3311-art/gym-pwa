import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from './useTemplates';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Plus, Trash2, LayoutList } from 'lucide-react';

export default function Templates() {
    const navigate = useNavigate();
    const { templates, loadTemplates, addTemplate, deleteTemplate } = useTemplates();

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this routine?')) {
            await deleteTemplate(id);
        }
    };

    const handleCreate = async () => {
        const name = prompt('Routine Name:');
        if (name) {
            const template = await addTemplate(name);
            navigate(`/templates/${template.id}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            <header className="flex items-end justify-between mb-2 mt-4 px-1">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-1">Routines</h1>
                    <p className="text-secondary font-medium">Manage your custom workouts</p>
                </div>
                <GlassButton variant="primary" size="sm" onClick={handleCreate} className="rounded-full w-10 h-10 p-0 mb-1">
                    <Plus size={20} />
                </GlassButton>
            </header>

            <div className="flex flex-col gap-3 pb-8 px-1">
                {templates.map(t => (
                    <GlassCard
                        key={t.id}
                        variant="elevated"
                        className="flex flex-col gap-2 relative group tap-highlight cursor-pointer"
                        onClick={() => navigate(`/templates/${t.id}`)}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-xl text-primary tracking-tight pr-10">{t.name}</h3>
                            <button
                                onClick={(e) => handleDelete(e, t.id)}
                                className="absolute top-4 right-4 p-2 text-tertiary hover:text-red-400 hover:bg-black/20 focus:text-red-400 focus:bg-black/20 rounded-full transition-all tap-highlight"
                                aria-label="Delete routine"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <p className="text-[13px] text-secondary font-medium mt-1">{t.exerciseIds.length} exercises configured</p>
                    </GlassCard>
                ))}

                {templates.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-glass-inset rounded-3xl border border-glass-border/30 mt-4">
                        <LayoutList size={48} className="text-tertiary mb-4 opacity-50" />
                        <p className="font-medium text-primary text-lg tracking-tight">No routines found.</p>
                        <p className="text-[15px] text-secondary mt-1 max-w-[200px]">Create a new routine to save your favourite exercises.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
