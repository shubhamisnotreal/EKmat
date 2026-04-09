import React, { useState, useEffect } from 'react';
import { ComposableMap, ZoomableGroup } from 'react-simple-maps';
import { AnimatePresence } from 'framer-motion';
import StateLayer from './StateLayer';
import CityLayer from './CityLayer';
import VotingNodeLayer from './VotingNodeLayer';
import MapControls from './MapControls';
import NodeTooltip from './NodeTooltip';
import BoothDetailsPanel from './BoothDetailsPanel';
import MapBreadcrumb from './MapBreadcrumb';
import { useMapInteraction } from '../../hooks/useMapInteraction';
import { useVotingNodes } from '../../hooks/useVotingNodes';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import indiaTopoJSON from '../../data/india-states.json';
import citiesData from '../../data/cities.json';
import votingBooths from '../../data/voting-booths.json';
import userLocation from '../../data/user-location.json';
import { VotingBooth, UserLocation } from './types';

import '../../styles/voting-map.css';

interface IndiaVotingMapProps {
    showLegend?: boolean;
    enableRealTime?: boolean;
    onBoothClick?: (boothId: string) => void;
}

const IndiaVotingMap: React.FC<IndiaVotingMapProps> = ({
    showLegend = true,
    enableRealTime = true,
    onBoothClick
}) => {
    const [viewLevel, setViewLevel] = useState<'india' | 'state' | 'city'>('india');
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<VotingBooth | null>(null);
    const [selectedBooth, setSelectedBooth] = useState<VotingBooth | null>(null);

    const { position, setPosition, handleZoom, resetView } = useMapInteraction();

    const { nodes, activeNodes, userBooth, updateNodes } = useVotingNodes(
        votingBooths as VotingBooth[],
        userLocation as UserLocation
    );

    const { realTimeData, isConnected } = useRealTimeUpdates(enableRealTime);

    useEffect(() => {
        if (enableRealTime && realTimeData) {
            updateNodes(realTimeData);
        }
    }, [realTimeData, enableRealTime, updateNodes]);

    // Calculate state's rough center for zoom logic 
    const getStateCenter = (stateId: string): [number, number] => {
        // Basic lookup for common states; normally would use bounding box calculate from TopoJSON
        const stateCenters: Record<string, [number, number]> = {
            'Maharashtra': [75.7139, 19.7515],
            'Uttar Pradesh': [80.9462, 26.8467],
            'Karnataka': [75.7139, 15.3173],
        };
        return stateCenters[stateId] || [78.9629, 20.5937]; // fallback to India center
    };

    const handleStateClick = (stateId: string) => {
        setSelectedState(stateId);
        setViewLevel('state');
        const [lon, lat] = getStateCenter(stateId);
        setPosition({ coordinates: [lon, lat], zoom: 4 });
    };

    const handleCityClick = (cityId: string) => {
        setSelectedCity(cityId);
        setViewLevel('city');
    };

    const handleBoothClick = (booth: VotingBooth) => {
        setSelectedBooth(booth);
        onBoothClick?.(booth.id);
    };

    const handleBackToIndia = () => {
        setViewLevel('india');
        setSelectedState(null);
        setSelectedCity(null);
        resetView();
    };

    const filterNodesByState = (allNodes: VotingBooth[], state: string | null) => {
        if (!state) return allNodes;
        return allNodes.filter(n => n.state === state);
    };

    return (
        <div className="voting-map-container">
            <MapBreadcrumb
                viewLevel={viewLevel}
                selectedState={selectedState}
                selectedCity={selectedCity}
                onBack={handleBackToIndia}
            />

            <MapControls
                onZoomIn={() => handleZoom('in')}
                onZoomOut={() => handleZoom('out')}
                onReset={handleBackToIndia}
            />

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 1000, center: [78.9629, 20.5937] }}
                className="voting-map"
                width={800}
                height={600}
            >
                <ZoomableGroup
                    center={position.coordinates}
                    zoom={position.zoom}
                    onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates, zoom: pos.zoom })}
                >
                    <defs>
                        <linearGradient id="map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="state-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                    </defs>
                    <rect fill="url(#map-gradient)" width="100%" height="100%" />

                    {(viewLevel === 'india' || viewLevel === 'state') && (
                        <StateLayer
                            topoJSON={indiaTopoJSON}
                            hoveredState={hoveredState}
                            selectedState={selectedState}
                            onStateHover={setHoveredState}
                            onStateClick={handleStateClick}
                        />
                    )}

                    {viewLevel !== 'india' && selectedState && (
                        <CityLayer
                            stateId={selectedState}
                            cities={(citiesData as any)[selectedState]}
                            hoveredCity={selectedCity}
                            onCityHover={setSelectedCity}
                            onCityClick={handleCityClick}
                        />
                    )}

                    <VotingNodeLayer
                        nodes={viewLevel === 'india' ? nodes : filterNodesByState(nodes, selectedState)}
                        activeNodes={activeNodes}
                        userBooth={userBooth}
                        hoveredNode={hoveredNode}
                        onNodeHover={setHoveredNode}
                        onNodeClick={handleBoothClick}
                        viewLevel={viewLevel}
                    />
                </ZoomableGroup>
            </ComposableMap>

            <AnimatePresence>
                {(hoveredState || hoveredNode) && (
                    <NodeTooltip state={hoveredState} node={hoveredNode} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedBooth && (
                    <BoothDetailsPanel
                        booth={selectedBooth}
                        onClose={() => setSelectedBooth(null)}
                    />
                )}
            </AnimatePresence>

            {showLegend && (
                <div className="map-legend">
                    <div className="legend-item">
                        <span className="legend-dot active"></span>
                        <span>Active Booths ({activeNodes.length})</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot inactive"></span>
                        <span>Inactive Booths</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot user"></span>
                        <span>Your Booth (Pune, Undri)</span>
                    </div>
                    {enableRealTime && (
                        <div className="legend-item live-indicator">
                            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                            <span>{isConnected ? 'Live' : 'Offline'}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IndiaVotingMap;
