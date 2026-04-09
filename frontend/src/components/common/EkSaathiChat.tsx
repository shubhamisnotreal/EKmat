import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MessageSquare, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// import { theme } from '../../styles/theme';

type LanguageCode = 'en' | 'hi' | 'mr';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `
You are EkSaathi, the official, highly-knowledgeable AI guide for EkMat. 
EkMat is a privacy-first e-voting system Pilot built on Ethereum, utilizing Zero-Knowledge Proofs (ZK-SNARKs) to guarantee voter anonymity.

Your goal is to help users understand how the platform works, specifically focusing on:
1. ID Verification: We use a mocked DigiLocker integration to verify users before they get a Nullifier and Commitment.
2. Zero-Knowledge Proofs (ZKP): Explain how ZKPs allow voters to prove they are in the eligible Merkle Tree without revealing exactly who they are among the voters. Mention that the "Nullifier" prevents double-voting.
3. Voting on Blockchain: Votes are cast to a smart contract on Ganache/Ethereum. The smart contract validates the ZK Proof on-chain.
4. Transparency: The voting receipt and candidate profiles are stored on IPFS.

Rules for your responses:
- Keep responses brief, professional, and empathetic. Do not use overly technical jargon unless asked.
- NEVER invent features that aren't mentioned above.
- NEVER ask for or accept a user's private keys, seed phrase, nullifier, or personal identifiable information (PII).
- If a user asks a question unrelated to EkMat, politely decline to answer and guide them back to the voting process.
- ALWAYS reply in the exact language the user used to ask the question (English, Hindi, or Marathi).
`.trim();

const detectLanguage = (text: string): LanguageCode => {
    // Very lightweight heuristic based on Devanagari usage
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (!hasDevanagari) return 'en';
    // For now, treat all Devanagari as Hindi/Marathi family; default to Hindi
    return 'hi';
};

export const EkSaathiChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<LanguageCode>('en');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const speakText = (text: string, lang: LanguageCode) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        // Strip markdown before speaking
        const cleanText = text.replace(/[*_#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        const detected = detectLanguage(e.target.value);
        if (detected !== language && language === 'en') {
            setLanguage(detected);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/eksaathi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    systemPrompt: SYSTEM_PROMPT,
                    language,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: content || 'I apologize, but I could not generate a response. Please try again.',
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Auto-speak the response
            if (content) {
                speakText(content, language);
            }
        } catch (error) {
            console.error('EkSaathi error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'hi'
                    ? 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
                    : language === 'mr'
                        ? 'माफ करा, एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
                        : 'Sorry, an error occurred. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!input) return;
        const detected = detectLanguage(input);
        if (detected !== language && language === 'en') {
            setLanguage(detected);
        }
    }, [input, language]);

    const languageLabel = useMemo(() => {
        switch (language) {
            case 'hi':
                return 'हिंदी';
            case 'mr':
                return 'मराठी';
            default:
                return 'English';
        }
    }, [language]);

    const handleQuickChip = (textEn: string, textHi: string, textMr: string) => {
        let text = textEn;
        if (language === 'hi') text = textHi;
        if (language === 'mr') text = textMr;
        setInput(text);
        // Auto-submit quick chips
        setTimeout(() => {
            const form = document.querySelector('.eksaathi-input-row') as HTMLFormElement;
            if (form) {
                const event = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(event);
            }
        }, 100);
    };

    return (
        <>
            <button
                type="button"
                className="eksaathi-toggle"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Open EkSaathi support chat"
            >
                <MessageSquare size={20} />
            </button>

            {isOpen && (
                <div className="eksaathi-panel">
                    <div className="eksaathi-header">
                        <div>
                            <div className="eksaathi-title">EkSaathi</div>
                            <div className="eksaathi-subtitle">
                                Secure, multilingual support assistant · {languageLabel}
                            </div>
                        </div>
                        <div className="eksaathi-lang-toggle">
                            <button
                                type="button"
                                className={language === 'en' ? 'eksaathi-lang-pill active' : 'eksaathi-lang-pill'}
                                onClick={() => setLanguage('en')}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                className={language === 'hi' ? 'eksaathi-lang-pill active' : 'eksaathi-lang-pill'}
                                onClick={() => setLanguage('hi')}
                            >
                                हिं
                            </button>
                            <button
                                type="button"
                                className={language === 'mr' ? 'eksaathi-lang-pill active' : 'eksaathi-lang-pill'}
                                onClick={() => setLanguage('mr')}
                            >
                                मरा
                            </button>
                        </div>
                    </div>

                    <div className="eksaathi-body">
                        <div className="eksaathi-disclaimer">
                            EkSaathi will never ask for your private keys, seed phrase, biometric data, or ZKP
                            nullifiers.
                        </div>
                        <div className="eksaathi-messages">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={
                                        m.role === 'user'
                                            ? 'eksaathi-bubble user'
                                            : 'eksaathi-bubble assistant'
                                    }
                                >
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="eksaathi-bubble assistant">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}
                            {!messages.length && !isLoading && (
                                <div className="eksaathi-empty">
                                    Ask EkSaathi anything about ID verification, ZK proofs, or casting your vote.
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form className="eksaathi-input-row" onSubmit={handleSubmit}>
                        <button
                            type="button"
                            className={`eksaathi-mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={toggleListening}
                            title="Voice Input"
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '8px', color: isListening ? '#ef4444' : '#6b7280',
                                display: 'flex', alignItems: 'center'
                            }}
                        >
                            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        <input
                            className="eksaathi-input"
                            placeholder={
                                language === 'hi'
                                    ? 'अपना प्रश्न लिखें…'
                                    : language === 'mr'
                                        ? 'आपला प्रश्न लिहा…'
                                        : 'Type your question…'
                            }
                            value={input}
                            onChange={handleInputChange}
                        />
                        <button
                            type="submit"
                            className="eksaathi-send"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading
                                ? (language === 'hi' ? 'भेज रहे हैं...' : language === 'mr' ? 'पाठवत आहे...' : 'Sending...')
                                : (language === 'hi'
                                    ? 'भेजें'
                                    : language === 'mr'
                                        ? 'पाठवा'
                                        : 'Send')}
                        </button>
                    </form>

                    <div className="eksaathi-chips">
                        <button
                            type="button"
                            onClick={() =>
                                handleQuickChip(
                                    'How do I verify my ID?',
                                    'ID सत्यापित कैसे करें?',
                                    'मी माझी ओळख कशी पडताळू?'
                                )
                            }
                        >
                            {language === 'hi'
                                ? 'ID सत्यापित कैसे करें?'
                                : language === 'mr'
                                    ? 'ओळख कशी पडताळावी?'
                                    : 'How to verify ID?'}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleQuickChip(
                                    'Is my vote anonymous?',
                                    'क्या मेरा वोट अनामिक है?',
                                    'माझे मत अनामिक आहे का?'
                                )
                            }
                        >
                            {language === 'hi'
                                ? 'मेरा वोट अनामिक है?'
                                : language === 'mr'
                                    ? 'माझे मत अनामिक आहे का?'
                                    : 'Is my vote anonymous?'}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleQuickChip(
                                    'How can I track my vote?',
                                    'मैं अपना वोट कैसे ट्रैक करूं?',
                                    'मी माझे मत कसे ट्रॅक करू?'
                                )
                            }
                        >
                            {language === 'hi'
                                ? 'अपना वोट ट्रैक करें'
                                : language === 'mr'
                                    ? 'मत ट्रॅक करा'
                                    : 'Track my vote'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};


