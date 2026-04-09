import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Users, Info, Clock, CheckCircle } from 'lucide-react';
import { VotingBooth } from './types';

interface BoothDetailsPanelProps {
    booth: VotingBooth;
    onClose: () => void;
}

const BoothDetailsPanel: React.FC<BoothDetailsPanelProps> = ({ booth, onClose }) => {
    const isUserBooth = booth.id === 'MH-PUNE-UNDRI-001';

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="booth-details-panel"
        >
            <div className="panel-header">
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {booth.name}
                        {isUserBooth && <span className="badge user-badge">Your Booth</span>}
                    </h3>
                    <span className={`badge ${boothsStatusColor(booth.status)}`}>
                        {booth.status.toUpperCase()}
                    </span>
                </div>
                <button onClick={onClose} className="close-btn" aria-label="Close">
                    <X size={20} />
                </button>
            </div>

            <div className="panel-body">
                <div className="info-row">
                    <MapPin size={16} className="info-icon" />
                    <div>
                        <strong>Address</strong>
                        <p>{booth.address}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <Users size={16} />
                        <div className="stat-value">{booth.totalVotes.toLocaleString()}</div>
                        <div className="stat-label">Votes Cast</div>
                    </div>
                    <div className="stat-card">
                        <CheckCircle size={16} />
                        <div className="stat-value">{booth.capacity.toLocaleString()}</div>
                        <div className="stat-label">Capacity</div>
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-row">
                        <Clock size={16} className="info-icon" />
                        <div>
                            <strong>Timings</strong>
                            <p>{booth.timings.open} - {booth.timings.close}</p>
                        </div>
                    </div>
                    <div className="info-row">
                        <Info size={16} className="info-icon" />
                        <div>
                            <strong>Facilities</strong>
                            <p>{booth.facilities.join(', ')}</p>
                        </div>
                    </div>
                </div>

                <button className="navigate-btn">
                    Navigate to Booth
                </button>
            </div>
        </motion.div>
    );
};

const boothsStatusColor = (status: string) => {
    if (status === 'active') return 'status-active';
    if (status === 'inactive') return 'status-inactive';
    return 'status-upcoming';
};

export default BoothDetailsPanel;
