// ============================================================
// Demo Data — Indian Election Context
// ============================================================

export interface DemoCandidate {
    name: string;
    voteCount: number;
}

export interface DemoCandidateFull {
    id: number;
    name: string;
    party: string;
    ipfsCid: string;
    voteCount: number;
}

export interface DemoElection {
    id: string;
    name: string;
    active: boolean;
    startTime: number;
    endTime: number;
    candidateCount: number;
    totalVotes: number;
    candidates: DemoCandidate[];
}

export interface DemoElectionFull {
    id: string;
    name: string;
    active: boolean;
    startTime: number;
    endTime: number;
    merkleRoot: string;
    candidatesFull: DemoCandidateFull[];
}

export interface DemoElectionAnalytics {
    id: string;
    name: string;
    active: boolean;
    candidates: DemoCandidate[];
    totalVotes: number;
}

const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

// ── Full candidate data (with party) ─────────────────────────

const LOK_SABHA_CANDIDATES: DemoCandidateFull[] = [
    { id: 0, name: 'Narendra Modi', party: 'Bharatiya Janata Party (BJP)', ipfsCid: '', voteCount: 18_420 },
    { id: 1, name: 'Rahul Gandhi', party: 'Indian National Congress (INC)', ipfsCid: '', voteCount: 14_310 },
    { id: 2, name: 'Arvind Kejriwal', party: 'Aam Aadmi Party (AAP)', ipfsCid: '', voteCount: 8_750 },
    { id: 3, name: 'Akhilesh Yadav', party: 'Samajwadi Party (SP)', ipfsCid: '', voteCount: 4_280 },
    { id: 4, name: 'Mayawati', party: 'Bahujan Samaj Party (BSP)', ipfsCid: '', voteCount: 2_760 },
];

const DELHI_MCD_CANDIDATES: DemoCandidateFull[] = [
    { id: 0, name: 'Atishi Marlena', party: 'Aam Aadmi Party (AAP)', ipfsCid: '', voteCount: 4_980 },
    { id: 1, name: 'Virendra Sachdeva', party: 'Bharatiya Janata Party (BJP)', ipfsCid: '', voteCount: 3_860 },
    { id: 2, name: 'Ajay Maken', party: 'Indian National Congress (INC)', ipfsCid: '', voteCount: 2_310 },
    { id: 3, name: 'Deepak Bhardwaj', party: 'Independent (IND)', ipfsCid: '', voteCount: 1_190 },
];

const MAHA_VS_CANDIDATES: DemoCandidateFull[] = [
    { id: 0, name: 'Devendra Fadnavis', party: 'Bharatiya Janata Party (BJP)', ipfsCid: '', voteCount: 0 },
    { id: 1, name: 'Uddhav Thackeray', party: 'Shiv Sena (UBT)', ipfsCid: '', voteCount: 0 },
    { id: 2, name: 'Sharad Pawar', party: 'NCP (Sharad Pawar)', ipfsCid: '', voteCount: 0 },
    { id: 3, name: 'Nana Patole', party: 'Indian National Congress (INC)', ipfsCid: '', voteCount: 0 },
    { id: 4, name: 'Raj Thackeray', party: 'Maharashtra Navnirman Sena (MNS)', ipfsCid: '', voteCount: 0 },
    { id: 5, name: 'Prakash Ambedkar', party: 'Vanchit Bahujan Aghadi (VBA)', ipfsCid: '', voteCount: 0 },
];

const GUJARAT_CANDIDATES: DemoCandidateFull[] = [
    { id: 0, name: 'Bhupendra Patel', party: 'Bharatiya Janata Party (BJP)', ipfsCid: '', voteCount: 15_220 },
    { id: 1, name: 'Jagdish Thakor', party: 'Indian National Congress (INC)', ipfsCid: '', voteCount: 10_640 },
    { id: 2, name: 'Isudan Gadhvi', party: 'Aam Aadmi Party (AAP)', ipfsCid: '', voteCount: 5_120 },
    { id: 3, name: 'Kanti Kalariya', party: 'Independent (IND)', ipfsCid: '', voteCount: 3_200 },
];

const KARNATAKA_CANDIDATES: DemoCandidateFull[] = [
    { id: 0, name: 'Siddaramaiah', party: 'Indian National Congress (INC)', ipfsCid: '', voteCount: 4_130 },
    { id: 1, name: 'B. S. Yediyurappa', party: 'Bharatiya Janata Party (BJP)', ipfsCid: '', voteCount: 3_410 },
    { id: 2, name: 'H. D. Kumaraswamy', party: 'Janata Dal (Secular)', ipfsCid: '', voteCount: 1_380 },
];

