import { Template } from '../domain/models';

export function sortTemplates(templates: Template[]): Template[] {
    const fixedOrder = ['one', 'two', 'three', 'four'];

    return [...templates].sort((a, b) => {
        const nameA = a.name.toLowerCase().trim();
        const nameB = b.name.toLowerCase().trim();

        const indexA = fixedOrder.indexOf(nameA);
        const indexB = fixedOrder.indexOf(nameB);

        // If both are in fixed order
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        // If only A is in fixed order, it comes first
        if (indexA !== -1) return -1;
        // If only B is in fixed order, it comes first
        if (indexB !== -1) return 1;

        // Fallback to alphabetical
        return nameA.localeCompare(nameB);
    });
}
