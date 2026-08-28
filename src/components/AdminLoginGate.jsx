import React, { useState } from 'react';
import { loginWithEmailPassword } from '../utils/firebase';
import { getTemplateConfig } from '../utils/storage';
import { Lock, ShieldAlert, ShieldCheck, Mail, Key, Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLoginGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cfg = getTemplateConfig();
  const currentAllowedEmail = cfg.allowedAdminEmail;

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      await loginWithEmailPassword(email, password, currentAllowedEmail);
      // onAuthStateChanged in App.jsx detects authentication state
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Check your Firebase Auth credentials.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '36px 28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(15,23,42,0.1)', textAlign: 'center', boxSizing: 'border-box' }}>
        
        <div style={{ width: 60, height: 60, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(29,78,216,0.15)' }}>
          <Lock style={{ width: 28, height: 28, color: '#1d4ed8' }} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Admin Authentication Portal
        </h2>

        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          Sign in using the authorized Admin Email & Password added to Firebase Authentication.
        </p>

        {errorMsg && (
          <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', borderRadius: '10px', fontWeight: 600, marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
            <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. lovechn1407@gmail.com"
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Firebase Auth Password..."
                style={{ width: '100%', padding: '10px 36px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: isSigningIn ? '#cbd5e1' : '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSigningIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(29,78,216,0.35)',
              marginTop: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <LogIn style={{ width: 16, height: 16 }} />
            {isSigningIn ? 'Authenticating Admin...' : 'Sign In with Email & Password'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
          <ShieldCheck style={{ width: 14, height: 14, color: '#16a34a' }} />
          <span>Firebase Authentication Email & Password Protected</span>
        </div>
      </div>
    </div>
  );
}
