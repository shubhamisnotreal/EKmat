import React, { useRef, Suspense, lazy } from 'react';
import { HeroSection, HowItWorksSection, USPsSection, TechStackSection } from '../components/landing/LandingComponents';
import { Layout } from '../components/Layout';

const IndiaVotingMap = lazy(() => import('../components/map/IndiaVotingMap'));

const LandingPage: React.FC = () => {
    const howItWorksRef = useRef<HTMLDivElement | null>(null);

    const handleGetStartedClick = () => {
        if (howItWorksRef.current) {
            howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Layout>
            <HeroSection onGetStarted={handleGetStartedClick} />

            <div className="page-section" style={{ padding: '20px 20px 60px', background: '#FAFAFA' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Live Voting Activity</h2>
                    <p style={{ color: '#6B7280', fontSize: '1.2rem', marginTop: '10px' }}>Explore active voting booths across India in real-time</p>
                </div>
                <Suspense fallback={<div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#6B7280' }}>Loading Interactive Map...</div>}>
                    <IndiaVotingMap showLegend={true} enableRealTime={true} />
                </Suspense>
            </div>

            <div className="page-section" ref={howItWorksRef}>
                <HowItWorksSection />
            </div>
            <div className="page-section">
                <USPsSection />
            </div>
            <div className="page-section">
                <TechStackSection />
            </div>
        </Layout>
    );
};

export default LandingPage;
