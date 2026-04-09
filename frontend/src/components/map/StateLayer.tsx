import React from 'react';
import { Geographies, Geography } from 'react-simple-maps';

interface StateLayerProps {
    topoJSON: any;
    hoveredState: string | null;
    selectedState: string | null;
    onStateHover: (stateId: string | null) => void;
    onStateClick: (stateId: string) => void;
}

const StateLayer: React.FC<StateLayerProps> = ({ topoJSON, selectedState, onStateHover, onStateClick }) => {
    return (
        <Geographies geography={topoJSON}>
            {({ geographies }) =>
                geographies.map((geo) => {
                    const stateName = geo.properties.st_nm || geo.properties.name;
                    const isSelected = selectedState === stateName;

                    return (
                        <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => onStateHover(stateName)}
                            onMouseLeave={() => onStateHover(null)}
                            onClick={() => onStateClick(stateName)}
                            className="state-path"
                            style={{
                                default: {
                                    fill: isSelected ? 'var(--state-hover)' : 'var(--state-default)',
                                    stroke: 'var(--state-border-default)',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    transition: 'all 200ms ease-in-out'
                                },
                                hover: {
                                    fill: 'var(--state-hover)',
                                    stroke: 'url(#state-glow-gradient)',
                                    strokeWidth: 1.5,
                                    outline: 'none',
                                    filter: 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.4))',
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease-in-out'
                                },
                                pressed: {
                                    fill: 'var(--state-hover)',
                                    stroke: '#4F46E5',
                                    strokeWidth: 2,
                                    outline: 'none'
                                }
                            }}
                        />
                    );
                })
            }
        </Geographies>
    );
};

export default StateLayer;
