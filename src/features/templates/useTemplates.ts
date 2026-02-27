import { create } from 'zustand';
import { Template } from '../../domain/models';
import { TemplateRepo } from '../../data/repositories';
import { sortTemplates } from '../../utils/templateUtils';

interface TemplateState {
    templates: Template[];
    isLoading: boolean;
    loadTemplates: () => Promise<void>;
    addTemplate: (name: string) => Promise<Template>;
    deleteTemplate: (id: string) => Promise<void>;
    addExercise: (templateId: string, exerciseId: string) => Promise<void>;
    removeExercise: (templateId: string, exerciseId: string) => Promise<void>;
}

export const useTemplates = create<TemplateState>((set, get) => ({
    templates: [],
    isLoading: false,
    loadTemplates: async () => {
        set({ isLoading: true });
        const data = await TemplateRepo.getAll();
        set({ templates: sortTemplates(data), isLoading: false });
    },
    addTemplate: async (name: string) => {
        const t = await TemplateRepo.add(name, []);
        set({ templates: [...get().templates, t] });
        return t;
    },
    deleteTemplate: async (id: string) => {
        await TemplateRepo.delete(id);
        set({ templates: get().templates.filter(t => t.id !== id) });
    },
    // Pure function state updates strictly matching DB
    addExercise: async (templateId: string, exerciseId: string) => {
        const newIds = await TemplateRepo.addExercise(templateId, exerciseId);
        set({
            templates: get().templates.map(t =>
                t.id === templateId ? { ...t, exerciseIds: newIds, updatedAt: Date.now() } : t
            )
        });
    },
    removeExercise: async (templateId: string, exerciseId: string) => {
        const newIds = await TemplateRepo.removeExercise(templateId, exerciseId);
        set({
            templates: get().templates.map(t =>
                t.id === templateId ? { ...t, exerciseIds: newIds, updatedAt: Date.now() } : t
            )
        });
    }
}));
