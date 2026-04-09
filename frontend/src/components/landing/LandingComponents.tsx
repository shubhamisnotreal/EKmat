import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { Shield, Database, Lock, Globe, Cpu } from 'lucide-react';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { useRef } from 'react';

interface HeroSectionProps {
    onGetStarted?: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => (
    <section className="landing-hero" style={{ padding: '4rem 2rem', background: '#fff' }}>
        <div className="landing-hero-inner" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="landing-hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ebf8ff', padding: '0.5rem 1rem', borderRadius: '999px', marginBottom: '1.5rem' }}>
                <span className="landing-hero-badge-dot" style={{ width: '8px', height: '8px', background: theme.colors.primary, borderRadius: '50%' }} />
                <span className="landing-hero-badge-text" style={{ color: theme.colors.primary, fontWeight: 600, fontSize: '0.9rem' }}>Mainnet Ready</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="EkMat Logo" style={{ height: '8rem' }} />
            </div>
            <p className="landing-hero-subtitle" style={{ fontSize: '1.25rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                Secure, verifiable and privacy-preserving elections on blockchain. Empowering democracy with zero-knowledge proofs.
            </p>

            <div className="landing-hero-actions">
                <Button
                    size="lg"
                    variant="primary"
                    style={{
                        boxShadow: '0 4px 14px 0 rgba(49, 130, 206, 0.39)',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem'
                    }}
                    onClick={onGetStarted}
                >
                    Get Started
                </Button>
            </div>
        </div>
    </section>
);

export const HowItWorksSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const steps = [
        {
            step: 1,
            title: 'Verify Identity (Gov Database)',
            desc: 'Securely link your government ID offline. No personal data is stored on our servers; we only generate a cryptographic commitment.',
            icon: '1'
        },
        {
            step: 2,
            title: 'Generate ZK-Proof',
            desc: 'Your device locally computes a Zero-Knowledge Proof (ZK-SNARK), mathematically proving you are an eligible voter without revealing exactly *who* you are.',
            icon: '2'
        },
        {
            step: 3,
            title: 'Cast Encrypted Vote',
            desc: 'Your vote is encrypted and bundled with the ZK-Proof, and submitted directly to the Ethereum smart contract.',
            icon: '3'
        },
        {
            step: 4,
            title: 'Publicly Auditable Ledger',
            desc: 'Anyone can independently verify the election tally by validating the Merkle Root and proofs on the blockchain, ensuring 100% integrity.',
            icon: '4'
        },
    ];

    return (
        <section className="landing-section landing-section-light" ref={containerRef} style={{ position: 'relative', overflow: 'hidden', padding: '6rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a202c', marginBottom: '1rem' }}>How EkMat Works</h2>
                <p style={{ fontSize: '1.2rem', color: '#4a5568' }}>A frictionless, cryptographically secure end-to-end voting process.</p>
            </div>

            <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '2rem', top: 0, bottom: 0, width: '4px', background: '#E2E8F0', borderRadius: '4px' }}>
                    <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#356AE6', originY: 0, scaleY }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingLeft: '4rem' }}>
                    {steps.map((item, index) => {
                        return (
                            <StepCard key={item.step} item={item} index={index} />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const StepCard = ({ item }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ position: 'relative', background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}
        >
            <div style={{ position: 'absolute', left: '-3rem', top: '50%', transform: 'translate(-50%, -50%)', width: '3rem', height: '3rem', background: '#fff', borderRadius: '50%', border: '4px solid #356AE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#356AE6', boxShadow: '0 0 0 6px #fff' }}>
                {item.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a202c', margin: '0 0 1rem' }}>{item.title}</h3>
            <p style={{ fontSize: '1.1rem', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
        </motion.div>
    );
}

export const USPsSection = () => (
    <section className="landing-section" style={{ background: '#f8fafc', padding: '8rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a202c', marginBottom: '1rem' }}>Why EkMat?</h2>
            <p style={{ fontSize: '1.2rem', color: '#4a5568' }}>Replacing legacy paper trails with mathematically undeniable trust.</p>
        </div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <FeatureCard
                icon={<Lock size={32} color="#fff" />}
                title="Absolute Anonymity (ZK-SNARKs)"
                desc="By utilizing Zero-Knowledge cryptography, your identity is never linked to your ballot. You prove you have the right to vote without exposing any identifying information to the election authority."
                color="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                delay={0}
            />
            <FeatureCard
                icon={<Database size={32} color="#fff" />}
                title="Immutable Ledger (Blockchain)"
                desc="Every ballot cast is cryptographically signed and stored on a distributed ledger. Once submitted, votes can never be altered, deleted, or tampered with by any central authority or malicious actor."
                color="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                delay={0.1}
            />
            <FeatureCard
                icon={<Shield size={32} color="#fff" />}
                title="End-to-End Verifiability"
                desc="Voters receive a unique tracker upon casting. The entire election tally is accompanied by a mathematical proof, allowing anyone to independently audit the results ensuring every valid vote was counted correctly."
                color="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                delay={0.2}
            />
        </div>
    </section>
);

const FeatureCard = ({ icon, title, desc, color, delay }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            style={{
                background: '#fff',
                padding: '2.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </motion.div>
    );
}

export const TechStackSection = () => {
    const techItems = [
        { name: 'Ethereum', icon: <Globe size={24} /> },
        { name: 'IPFS', icon: <Database size={24} /> },
        { name: 'Circom', icon: <Cpu size={24} /> },
        { name: 'ZK-SNARKs', icon: <Lock size={24} /> },
        { name: 'React', icon: <Globe size={24} /> },
        { name: 'TypeScript', icon: <Cpu size={24} /> }
    ];

    return (
        <section className="landing-section" style={{ background: '#1e293b', padding: '4rem 0', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <p style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', fontWeight: 600 }}>Powered By Modern Cryptography</p>
            </div>

            <div style={{ position: 'relative', width: '100%', display: 'flex', overflow: 'hidden' }}>
                <motion.div
                    animate={{ x: [0, -1035] }}
                    transition={{ repeat: Infinity, ease: 'linear', duration: 20 }}
                    style={{ display: 'flex', gap: '4rem', paddingLeft: '4rem', whiteSpace: 'nowrap' }}
                >
                    {[...techItems, ...techItems, ...techItems].map((tech, i) => (
                        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700 }}>
                            <span style={{ color: '#3b82f6', opacity: 0.8 }}>{tech.icon}</span>
                            {tech.name}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
