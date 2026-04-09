import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface MapBreadcrumbProps {
    viewLevel: 'india' | 'state' | 'city';
    selectedState: string | null;
    selectedCity: string | null;
    onBack: () => void;
}

const MapBreadcrumb: React.FC<MapBreadcrumbProps> = ({ viewLevel, selectedState, selectedCity, onBack }) => {
    return (
        <div className="map-breadcrumb">
            <button onClick={onBack} className="breadcrumb-btn" disabled={viewLevel === 'india'}>
                <Home size={14} />
                <span>India</span>
            </button>

            {viewLevel !== 'india' && selectedState && (
                <>
                    <ChevronRight size={14} className="breadcrumb-sep" />
                    <button
                        onClick={viewLevel === 'city' ? () => onBack() : undefined} // simplified for demo
                        className={`breadcrumb-btn ${viewLevel === 'state' ? 'active' : ''}`}
                        disabled={viewLevel === 'state'}
                    >
                        {selectedState}
                    </button>
                </>
            )}

            {viewLevel === 'city' && selectedCity && (
                <>
                    <ChevronRight size={14} className="breadcrumb-sep" />
                    <span className="breadcrumb-text active">{selectedCity}</span>
                </>
            )}
        </div>
    );
};

export default MapBreadcrumb;