// ── Full Election Objects ────────────────────────────────────

const DEMO_ELECTION_DEFINITIONS: (DemoElectionFull & { _totalVotes: number })[] = [
    // Active
    {
        id: 'lok-sabha-2026',
        name: 'Lok Sabha General Election 2026',
        active: true,
        startTime: now - 3 * DAY,
        endTime: now + 4 * DAY,
        merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000001',
        candidatesFull: LOK_SABHA_CANDIDATES,
        _totalVotes: 48_520,
    },
    {
        id: 'delhi-mcd-2026',
        name: 'Delhi Municipal Corporation Election',
        active: true,
        startTime: now - 1 * DAY,
        endTime: now + 6 * DAY,
        merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000002',
        candidatesFull: DELHI_MCD_CANDIDATES,
        _totalVotes: 12_340,
    },
    // Upcoming
    {
        id: 'maha-vidhan-sabha-2026',
        name: 'Maharashtra Vidhan Sabha Election 2026',
        active: false,
        startTime: now + 15 * DAY,
        endTime: now + 22 * DAY,
        merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000003',
        candidatesFull: MAHA_VS_CANDIDATES,
        _totalVotes: 0,
    },
    // Completed
    {
        id: 'gujarat-panchayat-2025',
        name: 'Gujarat Gram Panchayat Election 2025',
        active: false,
        startTime: now - 60 * DAY,
        endTime: now - 53 * DAY,
        merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000004',
        candidatesFull: GUJARAT_CANDIDATES,
        _totalVotes: 34_180,
    },
    {
        id: 'karnataka-lc-bye-2025',
        name: 'Karnataka Legislative Council By-Election',
        active: false,
        startTime: now - 45 * DAY,
        endTime: now - 38 * DAY,
        merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000005',
        candidatesFull: KARNATAKA_CANDIDATES,
        _totalVotes: 8_920,
    },
];

// ── Exports: Elections Browser ───────────────────────────────

export const DEMO_ELECTIONS: DemoElection[] = DEMO_ELECTION_DEFINITIONS.map(e => ({
    id: e.id,
    name: e.name,
    active: e.active,
    startTime: e.startTime,
    endTime: e.endTime,
    candidateCount: e.candidatesFull.length,
    totalVotes: e._totalVotes,
    candidates: e.candidatesFull.map(c => ({ name: `${c.name} (${c.party.split('(')[1]?.replace(')', '') || c.party})`, voteCount: c.voteCount })),
}));

// ── Exports: Analytics ───────────────────────────────────────

export const DEMO_ANALYTICS: DemoElectionAnalytics[] = DEMO_ELECTIONS.map(e => ({
    id: e.id,
    name: e.name,
    active: e.active,
    candidates: e.candidates,
    totalVotes: e.totalVotes,
}));

// ── Exports: Vote Page (active elections with full candidates) ─

export const DEMO_VOTE_ELECTIONS = DEMO_ELECTION_DEFINITIONS
    .filter(e => e.active)
    .map(e => ({
        id: e.id,
        name: e.name,
        startTime: e.startTime,
        endTime: e.endTime,
        active: e.active,
        merkleRoot: e.merkleRoot,
    }));

export const DEMO_VOTE_CANDIDATES: Record<string, DemoCandidateFull[]> = {};
for (const e of DEMO_ELECTION_DEFINITIONS) {
    DEMO_VOTE_CANDIDATES[e.id] = e.candidatesFull;
}

// ── Exports: Results Page (all elections with chart data) ─────

export const DEMO_RESULTS_ELECTIONS = DEMO_ELECTION_DEFINITIONS.map(e => ({
    id: e.id,
    name: e.name,
    active: e.active,
    startTime: e.startTime,
    endTime: e.endTime,
}));

export const DEMO_RESULTS_CHART_DATA: Record<string, { name: string; votes: number; party: string }[]> = {};
for (const e of DEMO_ELECTION_DEFINITIONS) {
    DEMO_RESULTS_CHART_DATA[e.id] = e.candidatesFull.map(c => ({
        name: c.name,
        votes: c.voteCount,
        party: c.party,
    }));
}

// ── Exports: Fraud stats ─────────────────────────────────────

export const DEMO_FRAUD_STATS = {
    stats: {
        suspiciousIPs: { '103.21.58.12': 3, '45.76.112.8': 1 },
        failedZkpGenerations: 7,
        failedVerifications: 2,
    },
};
