
import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Button } from './Button';
import { useWeb3 } from '../../context/Web3Context';
import { useIdentity } from '../../context/IdentityContext';
import { useOfficial } from '../../context/OfficialContext';
import { DigiLockerModal } from '../DigiLockerModal';
import { OfficialLoginModal } from '../OfficialLoginModal';
import { ShieldCheck, ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const { account, connect, disconnect } = useWeb3();
  const { identity } = useIdentity();
  const { isOfficial, logoutOfficial } = useOfficial();
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isOfficialLoginOpen, setIsOfficialLoginOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      console.error(e);
      alert('Failed to connect wallet');
    }
  };



  const navLinkStyle = {
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    fontWeight: 500
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: `1px solid ${theme.colors.gray200}`,
        backgroundColor: theme.colors.white,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src="/logo.png" alt="EkMat Logo" style={{ height: '40px' }} />
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              backgroundColor: theme.colors.gray100,
              color: theme.colors.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            Pilot Election Portal
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/elections" style={navLinkStyle}>Elections</Link>
          <Link to="/vote" style={navLinkStyle}>Vote</Link>
          <Link to="/results" style={navLinkStyle}>Results</Link>
          <Link to="/audit" style={navLinkStyle}>Audit</Link>
          <Link to="/admin" style={navLinkStyle}>Admin</Link>
          <Link
            to="/support"
            style={{
              ...navLinkStyle,
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              border: `1px solid ${theme.colors.gray200}`,
              backgroundColor: theme.colors.gray100,
              fontSize: '0.85rem',
            }}
          >
            Support
          </Link>
        </div>

        {/* Wallet / status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* DigiLocker Section */}
          {identity ? (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#F0FFF4', padding: '0.2rem 0.6rem', borderRadius: '999px',
                border: '1px solid #C6F6D5'
              }}
              title="Identity Verified via DigiLocker"
            >
              <ShieldCheck size={16} color="#2F855A" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22543D' }}>Verified</span>
                <span style={{ fontSize: '0.65rem', color: '#2F855A' }}>xxxx-{identity.aadhaarLast4}</span>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsDigiLockerOpen(true)}
              size="sm"
              style={{ background: 'white', color: '#2B6CB0', border: '1px solid #2B6CB0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldAlert size={14} />
                Verify ID
              </div>
            </Button>
          )}

          {/* Official Access */}
          {isOfficial ? (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#ebf8ff', padding: '0.2rem 0.6rem', borderRadius: '999px',
                border: '1px solid #bee3f8', cursor: 'pointer'
              }}
              onClick={logoutOfficial}
              title="Click to Logout"
            >
              <UserCheck size={16} color="#3182ce" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2c5282' }}>Officer Mode</span>
            </div>
          ) : (
            <button
              onClick={() => setIsOfficialLoginOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: '#a0aec0', display: 'flex', alignItems: 'center'
              }}
              title="Official Access"
            >
              <Lock size={16} />
            </button>
          )}

          <div style={{ width: '1px', height: '24px', background: theme.colors.gray200, margin: '0 0.25rem' }} />

          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: theme.colors.gray100,
              color: theme.colors.textSecondary,
            }}
          >
            Network: Testnet
          </span>
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: theme.colors.gray100,
                  color: theme.colors.textPrimary,
                  fontWeight: 500,
                }}
              >
                {`${account.substring(0, 6)}...${account.substring(38)}`}
              </span>
              <Button
                onClick={disconnect}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect} variant="primary" size="sm">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <DigiLockerModal isOpen={isDigiLockerOpen} onClose={() => setIsDigiLockerOpen(false)} />
      <OfficialLoginModal isOpen={isOfficialLoginOpen} onClose={() => setIsOfficialLoginOpen(false)} />
    </nav>
  );
};
