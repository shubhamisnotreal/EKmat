# EkMat System Flow

The EkMat platform operates through several distinct operational flows:

## 1. Voter Registration Flow
1. User visits the Registration Page.
2. User authenticates via a trusted identity provider (mocked DigiLocker integration).
3. Upon successful verification, the system generates a cryptographic secret (Nullifier) and a public Commitment.
4. The Commitment is added to a global Merkle Tree representing all eligible voters.
5. The frontend saves the Nullifier locally (e.g., in `localStorage`) to be used later for voting.

## 2. Election Configuration Flow (Admin)
1. Admin logs into the Admin Dashboard.
2. Admin creates a new election by interacting with the `EkMatVoting` smart contract.
3. Admin adds candidates, uploading their photos to IPFS and storing the CIDs on-chain.
4. Admin computes the Merkle Root of all eligible voter commitments and publishes it to the smart contract, cementing the voter roll.
5. Admin toggles the election to "Active".

## 3. Voting Flow
1. Connected user navigates to the Vote page and selects an active election.
2. User browses candidates and clicks "Vote".
3. **ZKP Generation**: The frontend `ZKProofGenerator` (currently bypassing/mocking in the demo code) is intended to generate a Zero-Knowledge proof locally using:
   - Private: User's Nullifier, Commitment, and Merkle Path.
   - Public: The Election ID and the Merkle Root.
4. **Transaction Submission**: The frontend sends a transaction to `EkMatVoting.castVote()` with the Proof, the chosen Candidate ID, and the generated Nullifier Hash.
5. **On-Chain Verification**: The smart contract calls `Verifier.sol`. If valid, it checks that the Nullifier Hash hasn't been used yet.
6. **Vote Tally**: The candidate's vote count is incremented. The vote cannot be traced back to the user's Commitment.
7. **Receipt**: A receipt is generated and uploaded to IPFS, providing a verifiable log.

## 4. EkSaathi Support Flow
1. User interacts with the EkSaathi chat widget on the frontend.
2. The query is sent to the backend `/api/eksaathi` endpoint along with context.
3. The backend calls the Gemini AI API, instructing it to respond contextually in English, Hindi, or Marathi based on user preference.
4. The AI response is streamed back to the user to resolve their query.
