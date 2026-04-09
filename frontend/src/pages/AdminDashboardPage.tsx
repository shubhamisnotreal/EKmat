import React, { useState, useEffect, useMemo } from 'react';
import { useProvider } from '../hooks/useProvider';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/ToastProvider';
import { theme } from '../styles/theme';
import { api } from '../lib/api';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_ANALYTICS, DEMO_FRAUD_STATS } from '../data/demoData';
import { Server, Plus, ToggleLeft, ToggleRight, Upload, Users, BarChart3, PieChart as PieChartIcon, TrendingUp, Activity } from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area,
} from 'recharts';

const CHART_COLORS = [
    '#356AE6', '#3DC9B3', '#FFB700', '#D7263D', '#47D787',
    '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16',
];

// Animated counter hook
const useAnimatedCount = (target: number, duration = 1200) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
};

// Stat card component
const StatCard: React.FC<{ label: string; value: number; suffix?: string; icon: React.ReactNode; gradient: string }> = ({ label, value, suffix, icon, gradient }) => {
    const animated = useAnimatedCount(value);
    return (
        <div className="admin-stat-card" style={{ background: gradient }}>
            <div className="admin-stat-icon">{icon}</div>
            <div className="admin-stat-value">{animated}{suffix || ''}</div>
            <div className="admin-stat-label">{label}</div>
        </div>
    );
};

// Custom tooltip for charts
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="admin-chart-tooltip">
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label || payload[0]?.name}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || p.fill, margin: '2px 0' }}>
                    {p.name || 'Votes'}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    );
};

interface ElectionAnalytics {
    id: string;
    name: string;
    active: boolean;
    candidates: { name: string; voteCount: number }[];
    totalVotes: number;
}

