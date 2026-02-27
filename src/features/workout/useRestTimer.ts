import { useEffect } from 'react';
import { useRestStore } from './restStore';

export function useRestTimer() {
    const { isActive, tick } = useRestStore();

    useEffect(() => {
        if (!isActive) return;

        // Use a robust interval to check time elapsed against Date.now()
        // 250ms interval ensures smooth UI ticking and handles visual updates
        const interval = setInterval(() => {
            tick(Date.now());
        }, 250);

        return () => clearInterval(interval);
    }, [isActive, tick]);

    // Return the store state if components want to use it directly
    return useRestStore();
}
