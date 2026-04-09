import { useState, useCallback } from 'react';

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const DEFAULT_ZOOM = 1;

export const useMapInteraction = () => {
    const [position, setPosition] = useState({ coordinates: INDIA_CENTER, zoom: DEFAULT_ZOOM });

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        setPosition((pos) => ({
            ...pos,
            zoom: direction === 'in' ? Math.min(pos.zoom * 2, 8) : Math.max(pos.zoom / 2, 1)
        }));
    }, []);

    const handlePan = useCallback((coordinates: [number, number]) => {
        setPosition((pos) => ({ ...pos, coordinates }));
    }, []);

    const resetView = useCallback(() => {
        setPosition({ coordinates: INDIA_CENTER, zoom: DEFAULT_ZOOM });
    }, []);

    return {
        position,
        setPosition,
        handleZoom,
        handlePan,
        resetView
    };
};
