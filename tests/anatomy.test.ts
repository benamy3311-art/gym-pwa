import { describe, it, expect } from 'vitest';
import { BODYPART_TO_REGIONS, REGION_PATHS_FRONT, REGION_PATHS_BACK } from '../src/ui/anatomy/anatomyPaths';

describe('Anatomy Highlight System', () => {
    it('should map chest correctly to front regions', () => {
        const regions = BODYPART_TO_REGIONS['chest'];
        expect(regions).toBeDefined();
        expect(regions).toContain('chest');

        // Verify path exists
        expect(REGION_PATHS_FRONT['chest']).toBeDefined();
    });

    it('should map complex parts like legs to multiple regions', () => {
        const regions = BODYPART_TO_REGIONS['legs'];
        expect(regions).toBeDefined();
        expect(regions).toContain('quadsFront');
        expect(regions).toContain('hamstringsBack');
        expect(regions).toContain('calvesBack');

        expect(REGION_PATHS_FRONT['quadsFront']).toBeDefined();
        expect(REGION_PATHS_BACK['hamstringsBack']).toBeDefined();
        expect(REGION_PATHS_BACK['calvesBack']).toBeDefined();
    });

    it('should handle fullbody by mapping to all major regions', () => {
        const regions = BODYPART_TO_REGIONS['fullbody'];
        expect(regions.length).toBeGreaterThan(10);
        expect(regions).toContain('chest');
        expect(regions).toContain('latsBack');
        expect(regions).toContain('quadsFront');
    });

    it('should return undefined for unknown body parts', () => {
        expect(BODYPART_TO_REGIONS['unknown_part']).toBeUndefined();
        expect(BODYPART_TO_REGIONS['cardio']).toBeUndefined();
    });
});
