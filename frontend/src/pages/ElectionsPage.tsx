import React, { useEffect, useState, useMemo } from 'react';
import { useContract } from '../hooks/useContract';
import { useProvider } from '../hooks/useProvider';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_ELECTIONS } from '../data/demoData';
import { Vote, Clock, CheckCircle2, CalendarDays, Users, BarChart3, ArrowRight } from 'lucide-react';

interface ElectionData {
    id: string;
    name: string;
    active: boolean;
    startTime: number;
    endTime: number;
    candidateCount: number;
    totalVotes: number;
    candidates: { name: string; voteCount: number }[];
}

type ElectionStatus = 'active' | 'upcoming' | 'completed';

const getStatus = (election: ElectionData): ElectionStatus => {
    const now = Math.floor(Date.now() / 1000);
    if (election.active && now >= election.startTime && now <= election.endTime) return 'active';
    if (now < election.startTime) return 'upcoming';
    return 'completed';
};

const formatDate = (ts: number) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

// Countdown component
const Countdown: React.FC<{ targetTimestamp: number }> = ({ targetTimestamp }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const update = () => {
            const now = Math.floor(Date.now() / 1000);
            const diff = targetTimestamp - now;
            if (diff <= 0) { setTimeLeft('Starting soon...'); return; }
            const days = Math.floor(diff / 86400);
            const hours = Math.floor((diff % 86400) / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            const secs = diff % 60;
            setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetTimestamp]);

    return <span className="election-countdown">{timeLeft}</span>;
};

// Mini horizontal bar chart for vote preview
const MiniVoteBar: React.FC<{ candidates: { name: string; voteCount: number }[] }> = ({ candidates }) => {
    const total = candidates.reduce((s, c) => s + c.voteCount, 0);
    if (total === 0) return <div className="election-mini-bar-empty">No votes yet</div>;

    const colors = ['#356AE6', '#3DC9B3', '#FFB700', '#D7263D', '#47D787', '#8B5CF6', '#EC4899'];

    return (
        <div className="election-mini-bar-container">
            <div className="election-mini-bar">
                {candidates.map((c, i) => {
                    const pct = (c.voteCount / total) * 100;
                    if (pct < 1) return null;
                    return (
                        <div
                            key={i}
                            className="election-mini-bar-segment"
                            style={{
                                width: `${pct}%`,
                                backgroundColor: colors[i % colors.length],
                            }}
                            title={`${c.name}: ${c.voteCount} votes (${pct.toFixed(1)}%)`}
                        />
                    );
                })}
            </div>
            <div className="election-mini-bar-legend">
                {candidates.slice(0, 4).map((c, i) => (
                    <span key={i} className="election-mini-bar-legend-item">
                        <span className="election-mini-bar-dot" style={{ backgroundColor: colors[i % colors.length] }} />
                        {c.name}
                    </span>
                ))}
                {candidates.length > 4 && <span className="election-mini-bar-legend-item">+{candidates.length - 4} more</span>}
            </div>
        </div>
    );
};

// Status badge
const StatusBadge: React.FC<{ status: ElectionStatus }> = ({ status }) => {
    const config = {
        active: { label: '● Live', className: 'election-badge-active' },
        upcoming: { label: '◷ Upcoming', className: 'election-badge-upcoming' },
        completed: { label: '✓ Completed', className: 'election-badge-completed' },
    };
    const { label, className } = config[status];
    return <span className={`election-badge ${className}`}>{label}</span>;
};

