import { useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BODYPART_TO_REGIONS, REGION_PATHS_FRONT, REGION_PATHS_BACK } from './anatomyPaths';
import './anatomy.css';

interface BodyPartIconProps {
    bodyPart?: string;
    variant?: 'front' | 'back';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const SIZE_MAP = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
};

export function BodyPartIcon({
    bodyPart = '',
    variant = 'front',
    size = 'md',
    className
}: BodyPartIconProps) {
    const isFront = variant === 'front';
    const paths = isFront ? REGION_PATHS_FRONT : REGION_PATHS_BACK;

    const activeRegions = useMemo(() => {
        const normalized = bodyPart.toLowerCase().trim();
        return BODYPART_TO_REGIONS[normalized] || [];
    }, [bodyPart]);

    // If an unknown part like 'cardio', don't highlight anything but render body base
    const hasHighlight = activeRegions.length > 0;

    return (
        <svg
            viewBox="0 0 100 200"
            className={twMerge('anatomy-svg drop-shadow-sm', SIZE_MAP[size], className)}
            aria-label={`${bodyPart || 'Full'} body anatomy ${variant} view`}
            role="img"
        >
            <g className="anatomy-body-group">
                {Object.entries(paths).map(([regionId, d]) => {
                    const isHighlighted = activeRegions.includes(regionId);

                    return (
                        <path
                            key={regionId}
                            d={d}
                            className={clsx(
                                'anatomy-path',
                                isHighlighted ? 'highlight' : (hasHighlight ? '' : 'anatomy-path-neutral')
                            )}
                            data-region={regionId}
                        />
                    );
                })}
            </g>
        </svg>
    );
}