const AdminDashboardPage: React.FC = () => {
    const { account } = useProvider();
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { showToast } = useToast();
    const { isDemoMode, toggleDemoMode } = useDemoMode();
    const [activeTab, setActiveTab] = useState('elections');
    const [loading, setLoading] = useState(false);

    // Data States
    const [elections, setElections] = useState<any[]>([]);
    const [fraudStats, setFraudStats] = useState<any>(null);
    const [networkInfo, setNetworkInfo] = useState<any>(null);

    // Analytics State
    const [analyticsData, setAnalyticsData] = useState<ElectionAnalytics[]>([]);
    const [selectedAnalyticsElection, setSelectedAnalyticsElection] = useState<string>('');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Forms
    const [newElectionName, setNewElectionName] = useState('');
    const [targetElectionId, setTargetElectionId] = useState('');
    const [newCandidateName, setNewCandidateName] = useState('');
    const [newCandidateParty, setNewCandidateParty] = useState('');
    const [newCandidateImage, setNewCandidateImage] = useState<File | null>(null);

    // Candidates listing
    const [viewElectionId, setViewElectionId] = useState('');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    useEffect(() => {
        if (contract) {
            fetchElections();
            api.analytics.getFraudStats().then(setFraudStats).catch(console.error);
        }
    }, [contract]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_chainId' }).then((id: string) => {
                setNetworkInfo({ chainId: id, name: 'Localhost / Sepolia' });
            });
        }
    }, []);

    // Fetch analytics when tab switches to analytics
    useEffect(() => {
        if (activeTab === 'analytics' && !isDemoMode && contract && analyticsData.length === 0) {
            fetchAnalyticsData();
        }
    }, [activeTab, contract, isDemoMode]);

    const fetchElections = async () => {
        try {
            const rawIds: any = await contract!.getElectionIds();
            const electionIds = Array.from(rawIds);
            const list = [];
            for (const id of electionIds) {
                try {
                    const election = await contract!.getElection(id);
                    const mappedElection = {
                        id: id,
                        name: election.name,
                        active: Boolean(election.active),
                        startTime: Number(election.startTime),
                        endTime: Number(election.endTime),
                        merkleRoot: election.merkleRoot,
                        manifestCid: election.manifestCid,
                        exists: Boolean(election.exists)
                    };
                    list.push(mappedElection);
                } catch (e) {
                    console.error(`Failed to fetch election ${id}:`, e);
                }
            }
            setElections(list);
        } catch (e) {
            console.error('Failed to fetch elections:', e);
        }
    };

    const fetchAnalyticsData = async () => {
        setAnalyticsLoading(true);
        try {
            const rawIds: any = await contract!.getElectionIds();
            const electionIds = Array.from(rawIds);
            const data: ElectionAnalytics[] = [];

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
                        candidates,
                        totalVotes,
                    });
                } catch (e) {
                    console.error(`Analytics: failed to fetch election ${id}:`, e);
                }
            }

            setAnalyticsData(data);
            if (data.length > 0 && !selectedAnalyticsElection) {
                setSelectedAnalyticsElection(data[0].id);
            }
        } catch (e) {
            console.error('Failed to fetch analytics:', e);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Effective analytics data (demo or live)
    const effectiveAnalytics = isDemoMode ? DEMO_ANALYTICS : analyticsData;
    const effectiveFraudStats = isDemoMode ? DEMO_FRAUD_STATS : fraudStats;

    // Derived analytics
    const totalElections = effectiveAnalytics.length;
    const totalVotes = useMemo(() => effectiveAnalytics.reduce((s, e) => s + e.totalVotes, 0), [effectiveAnalytics]);
    const activeElections = useMemo(() => effectiveAnalytics.filter(e => e.active).length, [effectiveAnalytics]);
    const avgTurnout = useMemo(() => {
        if (effectiveAnalytics.length === 0) return 0;
        return Math.round(totalVotes / effectiveAnalytics.length);
    }, [effectiveAnalytics, totalVotes]);

    // Pie chart data for selected election
    const pieData = useMemo(() => {
        const election = effectiveAnalytics.find(e => e.id === selectedAnalyticsElection);
        if (!election) return [];
        return election.candidates.map(c => ({ name: c.name, value: c.voteCount }));
    }, [effectiveAnalytics, selectedAnalyticsElection]);

    // Bar chart data (all elections)
    const barData = useMemo(() =>
        effectiveAnalytics.map(e => ({ name: e.name.length > 15 ? e.name.substring(0, 15) + '…' : e.name, votes: e.totalVotes, active: e.active ? 'Active' : 'Closed' })),
        [effectiveAnalytics]
    );

    // Simulated timeline data (illustrative: distributes current count across time slices)
    const timelineData = useMemo(() => {
        const election = effectiveAnalytics.find(e => e.id === selectedAnalyticsElection);
        if (!election || election.totalVotes === 0) return [];
        const points = 12;
        const result = [];
        let cumul = 0;
        for (let i = 1; i <= points; i++) {
            const fraction = (i / points);
            const sCurve = 1 / (1 + Math.exp(-10 * (fraction - 0.5)));
            const target = Math.round(election.totalVotes * sCurve);
            cumul = target;
            result.push({ hour: `T${i}`, votes: cumul });
        }
        return result;
    }, [effectiveAnalytics, selectedAnalyticsElection]);

    // Auto-select first election for demo mode
    useEffect(() => {
        if (isDemoMode && effectiveAnalytics.length > 0 && !effectiveAnalytics.find(e => e.id === selectedAnalyticsElection)) {
            setSelectedAnalyticsElection(effectiveAnalytics[0].id);
        }
    }, [isDemoMode, effectiveAnalytics]);

    const createElection = async () => {
        if (!newElectionName) return;
        setLoading(true);
        try {
            const electionId = newElectionName.toLowerCase().replace(/\s+/g, '-');
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + (7 * 24 * 60 * 60);
            const merkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            const manifestCid = '';
            const tx = await contract!.createElection(electionId, newElectionName, startTime, endTime, merkleRoot, manifestCid);
            await tx.wait();
            showToast('Election created successfully', 'success');
            fetchElections();
            setNewElectionName('');
        } catch (err: any) {
            console.error('Error creating election:', err);
            showToast(err.reason || err.message || 'Failed to create election', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleElection = async (electionId: string, currentActive: boolean) => {
        try {
            const isAdmin = await contract!.isAdmin(account);
            if (!isAdmin) {
                showToast('❌ Only admin wallet can toggle elections.', 'error');
                return;
            }
        } catch (err) {
            console.error('Error checking admin status:', err);
        }
        setLoading(true);
        try {
            const tx = await contract!.toggleElectionActive(electionId, !currentActive);
            await tx.wait();
            showToast('Election status updated', 'success');
            await fetchElections();
        } catch (err: any) {
            console.error('Error toggling election:', err);
            showToast(err.reason || err.message || 'Failed to toggle election', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async (electionId: string) => {
        if (!electionId) { setCandidates([]); return; }
        setLoadingCandidates(true);
        try {
            const cands = await contract!.getCandidates(electionId);
            const formatted = cands.map((c: any, index: number) => ({
                id: c.id || c.candidateId || index,
                name: c.name,
                party: c.party,
                ipfsCid: c.ipfsCid,
                voteCount: Number(c.voteCount)
            }));
            setCandidates(formatted);
        } catch (err: any) {
            console.error('Error fetching candidates:', err);
            showToast(err.message || 'Failed to fetch candidates', 'error');
            setCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const addCandidate = async () => {
        if (!targetElectionId || !newCandidateName || !newCandidateParty || !newCandidateImage) {
            showToast('Please fill all fields including election ID', 'error');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', newCandidateImage);
            const ipfsRes = await api.ipfs.uploadFile(formData);
            if (!ipfsRes.success) throw new Error('IPFS Upload failed');
            const cid = ipfsRes.ipfsHash;
            const candidateId = newCandidateName.toLowerCase().replace(/\s+/g, '-');
            const tx = await contract!.addCandidate(targetElectionId, candidateId, newCandidateName, cid);
            await tx.wait();
            showToast('Candidate added successfully', 'success');
            setNewCandidateName('');
            setNewCandidateParty('');
            setNewCandidateImage(null);
            setTargetElectionId('');
        } catch (err: any) {
            console.error('Error adding candidate:', err);
            showToast(err.reason || err.message || 'Failed to add candidate', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!account && !isDemoMode) {
        return (
            <Layout>
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <h2>Please connect wallet to access Admin Dashboard</h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        <button className="demo-toggle-btn" onClick={toggleDemoMode}>
                            Or try Demo Mode →
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Admin Control Panel</h1>
                <p className="page-header-subtitle">
                    Create and manage elections, candidates and monitor fraud analytics for the EkMat platform.
                </p>
            </div>

            <div className="page-section">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {['elections', 'candidates', 'analytics', 'system'].map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'primary' : 'outline'}
                            onClick={() => setActiveTab(tab)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* ===== ELECTIONS TAB ===== */}
                {activeTab === 'elections' && (
                    <div className="page-grid-2">
                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={20} /> Create Election
                            </h3>
                            <input
                                placeholder="Election Name"
                                value={newElectionName}
                                onChange={e => setNewElectionName(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                            />
                            <Button onClick={createElection} disabled={loading} fullWidth>
                                {loading ? 'Creating...' : 'Create Election'}
                            </Button>
                        </Card>

                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Existing Elections</h3>
                            {elections.map(e => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: `1px solid ${theme.colors.gray200}` }}>
                                    <div>
                                        <strong>ID {e.id}: {e.name}</strong>
                                        <div style={{ fontSize: '0.8rem', color: e.active ? theme.colors.success : theme.colors.textSecondary }}>
                                            {e.active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => toggleElection(e.id, e.active)} disabled={loading}>
                                        {e.active ? <ToggleRight color={theme.colors.success} /> : <ToggleLeft />}
                                    </Button>
                                </div>
                            ))}
                            {elections.length === 0 && <p>No elections found.</p>}
                        </Card>
                    </div>
                )}

                {/* ===== CANDIDATES TAB ===== */}
                {activeTab === 'candidates' && (
                    <Card style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Add Candidate
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Select Election ID</label>
                            <input
                                type="text"
                                placeholder="Enter election ID (e.g., '34')"
                                value={targetElectionId}
                                onChange={e => setTargetElectionId(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginTop: '0.5rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                            />
                        </div>

                        <input
                            placeholder="Candidate Name"
                            value={newCandidateName}
                            onChange={e => setNewCandidateName(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                        />
                        <input
                            placeholder="Party / Affiliation"
                            value={newCandidateParty}
                            onChange={e => setNewCandidateParty(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                        />

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate Photo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button variant="outline" size="sm" style={{ position: 'relative' }}>
                                    <Upload size={16} style={{ marginRight: '5px' }} /> Upload
                                    <input
                                        type="file"
                                        onChange={e => setNewCandidateImage(e.target.files ? e.target.files[0] : null)}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                </Button>
                                <span>{newCandidateImage ? newCandidateImage.name : 'No file chosen'}</span>
                            </div>
                        </div>

                        <Button onClick={addCandidate} disabled={loading} fullWidth>
                            {loading ? 'Adding...' : 'Add Candidate'}
                        </Button>

                        {/* View Existing Candidates Section */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `2px solid ${theme.colors.gray200}` }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>View Existing Candidates</h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Enter Election ID to View Candidates</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter election ID (e.g., '34')"
                                        value={viewElectionId}
                                        onChange={e => setViewElectionId(e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                                    />
                                    <Button onClick={() => fetchCandidates(viewElectionId)} disabled={loadingCandidates}>
                                        {loadingCandidates ? 'Loading...' : 'Load'}
                                    </Button>
                                </div>
                            </div>

                            {candidates.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: theme.colors.textSecondary }}>
                                        Candidates for Election "{viewElectionId}" ({candidates.length})
                                    </h4>
                                    {candidates.map((candidate, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '1rem',
                                                marginBottom: '0.5rem',
                                                border: `1px solid ${theme.colors.gray200}`,
                                                borderRadius: theme.borderRadius.md,
                                                background: theme.colors.gray100
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <strong style={{ fontSize: '1.1rem' }}>{candidate.name}</strong>
                                                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                        {candidate.party}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: theme.colors.gray500, marginTop: '0.5rem' }}>
                                                        ID: {candidate.id}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.85rem', color: theme.colors.gray500 }}>Votes</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                                        {candidate.voteCount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {candidates.length === 0 && viewElectionId && !loadingCandidates && (
                                <p style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: '1rem' }}>
                                    No candidates found for this election.
                                </p>
                            )}
                        </div>
                    </Card>
                )}

                {/* ===== ANALYTICS TAB (OVERHAULED) ===== */}
                {activeTab === 'analytics' && (
                    <div className="admin-analytics">
                        {/* Demo / Live Toggle */}
                        <div className="demo-toggle-container">
                            <span className="demo-toggle-label">{isDemoMode ? '🎭 Demo Data' : '⛓️ Live Blockchain'}</span>
                            <button
                                className={`demo-toggle-switch ${isDemoMode ? 'demo-toggle-active' : ''}`}
                                onClick={toggleDemoMode}
                                title={isDemoMode ? 'Switch to Live data' : 'Switch to Demo data'}
                            >
                                <span className="demo-toggle-knob" />
                            </button>
                        </div>

                        {/* Summary Stat Cards */}
                        <div className="admin-stats-grid">
                            <StatCard
                                label="Total Elections"
                                value={totalElections}
                                icon={<BarChart3 size={24} />}
                                gradient="linear-gradient(135deg, #356AE6 0%, #6C63FF 100%)"
                            />
                            <StatCard
                                label="Total Votes Cast"
                                value={totalVotes}
                                icon={<Activity size={24} />}
                                gradient="linear-gradient(135deg, #3DC9B3 0%, #06B6D4 100%)"
                            />
                            <StatCard
                                label="Active Elections"
                                value={activeElections}
                                icon={<TrendingUp size={24} />}
                                gradient="linear-gradient(135deg, #47D787 0%, #059669 100%)"
                            />
                            <StatCard
                                label="Avg. Votes / Election"
                                value={avgTurnout}
                                icon={<PieChartIcon size={24} />}
                                gradient="linear-gradient(135deg, #FFB700 0%, #F97316 100%)"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="admin-charts-grid">
                            {/* Pie Chart: Vote Distribution */}
                            <Card style={{ padding: '1.5rem' }}>
                                <div className="admin-chart-header">
                                    <h3>Vote Distribution</h3>
                                    <select
                                        value={selectedAnalyticsElection}
                                        onChange={e => setSelectedAnalyticsElection(e.target.value)}
                                        className="admin-chart-select"
                                    >
                                        {effectiveAnalytics.map(e => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {analyticsLoading ? (
                                    <div className="admin-chart-placeholder">Loading chart data...</div>
                                ) : pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={110}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {pieData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-chart-placeholder">
                                        No vote data for this election yet.
                                    </div>
                                )}
                            </Card>

                            {/* Area Chart: Vote Timeline */}
                            <Card style={{ padding: '1.5rem' }}>
                                <div className="admin-chart-header">
                                    <h3>Vote Accumulation Timeline</h3>
                                    <span className="admin-chart-badge">Simulated</span>
                                </div>
                                {timelineData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={timelineData}>
                                            <defs>
                                                <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#356AE6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#356AE6" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                            <XAxis dataKey="hour" stroke="#A0AEC0" fontSize={12} />
                                            <YAxis stroke="#A0AEC0" fontSize={12} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="votes"
                                                stroke="#356AE6"
                                                strokeWidth={2}
                                                fill="url(#voteGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-chart-placeholder">
                                        Select an election with votes to view timeline.
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Full-Width Bar Chart */}
                        <Card style={{ padding: '1.5rem' }}>
                            <div className="admin-chart-header">
                                <h3>Election Comparison</h3>
                                <span className="admin-chart-badge">{effectiveAnalytics.length} Elections</span>
                            </div>
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis type="number" stroke="#A0AEC0" fontSize={12} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" stroke="#A0AEC0" fontSize={12} width={140} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="votes" name="Total Votes" radius={[0, 6, 6, 0]} barSize={28}>
                                            {barData.map((_entry, index) => (
                                                <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="admin-chart-placeholder">
                                    No election data available yet.
                                </div>
                            )}
                        </Card>

                        {/* Fraud / Security Stats */}
                        <div className="admin-charts-grid">
                            <Card style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🛡️ Suspicious Activity
                                </h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme.colors.warning }}>
                                    {effectiveFraudStats?.stats ? Object.keys(effectiveFraudStats.stats.suspiciousIPs || {}).length : 0}
                                </div>
                                <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>Blocked IP Attempts</p>
                            </Card>
                            <Card style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🔐 Failed Proofs
                                </h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme.colors.error }}>
                                    {effectiveFraudStats?.stats?.failedZkpGenerations || 0}
                                </div>
                                <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>Invalid ZK Proof Submissions</p>
                            </Card>
                        </div>

                        <Button onClick={fetchAnalyticsData} disabled={analyticsLoading} style={{ marginTop: '1rem' }}>
                            {analyticsLoading ? 'Refreshing...' : '🔄 Refresh Analytics'}
                        </Button>
                    </div>
                )}

                {/* ===== SYSTEM TAB ===== */}
                {activeTab === 'system' && (
                    <Card style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Server size={20} /> System Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Network:</span>
                                <strong>{networkInfo?.name || 'Unknown'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Chain ID:</span>
                                <strong>{networkInfo?.chainId || '-'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Contract Address:</span>
                                <span style={{ fontFamily: 'monospace' }}>{EKMAT_VOTING_ADDRESS}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>System Health:</span>
                                <span style={{ color: theme.colors.success, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.success }}></div>
                                    Operational
                                </span>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboardPage;
