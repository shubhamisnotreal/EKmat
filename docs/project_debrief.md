# EkMat Project Debrief and Gap Analysis

## Core Features Discovered
1. **Zero-Knowledge Voting**: Uses Circom and SnarkJS to verify voter eligibility via nullifiers without revealing the voter's identity.
2. **Blockchain Backend**: `EkMatVoting.sol` on a local Ganache chain stores elections, candidates, and verifies ZK proofs on-chain.
3. **EkSaathi AI Chatbot**: An integrated Google Gemini-powered support bot that answers voter queries in English, Hindi, and Marathi.
4. **Decentralized Storage**: Integrates IPFS for storing candidate profiles and anonymous voter receipts.
5. **Modern Frontend**: A React + Vite portal with pages for Admin management, Voter Registration (mocked DigiLocker), and Voting.

## Gap Analysis (Where the system currently lacks)
1. **ZKP Generation is Mocked & Centralized**: The `zkpService.ts` currently runs on the Node.js backend and generates mocked/dummy proofs. For true privacy, ZK proofs MUST be generated **client-side** (in the browser via WebAssembly) so the backend never sees the user's secret commitments or nullifiers.
2. **Missing Transaction Relayer**: Currently, the frontend wallet calls `castVote()` directly. If a voter uses their main wallet to pay for gas, their address is publicly linked to the vote transaction, breaking anonymity even with ZKPs. A Relayer (like OpenGSN or a custom backend relayer) is needed to pay gas fees on behalf of the voter.
3. **Identity Verification is Mocked**: The DigiLocker integration generates a dummy `mockRegistration` object locally. Real OAuth or API integration is required to issue commitments securely.
4. **Centralized Merkle Tree Management**: The backend currently manages the Merkle Tree of eligible voters. For a trustless system, the tree construction or root calculation should ideally be verifiable on-chain or through a decentralized indexer.
