// client/src/Auth.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [view, setView] = useState('login'); // 'login', 'register', or 'forgotPassword'
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', role: 'seeker' });
  const [newPassword, setNewPassword] = useState(''); // Only used for reset
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole'); 
    
    if (token) {
      if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
        timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // --- API HANDLERS ---

  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Sending code...');
    const url = isLogin ? `${import.meta.env.VITE_API_URL}/api/auth/login` : `${import.meta.env.VITE_API_URL}/api/auth/register`;
    try {
      await axios.post(url, { email: formData.email, password: formData.password });
      setMessage('A 6-digit code has been sent to your email!');
      setStep(2);
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.error || 'Connection error.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Verifying...');
    const url = isLogin ? `${import.meta.env.VITE_API_URL}/api/auth/verify-login` : `${import.meta.env.VITE_API_URL}/api/auth/verify-register`;
    try {
      const res = await axios.post(url, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.userName || res.data.user?.name);
        localStorage.setItem('userRole', res.data.role || 'seeker'); 
        localStorage.setItem('userEmail', res.data.email || res.data.user?.email || "");
        
        if (res.data.role === 'admin') navigate('/admin'); 
        else navigate('/dashboard');
      } else {
        alert('Registration successful! Please log in.');
        setIsLogin(true);
        setView('login');
        setStep(1);
        setFormData({ ...formData, password: '', otp: '' });
        setMessage('');
      }
    }catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
        // Safely extract just the string message
        setError(error.response.data.message);
    } else if (error.response && error.response.data && error.response.data.error) {
        // Check for your custom 'error' key
        setError(error.response.data.error);
    } else {
        // Fallback text if the server sends back something weird
        setError("Network error: Could not reach the server.");
    }
}
  };

  const handleResendOTP = async () => {
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, { email: formData.email });
        setMessage("A new OTP has been sent!");
        setResendTimer(30); 
    } catch (err) {
        setError(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Sending reset link...');
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: formData.email });
        setMessage("OTP sent! Check your email.");
        setStep(2); 
        setResendTimer(30); 
    } catch (err) {
        setMessage('');
        setError(err.response?.data?.error || "User not found");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { 
            email: formData.email, 
            otp: formData.otp, 
            newPassword 
        });
        alert("Password reset successfully! Please log in.");
        setStep(1);
        setView('login');
        setIsLogin(true);
        setFormData({ ...formData, otp: '', password: '' });
        setNewPassword('');
    } catch (err) {
        setError(err.response?.data?.error || "Invalid OTP");
    }
  };

  // --- RENDER LOGIC ---

  return (
    <>
      <style>{`
        /* Keeping all your existing custom CSS! */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-14px) rotate(1.5deg); } 66% { transform: translateY(-6px) rotate(-1deg); } }
        @keyframes pulse-ring { 0% { transform: scale(0.85); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 0.2; } 100% { transform: scale(0.85); opacity: 0.6; } }

        .auth-bg { min-height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: var(--navy-950); position: relative; overflow: hidden; }
        .auth-bg::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 55% at 20% 30%, rgba(59,130,246,0.13) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 75%, rgba(245,158,11,0.09) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 60% 10%, rgba(99,102,241,0.08) 0%, transparent 55%); pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; animation: float 9s ease-in-out infinite; }
        .orb-1 { width:340px; height:340px; background:rgba(59,130,246,0.12); top:-80px; left:-80px; animation-delay:0s; }
        .orb-2 { width:260px; height:260px; background:rgba(245,158,11,0.10); bottom:-60px; right:-60px; animation-delay:-4s; }
        .orb-3 { width:180px; height:180px; background:rgba(99,102,241,0.09); top:50%; left:70%; animation-delay:-7s; }
        .auth-bg::after { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }

        .auth-card { position: relative; z-index: 10; width: 440px; background: rgba(10,22,40,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-xl); padding: 44px 40px 40px; box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.06); animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .auth-logo-ring { position: relative; width: 64px; height: 64px; margin: 0 auto 22px; display: flex; align-items: center; justify-content: center; }
        .auth-logo-ring::before { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--amber-500); animation: pulse-ring 2.8s ease-in-out infinite; }
        .auth-logo-icon { width: 64px; height: 64px; background: linear-gradient(135deg, var(--blue-600), var(--indigo-500)); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: var(--shadow-glow-blue); }
        .auth-title { font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; text-align: center; margin: 0 0 4px; background: linear-gradient(135deg, #ffffff 30%, var(--amber-400) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3.5s linear infinite; }
        .auth-subtitle { font-family: var(--font-body); font-size: 0.92rem; color: var(--slate-400); text-align: center; margin: 0 0 30px; font-weight: 300; }
        
        .auth-alert { padding: 11px 14px; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 20px; font-family: var(--font-body); font-weight: 400; }
        .auth-alert.error  { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.30);  color: #fca5a5; }
        .auth-alert.success { background: rgba(34,197,94,0.10);  border: 1px solid rgba(34,197,94,0.25);  color: #86efac; }
        
        .auth-label { display: block; font-family: var(--font-display); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--slate-400); margin-bottom: 6px; }
        .auth-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: var(--radius-md); color: #f1f5f9; font-family: var(--font-body); font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; outline: none; }
        .auth-input::placeholder { color: var(--slate-500); }
        .auth-input:focus { border-color: var(--blue-500); background: rgba(59,130,246,0.06); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .auth-input.otp-input { font-size: 1.6rem; letter-spacing: 10px; text-align: center; font-family: var(--font-display); font-weight: 700; padding: 14px; }
        
        .auth-btn-primary { width: 100%; padding: 13px; background: linear-gradient(135deg, var(--blue-600), var(--indigo-500)); color: white; border: none; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: var(--shadow-glow-blue); position: relative; overflow: hidden; }
        .auth-btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: opacity 0.2s; }
        .auth-btn-primary:hover:not(:disabled)::after { opacity: 1; }
        .auth-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 28px rgba(59,130,246,0.35); }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        
        .auth-btn-verify { width: 100%; padding: 13px; background: linear-gradient(135deg, #16a34a, #059669); color: white; border: none; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 0 20px rgba(22,163,74,0.25); }
        .auth-btn-verify:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(22,163,74,0.35); }
        
        .auth-btn-ghost { width: 100%; padding: 10px; background: transparent; color: var(--slate-400); border: none; cursor: pointer; font-family: var(--font-body); font-size: 0.875rem; text-decoration: underline; transition: color 0.2s; }
        .auth-btn-ghost:hover { color: var(--slate-200); }
        .auth-btn-ghost:disabled { color: var(--slate-600); cursor: not-allowed; text-decoration: none; }
        
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-form-group { display: flex; flex-direction: column; }
        
        .auth-toggle { text-align: center; margin-top: 22px; color: var(--slate-400); font-size: 0.875rem; font-family: var(--font-body); }
        .auth-toggle-link { color: var(--amber-400); cursor: pointer; font-weight: 600; transition: color 0.2s; margin-left: 4px; }
        .auth-toggle-link:hover { color: var(--amber-500); }
      `}</style>

      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="auth-card">
          <div className="auth-logo-ring">
            <div className="auth-logo-icon">🔍</div>
          </div>

          <h1 className="auth-title">ResuMatch AI</h1>
          <p className="auth-subtitle">
            {view === 'forgotPassword' 
              ? (step === 1 ? 'Reset your password.' : 'Check your email for the OTP.')
              : step === 1
                ? (isLogin ? 'Welcome back — sign in to continue.' : 'Create your account to get started.')
                : `Enter the code sent to ${formData.email}`}
          </p>

          {error   && <div className="auth-alert error">{error}</div>}
          {message && <div className="auth-alert success">{message}</div>}

          {/* ========================================================= */}
          {/* VIEW: LOGIN / REGISTER (Step 1)                           */}
          {/* ========================================================= */}
          {view !== 'forgotPassword' && step === 1 && (
            <form onSubmit={handleInitiate} className="auth-form">
              {!isLogin && (
                <>
                  <div className="auth-form-group">
                    <label className="auth-label">Full Name</label>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Jane Smith"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="auth-form-group" style={{ flexDirection: 'row', gap: '20px', margin: '8px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="radio" name="role" value="seeker" checked={formData.role === 'seeker'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ accentColor: 'var(--blue-500)', width: '16px', height: '16px' }} />
                      I'm a Job Seeker
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input type="radio" name="role" value="recruiter" checked={formData.role === 'recruiter'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ accentColor: 'var(--amber-500)', width: '16px', height: '16px' }} />
                      I'm a Recruiter
                    </label>
                  </div>
                </>
              )}
              
              <div className="auth-form-group">
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {isLogin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                  <button type="button" onClick={() => { setView('forgotPassword'); setStep(1); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--blue-500)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="auth-btn-primary">
                {isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* VIEW: LOGIN / REGISTER (Step 2 - Verify OTP)              */}
          {/* ========================================================= */}
          {view !== 'forgotPassword' && step === 2 && (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="auth-form-group">
                <label className="auth-label">6-Digit Code</label>
                <input
                  className="auth-input otp-input"
                  type="text"
                  placeholder="——————"
                  maxLength="6"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              </div>
              <button type="button" onClick={handleResendOTP} disabled={resendTimer > 0} className="auth-btn-ghost">
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive code? Resend OTP"}
              </button>
              <button type="submit" className="auth-btn-verify">Verify & Enter →</button>
              <button type="button" className="auth-btn-ghost" onClick={() => { setStep(1); setMessage(''); }}>
                ← Go back
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* VIEW: FORGOT PASSWORD (Step 1 - Request OTP)              */}
          {/* ========================================================= */}
          {view === 'forgotPassword' && step === 1 && (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="auth-form-group">
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Enter your account email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <button type="submit" className="auth-btn-primary">Send Reset Link →</button>
              <button type="button" className="auth-btn-ghost" onClick={() => { setView('login'); setIsLogin(true); setError(''); setMessage(''); }}>
                ← Back to Login
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* VIEW: FORGOT PASSWORD (Step 2 - Reset with OTP)           */}
          {/* ========================================================= */}
          {view === 'forgotPassword' && step === 2 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-form-group">
                <label className="auth-label">6-Digit Code</label>
                <input
                  className="auth-input otp-input"
                  type="text"
                  placeholder="——————"
                  maxLength="6"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">New Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleResendOTP} disabled={resendTimer > 0} className="auth-btn-ghost">
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive code? Resend OTP"}
              </button>
              <button type="submit" className="auth-btn-verify">Reset Password & Login</button>
              <button type="button" className="auth-btn-ghost" onClick={() => { setStep(1); setMessage(''); }}>
                ← Go back
              </button>
            </form>
          )}

          {/* TOGGLE BOTTOM LINK */}
          {view !== 'forgotPassword' && step === 1 && (
            <p className="auth-toggle">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <span
                className="auth-toggle-link"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Auth;