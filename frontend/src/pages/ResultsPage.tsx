import React, { useEffect, useState } from 'react';
import { Users, Lock } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { theme } from '../styles/theme';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_RESULTS_ELECTIONS, DEMO_RESULTS_CHART_DATA } from '../data/demoData';
import { useOfficial } from '../context/OfficialContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.success];

const ResultsPage: React.FC = () => {
    const { provider } = useWeb3();
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { isDemoMode, toggleDemoMode } = useDemoMode();
    const { isOfficial } = useOfficial();
    const [elections, setElections] = useState<any[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isDemoMode) {
            setElections(DEMO_RESULTS_ELECTIONS);
            if (DEMO_RESULTS_ELECTIONS.length > 0 && !selectedElectionId) {
                setSelectedElectionId(DEMO_RESULTS_ELECTIONS[0].id);
            }
        } else if (contract) {
            fetchElections();
        }
    }, [contract, isDemoMode]);

    useEffect(() => {
        if (isDemoMode && selectedElectionId) {
            setChartData(DEMO_RESULTS_CHART_DATA[selectedElectionId] || []);
        } else if (contract && selectedElectionId) {
            fetchResults(selectedElectionId);
        }
    }, [contract, selectedElectionId, isDemoMode]);

    const fetchElections = async () => {
        try {
            console.log('[Results] Fetching elections...');
            // Get all election IDs from the contract
            const rawIds: any = await contract!.getElectionIds();
            const electionIds = Array.from(rawIds);
            console.log('[Results] Election IDs:', electionIds);

            // Fetch each election by its string ID
            const list = [];
            for (const id of electionIds) {
                try {
                    const election = await contract!.getElection(id);
                    list.push({
                        id: id,
                        name: election.name,
                        active: Boolean(election.active),
                        startTime: Number(election.startTime),
                        endTime: Number(election.endTime)
                    });
                } catch (e) {
                    console.error(`Failed to fetch election ${id}:`, e);
                }
            }

            console.log('[Results] Fetched elections:', list);
            setElections(list);
            if (list.length > 0 && !selectedElectionId) {
                setSelectedElectionId(String(list[0].id));
            }
        } catch (err) {
            console.error('[Results] Error fetching elections:', err);
        }
    };

    const fetchResults = async (electionId: string) => {
        setLoading(true);
        try {
            console.log('[Results] Fetching results for election:', electionId);
            const cands = await contract!.getCandidates(electionId);
            console.log('[Results] Candidates:', cands);
            const data = cands.map((c: any) => ({
                name: c.name,
                votes: Number(c.voteCount),
                party: c.party
            }));
            console.log('[Results] Chart data:', data);
            setChartData(data);
        } catch (err) {
            console.error('[Results] Error fetching results:', err);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = chartData.reduce((acc, curr) => acc + curr.votes, 0);

    return (
        <Layout>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-header-title">Election Results</h1>
                        <p className="page-header-subtitle">
                            Select an election to view candidate-wise vote counts, turnout and audit references.
                        </p>
                    </div>
                </div>
            </div>

            {!isOfficial ? (
                <Card style={{ padding: '4rem', textAlign: 'center', background: '#f7fafc', border: '2px dashed #cbd5e0', margin: '2rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#e2e8f0', borderRadius: '50%' }}>
                            <Lock size={48} color="#4a5568" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                        Restricted Access
                    </h2>
                    <p style={{ color: '#4a5568', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                        Election results are currently hidden from public view to prevent voter bias during the active voting period.
                        Results will be made public after the election concludes.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#718096', fontSize: '0.9rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <Users size={16} />
                        <span>Authorized Officials can login via the Navbar</span>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="page-section">
                        <Card style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Election Overview</h2>
                                <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>Viewing real-time results from the ledger.</p>
                            </div>
                            <select
                                value={selectedElectionId || ''}
                                onChange={e => setSelectedElectionId(e.target.value)}
                                style={{ padding: '10px', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}`, minWidth: '200px' }}
                            >
                                {elections.length === 0 && <option value="">No elections found</option>}
                                {elections.map(e => <option key={e.id} value={e.id}>{e.name} ({e.active ? 'Active' : 'Inactive'})</option>)}
                            </select>
                        </Card>
                    </div>

                    <div className="page-grid-2 page-section">
                        <Card style={{ padding: '2rem', minHeight: '400px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Vote Distribution</h3>
                            {loading ? <p>Loading...</p> : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="votes" fill={theme.colors.primary}>
                                            {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Card>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card style={{ padding: '2rem', textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Total Turnout</h3>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: theme.colors.primary }}>
                                    {totalVotes}
                                </div>
                                <p style={{ color: theme.colors.textSecondary }}>Votes Cast</p>
                            </Card>

                            <Card style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Transparency Resources</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '1rem' }}>
                                        <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}>📦 View Election Manifest (IPFS)</a>
                                    </li>
                                    <li style={{ marginBottom: '1rem' }}>
                                        <a href={`https://sepolia.etherscan.io/address/${EKMAT_VOTING_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: theme.colors.primary, textDecoration: 'none' }}>📜 View Smart Contract</a>
                                    </li>
                                    <li>
                                        <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}>🔒 Download Anonymized Vote Logs</a>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default ResultsPage;
