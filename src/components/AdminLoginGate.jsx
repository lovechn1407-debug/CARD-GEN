import React, { useState } from 'react';
import { loginWithGoogle } from '../utils/firebase';
import { Lock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginGate({ user, onAuthenticated }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      const loggedUser = await loginWithGoogle();
      if (onAuthenticated) onAuthenticated(loggedUser);
    } catch (err) {
      setErrorMsg('Google Sign-In failed or was cancelled. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(15,23,42,0.1)', textAlign: 'center', boxSizing: 'border-box' }}>
        
        {/* Lock Shield Icon */}
        <div style={{ width: 64, height: 64, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(29,78,216,0.15)' }}>
          <Lock style={{ width: 30, height: 30, color: '#1d4ed8' }} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
          Admin Authentication Required
        </h2>

        {/* Description */}
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
          Please sign in with your Google account to access the E-Cell ID Card Management Dashboard, Design Studio, and High-Res Print Export Studio.
        </p>

        {/* Error message */}
        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', borderRadius: '10px', fontWeight: 600, marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '13px 20px',
            background: isSigningIn ? '#cbd5e1' : '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: isSigningIn ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(29,78,216,0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          {/* Google Color G SVG */}
          <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          {isSigningIn ? 'Signing In with Google...' : 'Sign In with Google Account'}
        </button>

        {/* Verified Security Footer */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a' }} />
          <span>Protected by Firebase Authentication & Firestore</span>
        </div>
      </div>
    </div>
  );
}
