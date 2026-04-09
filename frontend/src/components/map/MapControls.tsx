import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className="map-controls">
            <button onClick={onZoomIn} title="Zoom In">
                <ZoomIn size={18} />
            </button>
            <button onClick={onZoomOut} title="Zoom Out">
                <ZoomOut size={18} />
            </button>
            <button onClick={onReset} title="Reset Map">
                <RefreshCw size={18} />
            </button>
        </div>
    );
};

export default MapControls;