const ElectionsPage: React.FC = () => {
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { provider } = useProvider();
    const { isDemoMode, toggleDemoMode } = useDemoMode();
    const [elections, setElections] = useState<ElectionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | ElectionStatus>('all');

    useEffect(() => {
        if (isDemoMode) {
            setElections(DEMO_ELECTIONS);
            setLoading(false);
        } else if (contract) {
            fetchAllElections();
        }
    }, [contract, isDemoMode]);

    const fetchAllElections = async () => {
        setLoading(true);
        try {
            const rawIds: any = await contract!.getElectionIds();
            const electionIds = Array.from(rawIds);
            const data: ElectionData[] = [];

            for (const id of electionIds) {
                try {
                    const election = await contract!.getElection(id);
                    const cands = await contract!.getCandidates(id);
                    const candidates = cands.map((c: any) => ({
                        name: c.name,
                        voteCount: Number(c.voteCount),
                    }));
                    const totalVotes = candidates.reduce((s: number, c: any) => s + c.voteCount, 0);

                    data.push({
                        id: String(id),
                        name: String(election.name),
                        active: Boolean(election.active),
                        startTime: Number(election.startTime),
                        endTime: Number(election.endTime),
                        candidateCount: candidates.length,
                        totalVotes,
                        candidates,
                    });
                } catch (e) {
                    console.error(`Failed to fetch election ${id}:`, e);
                }
            }
            setElections(data);
        } catch (err) {
            console.error('Failed to fetch elections:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredElections = useMemo(() => {
        if (filter === 'all') return elections;
        return elections.filter(e => getStatus(e) === filter);
    }, [elections, filter]);

    const grouped = useMemo(() => {
        const active = filteredElections.filter(e => getStatus(e) === 'active');
        const upcoming = filteredElections.filter(e => getStatus(e) === 'upcoming');
        const completed = filteredElections.filter(e => getStatus(e) === 'completed');
        return { active, upcoming, completed };
    }, [filteredElections]);

    const counts = useMemo(() => ({
        all: elections.length,
        active: elections.filter(e => getStatus(e) === 'active').length,
        upcoming: elections.filter(e => getStatus(e) === 'upcoming').length,
        completed: elections.filter(e => getStatus(e) === 'completed').length,
    }), [elections]);

    const renderElectionCard = (election: ElectionData) => {
        const status = getStatus(election);
        return (
            <div key={election.id} className="election-card">
                <div className="election-card-top">
                    <StatusBadge status={status} />
                    <span className="election-card-id">#{election.id}</span>
                </div>

                <h3 className="election-card-name">{election.name}</h3>

                <div className="election-card-dates">
                    <div className="election-card-date">
                        <CalendarDays size={14} />
                        <span>Start: {formatDate(election.startTime)}</span>
                    </div>
                    <div className="election-card-date">
                        <Clock size={14} />
                        <span>End: {formatDate(election.endTime)}</span>
                    </div>
                </div>

                {status === 'upcoming' && (
                    <div className="election-card-countdown">
                        <span>Starts in:</span>
                        <Countdown targetTimestamp={election.startTime} />
                    </div>
                )}

                <div className="election-card-stats">
                    <div className="election-card-stat">
                        <Users size={16} />
                        <span>{election.candidateCount} Candidates</span>
                    </div>
                    <div className="election-card-stat">
                        <BarChart3 size={16} />
                        <span>{election.totalVotes} Votes</span>
                    </div>
                </div>

                {(status === 'active' || status === 'completed') && election.candidates.length > 0 && (
                    <MiniVoteBar candidates={election.candidates} />
                )}

                <div className="election-card-action">
                    {status === 'active' && (
                        <Link to="/vote" style={{ textDecoration: 'none', width: '100%' }}>
                            <Button fullWidth>
                                <Vote size={16} style={{ marginRight: '6px' }} />
                                Vote Now
                                <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                            </Button>
                        </Link>
                    )}
                    {status === 'completed' && (
                        <Link to="/results" style={{ textDecoration: 'none', width: '100%' }}>
                            <Button variant="outline" fullWidth>
                                <CheckCircle2 size={16} style={{ marginRight: '6px' }} />
                                View Results
                                <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                            </Button>
                        </Link>
                    )}
                    {status === 'upcoming' && (
                        <Button variant="outline" fullWidth disabled>
                            <Clock size={16} style={{ marginRight: '6px' }} />
                            Not Yet Open
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const renderSection = (title: string, icon: React.ReactNode, items: ElectionData[], emptyMsg: string) => {
        if (items.length === 0 && filter !== 'all') return null;
        return (
            <div className="election-section">
                <h2 className="election-section-title">
                    {icon}
                    {title}
                    <span className="election-section-count">{items.length}</span>
                </h2>
                {items.length > 0 ? (
                    <div className="election-cards-grid">
                        {items.map(renderElectionCard)}
                    </div>
                ) : (
                    <Card style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: theme.colors.textSecondary }}>{emptyMsg}</p>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-header-title">Elections</h1>
                        <p className="page-header-subtitle">
                            Browse all elections on the EkMat platform — active, upcoming, and completed.
                            Your vote is protected by Zero-Knowledge Proofs.
                        </p>
                    </div>
                    <div className="demo-toggle-container">
                        <span className="demo-toggle-label">{isDemoMode ? '🎭 Demo' : '⛓️ Live'}</span>
                        <button
                            className={`demo-toggle-switch ${isDemoMode ? 'demo-toggle-active' : ''}`}
                            onClick={toggleDemoMode}
                            title={isDemoMode ? 'Switch to Live data' : 'Switch to Demo data'}
                        >
                            <span className="demo-toggle-knob" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="page-section">
                {/* Filter Bar */}
                <div className="election-filters">
                    {(['all', 'active', 'upcoming', 'completed'] as const).map(f => (
                        <button
                            key={f}
                            className={`election-filter-btn ${filter === f ? 'election-filter-active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="election-filter-count">{counts[f]}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="election-loading">
                        <div className="election-spinner" />
                        <p>Fetching elections from the blockchain...</p>
                    </div>
                ) : elections.length === 0 ? (
                    <Card style={{ padding: '3rem', textAlign: 'center' }}>
                        <Vote size={48} color={theme.colors.gray400} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Elections Found</h3>
                        <p style={{ color: theme.colors.textSecondary }}>
                            No elections have been created on the blockchain yet. Check back later or connect to the right network.
                        </p>
                    </Card>
                ) : (
                    <>
                        {(filter === 'all' || filter === 'active') &&
                            renderSection('Active Elections', <Vote size={22} color={theme.colors.success} />, grouped.active, 'No active elections right now.')
                        }
                        {(filter === 'all' || filter === 'upcoming') &&
                            renderSection('Upcoming Elections', <Clock size={22} color={theme.colors.primary} />, grouped.upcoming, 'No upcoming elections scheduled.')
                        }
                        {(filter === 'all' || filter === 'completed') &&
                            renderSection('Completed Elections', <CheckCircle2 size={22} color={theme.colors.gray500} />, grouped.completed, 'No completed elections yet.')
                        }
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ElectionsPage;
