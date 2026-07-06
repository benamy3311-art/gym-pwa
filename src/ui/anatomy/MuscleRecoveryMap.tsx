import { CSSProperties } from 'react';
import { BODYPART_TO_REGIONS, REGION_PATHS_FRONT, REGION_PATHS_BACK } from './anatomyPaths';
import { BodyPartRecency, MUSCLE_BODY_PARTS, MuscleBodyPart } from '../../domain/recovery';
import './anatomy.css';

// Invert BODYPART_TO_REGIONS for the tracked muscle groups only
// (skips 'fullbody' and any region not owned by one of the 7 parts).
const REGION_OWNER: Record<string, MuscleBodyPart> = {};
for (const part of MUSCLE_BODY_PARTS) {
    for (const region of BODYPART_TO_REGIONS[part] || []) {
        REGION_OWNER[region] = part;
    }
}

/**
 * Recency tier -> inline fill style.
 * 0-1 days: full accent; 2-3 days: ~55%; 4-6 days: ~25%;
 * 7+ days or never trained: undefined (falls back to the muted anatomy base fill).
 */
function tierStyle(days: number | null | undefined): CSSProperties | undefined {
    if (days === null || days === undefined || days >= 7) return undefined;
    if (days <= 1) return { fill: 'var(--accent)', fillOpacity: 1 };
    if (days <= 3) return { fill: 'var(--accent)', fillOpacity: 0.55 };
    return { fill: 'var(--accent)', fillOpacity: 0.25 };
}

function BodySilhouette({ paths, recency, label }: {
    paths: Record<string, string>;
    recency: BodyPartRecency;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg
                viewBox="0 0 100 200"
                className="anatomy-svg h-44 w-auto"
                role="img"
                aria-label={`${label} muscle recovery view`}
            >
                <g>
                    {Object.entries(paths).map(([regionId, d]) => {
                        const owner = REGION_OWNER[regionId];
                        const style = owner ? tierStyle(recency[owner]) : undefined;
                        return (
                            <path
                                key={regionId}
                                d={d}
                                className="anatomy-path"
                                style={style}
                                data-region={regionId}
                            />
                        );
                    })}
                </g>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{label}</span>
        </div>
    );
}

const LEGEND: { label: string; style: CSSProperties }[] = [
    { label: '0–1d', style: { backgroundColor: 'var(--accent)' } },
    { label: '2–3d', style: { backgroundColor: 'var(--accent)', opacity: 0.55 } },
    { label: '4–6d', style: { backgroundColor: 'var(--accent)', opacity: 0.25 } },
    { label: 'Rested', style: { backgroundColor: 'rgba(255,255,255,0.25)' } },
];

export function MuscleRecoveryMap({ recency }: { recency: BodyPartRecency }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-center gap-10">
                <BodySilhouette paths={REGION_PATHS_FRONT} recency={recency} label="Front" />
                <BodySilhouette paths={REGION_PATHS_BACK} recency={recency} label="Back" />
            </div>
            <div className="flex items-center justify-center gap-4">
                {LEGEND.map(item => (
                    <span key={item.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={item.style} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
