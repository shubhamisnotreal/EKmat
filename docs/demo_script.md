# EkMat & EkSaathi 2-Minute Demonstration Flow

This script is designed to concisely showcase the deep technical achievements of the **EkMat** project—specifically Zero-Knowledge Proofs (ZK-SNARKs), Ethereum Smart Contracts, and the newly integrated **EkSaathi** Voice AI—in a fast-paced 120 seconds.

---

## ⏱️ Pre-flight Checklist (Before Recording)
1. Ensure both the **`dev:frontend`** and **`dev:backend`** servers are running.
2. Spin up **Ganache** and connect your **MetaMask** to the local network. Make sure your browser wallet has an active account.
3. Open `http://localhost:5173/` in a fresh browser session.
4. (Optional) Rehearse the EkSaathi STT/TTS voice interaction to ensure your microphone picks it up clearly.

---

## 🎬 The 2-Minute Script 

### Section 1: Introduction (0:00 - 0:15)
**Visual:** Screen recording of the EkMat Landing Page.
**Narration:**
> "Welcome to EkMat, a privacy-first e-voting platform built on Ethereum. In traditional digital voting, proving *who* you are often sacrifices your ballot secrecy. EkMat solves this using Zero-Knowledge Proofs, or ZK-SNARKs, allowing citizens to prove their eligibility without ever revealing their identity."

### Section 2: Registration & ZKP Generation (0:15 - 0:45)
**Visual:** Navigate to the **Register** page. Enter the mock Government ID (`123456789012`) and OTP (`123456`). Click "Verify Identity", "Capture Biometrics", and "Generate ZKG Proof". 
**Narration:**
> "Let's see the registration flow. First, a user's identity is verified via simulated DigiLocker integration. Once verified, the system generates a biometric-based cryptographic commitment on the client side. Notice that no raw Personally Identifiable Information is ever sent to the backend. Instead, we generate a ZK Proof and a unique 'Nullifier'. This Nullifier is registered on the blockchain to guarantee a user can only vote exactly once, preventing double-voting."

### Section 3: The EkSaathi Voice Bot (0:45 - 1:15)
**Visual:** Still on the Register/Home page. Click the chat bubble in the bottom right to open **EkSaathi**. Turn on the **Microphone** icon (Voice Input) and speak: *"Is my vote really anonymous?"*. The text will appear. Send it. The bot will reply aloud using TTS.
**Narration:**
> "To guide users through this complex privacy flow, we built **EkSaathi**—our multilingual AI support assistant powered by Google's Gemini 2.5 Flash. It is uniquely fine-tuned on our exact architectural rules. With native Voice-to-Text and Text-to-Speech built-in, a user can simply ask... *(speak into mic: 'Is my vote really anonymous?')*... and the bot replies instantly, ensuring they never accidentally share their private keys or nullifiers in chat."

### Section 4: Casting the Vote on Blockchain (1:15 - 1:45)
**Visual:** Navigate to the **Vote** page. You will see the active Election and Candidates. Connect your Web3 Wallet (MetaMask popup appears). Select a candidate (e.g., Narendra Modi) and click "Cast Your Vote". Approve the MetaMask transaction.
**Narration:**
> "Now for the actual vote. The user connects their Web3 wallet and selects their preferred candidate. When they cast their vote, two things happen. First, the Smart Contract running on Ethereum mathematically validates our previously generated ZK Proof entirely on-chain. If it's valid and the nullifier hasn't been used, the vote is tallied anonymously. *(Click approve in MetaMask)*. Transaction confirmed."

### Section 5: Transparency & Conclusion (1:45 - 2:00)
**Visual:** Navigate to the **Results** or **Admin** page showing the updated vote count. Or, show the IPFS receipt if applicable.
**Narration:**
> "Because the Smart Contract handles the vote tabulation, the outcome is cryptographically transparent, verifiable, and immutable, while the voter remains 100% anonymous. That is the core architecture of EkMat. Thank you."

---

## 🎥 Tips for Recording
* Use a screen recorder that captures **desktop audio** so viewers can hear EkSaathi speaking. 
* Keep your cursor movements smooth and deliberate.
* If making a mistake, pause, re-take that segment, and cut it later rather than restarting the entire 2 minutes.
