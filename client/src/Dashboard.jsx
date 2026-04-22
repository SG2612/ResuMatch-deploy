// client/src/Dashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Loader2, Briefcase, Compass, LogOut, Sparkles,
  LayoutDashboard, History, Settings, Bell, Search,
  Calendar, MapPin, ExternalLink, ChevronRight, Zap, TrendingUp,
  MessageCircle, X, Send, MessageSquare, FileText, Download, Users,
  Sun, Moon, Target, AlertCircle, HelpCircle, CheckCircle, XCircle, Info
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import UpgradePro from './UpgradePro';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ─── TOAST SYSTEM ─────────────────────────────── */
const ToastContext = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle size={16} />}
            {t.type === 'error'   && <XCircle size={16} />}
            {t.type === 'info'    && <Info size={16} />}
            <span>{t.msg}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}><X size={13} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext);

/* ─── STYLES ────────────────────────────────────── */
const DASH_STYLES = `
  /* ── Extra variables ── */
  :root {
    --glass-bg: rgba(255,255,255,0.72);
    --glass-border: rgba(255,255,255,0.45);
    --glow-blue: rgba(59,130,246,0.35);
    --glow-amber: rgba(245,158,11,0.35);
    --glow-green: rgba(34,197,94,0.35);
  }

  /* ── Keyframes ── */
  @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-dot   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.8)} }
  @keyframes orbFloat    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.05)} }
  @keyframes glowPulse   { 0%,100%{box-shadow:0 0 0 0 var(--glow-blue)} 50%{box-shadow:0 0 24px 6px var(--glow-blue)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInRight{ from{opacity:0;transform:translateX(14px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn     { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes toastIn     { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut    { to{opacity:0;transform:translateX(110%)} }
  @keyframes progressFill{ from{width:0} to{width:var(--target-width,100%)} }
  @keyframes scoreReveal { from{--score-pct:0%} to{--score-pct:var(--score-end,78%)} }
  @keyframes borderGlow  { 0%,100%{border-color:rgba(59,130,246,0.25)} 50%{border-color:rgba(59,130,246,0.6)} }
  @keyframes shimmerShine{
    0%   { background-position:-200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes dashMove    { to{ stroke-dashoffset: -20; } }
  @keyframes ringFill    {
    from { background: conic-gradient(var(--ring-color,#22c55e) 0%, #e2e8f0 0%); }
    to   { background: conic-gradient(var(--ring-color,#22c55e) var(--ring-end,78%), #e2e8f0 0%); }
  }
  @keyframes badgePulse  { 0%,100%{transform:scale(1)} 40%{transform:scale(1.15)} }
  @keyframes uploadPulse { 0%,100%{border-color:var(--blue-400);box-shadow:0 0 0 0 rgba(59,130,246,0.3)} 50%{border-color:var(--blue-500);box-shadow:0 0 0 6px rgba(59,130,246,0)} }
  @keyframes chatPop     { 0%{opacity:0;transform:scale(0.88) translateY(18px)} 70%{transform:scale(1.03) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes typingBounce{ 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
  @keyframes msgSlide    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gradientShift{
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes navItemIn   { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }

  /* ── Layout ── */
  .dash-layout {
    display:flex; height:100vh; width:100vw;
    background:linear-gradient(135deg,#f0f4ff 0%,#f8fafc 50%,#fff7ed 100%);
    font-family:var(--font-body); transition:background 0.4s;
    background-size:400% 400%;
  }

  /* ── SIDEBAR ── */
  .dash-sidebar {
    width:256px; background:var(--navy-950);
    color:#f8fafc; display:flex; flex-direction:column;
    flex-shrink:0; position:relative; overflow:hidden; z-index:20;
    transition:width 0.3s cubic-bezier(.4,0,.2,1);
    box-shadow: 4px 0 24px rgba(0,0,0,0.18);
  }

  /* Decorative orbs */
  .dash-sidebar::before {
    content:''; position:absolute; width:220px; height:220px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
    top:-60px; left:-60px;
    animation: orbFloat 7s ease-in-out infinite;
    pointer-events:none;
  }
  .dash-sidebar::after {
    content:''; position:absolute; width:180px; height:180px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
    bottom:40px; right:-60px;
    animation: orbFloat 9s ease-in-out infinite reverse;
    pointer-events:none;
  }

  .dash-sidebar-logo {
    padding:22px 20px; border-bottom:1px solid rgba(255,255,255,0.07);
    display:flex; align-items:center; gap:12px; position:relative; z-index:1;
  }
  .dash-logo-icon {
    width:40px; height:40px;
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    border-radius:11px; display:flex; align-items:center; justify-content:center;
    font-size:18px; flex-shrink:0;
    box-shadow: 0 0 16px rgba(59,130,246,0.5), 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .dash-logo-icon:hover { transform:rotate(-8deg) scale(1.08); box-shadow:0 0 28px rgba(59,130,246,0.7), 0 4px 16px rgba(0,0,0,0.3); }

  .dash-logo-text {
    font-family:var(--font-display); font-size:1.18rem; font-weight:800;
    background:linear-gradient(135deg,#fff 30%,var(--amber-400));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    letter-spacing:-0.01em;
  }
  .dash-logo-badge {
    font-size:0.58rem; font-family:var(--font-display); font-weight:800; letter-spacing:0.1em;
    background:linear-gradient(135deg,var(--amber-400),#f97316);
    color:var(--navy-950); padding:3px 7px; border-radius:5px;
    text-transform:uppercase; margin-left:auto; flex-shrink:0;
    animation: badgePulse 3s ease-in-out infinite;
    box-shadow:0 2px 8px rgba(245,158,11,0.4);
  }

  .dash-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:3px; position:relative; z-index:1; }
  .dash-nav-label {
    font-family:var(--font-display); font-size:0.62rem; font-weight:700; letter-spacing:0.14em;
    text-transform:uppercase; color:rgba(148,163,184,0.45); padding:10px 8px 4px; margin-top:8px;
  }
  .dash-nav-btn {
    display:flex; align-items:center; gap:11px; padding:11px 13px;
    background:transparent; color:#94a3b8; border:none; border-radius:10px;
    cursor:pointer; font-family:var(--font-body); font-size:0.88rem; font-weight:500;
    transition:all 0.2s cubic-bezier(.4,0,.2,1); text-align:left;
    position:relative; width:100%; overflow:hidden;
    animation: navItemIn 0.3s ease both;
  }
  .dash-nav-btn::before {
    content:''; position:absolute; inset:0; border-radius:10px;
    background:linear-gradient(90deg,rgba(59,130,246,0.08),rgba(99,102,241,0.08));
    opacity:0; transition:opacity 0.2s;
  }
  .dash-nav-btn:hover::before { opacity:1; }
  .dash-nav-btn:hover { color:#e2e8f0; transform:translateX(3px); }
  .dash-nav-btn.active {
    background:linear-gradient(90deg,rgba(59,130,246,0.22),rgba(99,102,241,0.14));
    color:#fff; font-weight:600;
    border:1px solid rgba(59,130,246,0.35);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 8px rgba(59,130,246,0.15);
  }
  .dash-nav-btn.active::after {
    content:''; position:absolute; left:0; top:20%; bottom:20%;
    width:3px; background:linear-gradient(180deg,var(--blue-400),var(--indigo-400));
    border-radius:0 3px 3px 0; box-shadow:0 0 8px var(--blue-400);
  }
  .dash-nav-btn .nav-icon { opacity:0.7; flex-shrink:0; transition:opacity 0.2s, transform 0.2s; }
  .dash-nav-btn.active .nav-icon { opacity:1; }
  .dash-nav-btn:hover .nav-icon { opacity:0.9; transform:scale(1.1); }

  .dash-sidebar-footer { padding:14px 12px; border-top:1px solid rgba(255,255,255,0.07); position:relative; z-index:1; }

  /* ── MAIN ── */
  .dash-main { flex:1; display:flex; flex-direction:column; min-width:0; }

  /* ── HEADER ── */
  .dash-header {
    height:64px;
    background:var(--glass-bg);
    backdrop-filter: blur(16px) saturate(1.8);
    -webkit-backdrop-filter: blur(16px) saturate(1.8);
    border-bottom:1px solid var(--glass-border);
    display:flex; align-items:center; justify-content:space-between; padding:0 32px;
    flex-shrink:0; z-index:10;
    box-shadow: 0 1px 0 rgba(255,255,255,0.6), 0 4px 16px rgba(0,0,0,0.06);
    transition: background 0.3s;
  }
  .dash-search {
    display:flex; align-items:center; gap:9px;
    background:rgba(241,245,249,0.8);
    padding:9px 16px; border-radius:30px;
    border:1px solid rgba(203,213,225,0.8);
    transition:all 0.25s cubic-bezier(.4,0,.2,1);
  }
  .dash-search:focus-within {
    border-color:var(--blue-400);
    box-shadow:0 0 0 3px rgba(59,130,246,0.12), 0 2px 8px rgba(59,130,246,0.08);
    background:#fff;
    transform:scale(1.01);
  }
  .dash-search input {
    border:none; outline:none; background:transparent;
    font-family:var(--font-body); font-size:0.875rem; color:var(--slate-700); width:220px;
  }
  .dash-search input::placeholder { color:var(--slate-400); }

  .dash-header-right { display:flex; align-items:center; gap:20px; }
  .dash-notif-btn {
    width:38px; height:38px; border-radius:10px;
    border:1px solid rgba(203,213,225,0.8);
    background:rgba(248,250,252,0.8);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:var(--slate-500);
    transition:all 0.2s;
    position:relative;
  }
  .dash-notif-btn:hover {
    background:#fff; color:var(--slate-700);
    box-shadow:0 4px 12px rgba(0,0,0,0.1);
    transform:translateY(-1px);
  }
  .notif-dot {
    position:absolute; top:7px; right:7px;
    width:8px; height:8px; border-radius:50%;
    background:var(--blue-500); border:2px solid #fff;
    animation:pulse-dot 2s ease-in-out infinite;
  }

  .dash-avatar-wrap {
    display:flex; align-items:center; gap:10px; cursor:pointer;
    position:relative; padding-left:18px;
    border-left:1px solid rgba(203,213,225,0.8);
  }
  .dash-avatar {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg,var(--blue-500),var(--indigo-500));
    display:flex; align-items:center; justify-content:center; color:white;
    font-family:var(--font-display); font-weight:700; font-size:0.95rem;
    box-shadow:0 0 0 2px rgba(59,130,246,0.3), 0 2px 8px rgba(59,130,246,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .dash-avatar-wrap:hover .dash-avatar { transform:scale(1.08); box-shadow:0 0 0 3px rgba(59,130,246,0.5); }
  .dash-avatar-name { font-family:var(--font-display); font-weight:600; font-size:0.875rem; color:var(--slate-700); transition:color 0.3s; }
  .dash-dropdown {
    position:absolute; top:calc(100% + 12px); right:0; width:175px;
    background:#fff; border:1px solid var(--slate-200); border-radius:12px;
    box-shadow:0 20px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06);
    padding:6px; z-index:50; animation:scaleIn 0.15s cubic-bezier(.4,0,.2,1);
    transform-origin: top right;
  }
  .dash-dropdown-item {
    width:100%; padding:10px 13px; background:none; border:none; text-align:left;
    font-family:var(--font-body); font-size:0.875rem; cursor:pointer; border-radius:8px;
    transition:background 0.15s; display:flex; align-items:center; gap:8px;
    color:var(--red-500); font-weight:500;
  }
  .dash-dropdown-item:hover { background:#fef2f2; }

  /* ── CONTENT ── */
  .dash-content {
    flex:1; overflow-y:auto; padding:36px 40px;
    animation:fadeUp 0.4s cubic-bezier(.22,.68,0,1.1) both;
    scrollbar-width:thin; scrollbar-color:rgba(148,163,184,0.3) transparent;
  }
  .dash-content::-webkit-scrollbar { width:6px; }
  .dash-content::-webkit-scrollbar-track { background:transparent; }
  .dash-content::-webkit-scrollbar-thumb { background:rgba(148,163,184,0.3); border-radius:3px; }

  /* ── PAGE HEADER ── */
  .page-heading {
    font-family:var(--font-display); font-size:1.75rem; font-weight:800;
    color:var(--slate-900); margin:0 0 6px; letter-spacing:-0.02em; transition:color 0.3s;
    background:linear-gradient(135deg, var(--slate-900) 40%, var(--slate-600));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .page-sub { color:var(--slate-500); margin:0; font-size:0.93rem; font-weight:400; line-height:1.5; transition:color 0.3s; }

  /* ── CARDS ── */
  .card {
    background:#fff; border-radius:16px; border:1px solid rgba(226,232,240,0.8);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
    overflow:hidden; transition: transform 0.2s, box-shadow 0.2s, background 0.3s, border-color 0.3s;
  }
  .card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .card-p { padding:28px; }
  .card-lift:hover { transform:translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.1); }

  /* Shimmer shine effect on hover */
  .card-shine {
    position:relative; overflow:hidden;
  }
  .card-shine::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%);
    background-size:200% 100%; background-position:200% 0;
    transition:background-position 0.5s; pointer-events:none;
    border-radius:inherit;
  }
  .card-shine:hover::after { background-position:-200% 0; }

  /* Gradient top border helper */
  .card-accent-blue  { border-top:3px solid var(--blue-500); }
  .card-accent-amber { border-top:4px solid var(--amber-500); }
  .card-accent-green { border-top:3px solid #22c55e; }
  .card-accent-indigo{ border-top:3px solid var(--indigo-500); }
  .card-accent-red   { border-top:4px solid var(--red-500); }

  /* ── UPLOAD ZONE ── */
  .upload-zone {
    border:2px dashed var(--slate-300); padding:48px 30px; border-radius:14px;
    text-align:center; cursor:pointer; background:linear-gradient(135deg,#f8faff,#fafbfc);
    transition:all 0.25s cubic-bezier(.4,0,.2,1);
    position:relative; overflow:hidden;
  }
  .upload-zone::before {
    content:''; position:absolute; inset:-1px;
    border-radius:14px;
    background:linear-gradient(135deg, rgba(59,130,246,0), rgba(99,102,241,0));
    transition:opacity 0.3s; opacity:0; pointer-events:none;
  }
  .upload-zone:hover { border-color:var(--blue-400); background:rgba(59,130,246,0.03); transform:scale(1.005); }
  .upload-zone:hover::before { opacity:1; background:linear-gradient(135deg,rgba(59,130,246,0.06),rgba(99,102,241,0.04)); }
  .upload-zone.dragging {
    border-color:var(--blue-500); background:rgba(59,130,246,0.07);
    animation:uploadPulse 1.5s ease-in-out infinite;
    transform:scale(1.01);
  }
  .upload-icon-wrap {
    width:76px; height:76px;
    background:linear-gradient(135deg,#e0e7ff,#dbeafe);
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    margin:0 auto 18px;
    transition:transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 4px 16px rgba(99,102,241,0.15);
  }
  .upload-zone:hover .upload-icon-wrap { transform:scale(1.1) rotate(-5deg); box-shadow:0 8px 24px rgba(99,102,241,0.25); }
  .upload-filename { font-family:var(--font-display); font-weight:700; font-size:1.05rem; color:var(--slate-800); margin:0 0 4px; }
  .upload-hint { font-size:0.85rem; color:var(--slate-400); margin:0; }

  /* ── BUTTONS ── */
  .btn-analyze {
    width:100%; margin-top:22px; padding:15px; border:none; border-radius:11px;
    font-family:var(--font-display); font-size:1rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:all 0.22s cubic-bezier(.4,0,.2,1); letter-spacing:0.02em;
    position:relative; overflow:hidden;
  }
  .btn-analyze::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    background-size:200% 100%; background-position:200% 0;
    transition:background-position 0.5s; pointer-events:none;
  }
  .btn-analyze.ready {
    background:linear-gradient(135deg,var(--indigo-500),var(--blue-600));
    color:#fff; box-shadow:0 4px 20px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-analyze.ready:hover {
    transform:translateY(-2px);
    box-shadow:0 8px 28px rgba(59,130,246,0.45);
    background:linear-gradient(135deg,#6366f1,#2563eb);
  }
  .btn-analyze.ready:hover::after { background-position:-200% 0; }
  .btn-analyze.ready:active { transform:translateY(0); }
  .btn-analyze.disabled { background:var(--slate-100); color:var(--slate-400); cursor:not-allowed; box-shadow:none; }

  /* ── JOB CARDS ── */
  .job-card {
    background:#fff; border-radius:14px; border:1px solid rgba(226,232,240,0.8);
    padding:20px 22px; box-shadow:0 1px 6px rgba(0,0,0,0.04);
    transition:all 0.22s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden;
    animation:fadeUp 0.35s ease both;
  }
  .job-card::before {
    content:''; position:absolute; left:0; top:0; bottom:0; width:0;
    background:linear-gradient(180deg,var(--blue-500),var(--indigo-500));
    transition:width 0.22s; border-radius:14px 0 0 14px;
  }
  .job-card:hover::before { width:4px; }
  .job-card:hover { border-color:rgba(147,197,253,0.7); box-shadow:0 8px 28px rgba(59,130,246,0.1); transform:translateY(-2px); }
  .job-title { font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:var(--slate-900); margin:0 0 3px; }
  .job-company { color:var(--blue-600); font-weight:600; font-size:0.875rem; margin:0 0 14px; }
  .job-badge { padding:4px 10px; border-radius:20px; font-family:var(--font-display); font-size:0.7rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; }
  .job-badge.fulltime { background:#dcfce7; color:#166534; }
  .job-badge.remote   { background:#dbeafe; color:#1e40af; }
  .job-meta { display:flex; gap:16px; color:var(--slate-500); font-size:0.845rem; margin-bottom:14px; }
  .job-meta span { display:flex; align-items:center; gap:5px; }

  /* Animated Match Score Ring */
  .match-ring-wrap { position:absolute; top:18px; right:20px; }
  .match-ring {
    width:50px; height:50px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    transition:transform 0.3s;
    box-shadow:0 2px 10px rgba(0,0,0,0.1);
    animation:ringFill 1.2s cubic-bezier(.4,0,.2,1) both;
  }
  .match-ring:hover { transform:scale(1.08); }
  .match-ring-inner {
    width:40px; height:40px; border-radius:50%; background:#fff;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-display); font-weight:800; font-size:0.8rem;
  }

  /* ── ATS GAUGE ── */
  .ats-gauge-wrap { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
  .ats-gauge {
    width:140px; height:140px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(0,0,0,0.1);
    animation:ringFill 1.5s cubic-bezier(.4,0,.2,1) 0.2s both;
  }
  .ats-gauge-inner {
    width:115px; height:115px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; flex-direction:column;
    background:#fff;
    box-shadow:inset 0 2px 8px rgba(0,0,0,0.06);
  }
  .ats-gauge-score {
    font-size:2.6rem; font-weight:800; font-family:var(--font-display); line-height:1;
  }
  .ats-gauge-label { font-size:0.7rem; font-weight:700; color:var(--slate-400); text-transform:uppercase; letter-spacing:0.05em; margin-top:2px; }

  /* Progress bars */
  .progress-bar-wrap { background:#f1f5f9; border-radius:999px; height:8px; overflow:hidden; }
  .progress-bar {
    height:100%; border-radius:999px;
    animation:progressFill 1.2s cubic-bezier(.4,0,.2,1) 0.3s both;
    width:var(--target-width,0%);
  }

  /* ── HISTORY ── */
  .history-card {
    background:#fff; border-radius:14px; border:1px solid rgba(226,232,240,0.8);
    padding:22px; box-shadow:0 1px 4px rgba(0,0,0,0.04);
    animation:fadeUp 0.35s ease both;
    transition:box-shadow 0.2s, transform 0.2s;
    position:relative; overflow:hidden;
  }
  .history-card::before {
    content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
    background:linear-gradient(180deg,var(--blue-400),var(--indigo-500));
  }
  .history-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.08); transform:translateY(-1px); }
  .history-tag {
    background:linear-gradient(135deg,#eff6ff,#e0e7ff); color:var(--blue-700);
    padding:4px 12px; border-radius:999px; font-size:0.8rem;
    font-family:var(--font-display); font-weight:600;
    border:1px solid rgba(191,219,254,0.5);
  }
  .history-date { display:flex; align-items:center; gap:6px; color:var(--slate-400); font-size:0.83rem; }

  /* ── RESUME ANALYSIS ── */
  .ra-section-label { display:flex; align-items:center; gap:7px; margin-bottom:12px; }
  .ra-section-label span { font-family:var(--font-display); font-size:0.7rem; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:var(--slate-500); }

  .ra-domain-pill {
    display:inline-flex; align-items:center; gap:7px; padding:7px 16px;
    background:linear-gradient(135deg,#eff6ff,#e0e7ff);
    color:var(--blue-700); border:1px solid rgba(191,219,254,0.6);
    border-radius:999px; font-size:0.84rem; font-weight:600;
    font-family:var(--font-display); transition:all 0.2s;
    animation:scaleIn 0.3s ease both;
  }
  .ra-domain-pill:hover { background:linear-gradient(135deg,#dbeafe,#c7d2fe); border-color:#93c5fd; transform:translateY(-2px) scale(1.02); box-shadow:0 4px 12px rgba(59,130,246,0.15); }

  .ra-insight-row {
    display:flex; gap:12px; align-items:flex-start;
    padding:14px 16px; border-radius:10px;
    background:#f8fafc; border-left:3px solid transparent;
    transition:transform 0.2s, box-shadow 0.2s;
    animation:slideInLeft 0.3s ease both;
  }
  .ra-insight-row:hover { transform:translateX(3px); }
  .ra-insight-row.success { border-left-color:#22c55e; background:linear-gradient(135deg,#f0fdf4,#f8fffe); }
  .ra-insight-row.warn    { border-left-color:#f59e0b; background:linear-gradient(135deg,#fffbeb,#fffef5); }
  .ra-insight-row.neutral { border-left-color:var(--blue-400); background:linear-gradient(135deg,#eff6ff,#f5f8ff); }
  .ra-insight-num {
    width:22px; height:22px; border-radius:50%; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-display); font-size:0.72rem; font-weight:800;
  }
  .ra-insight-row.success .ra-insight-num { background:#dcfce7; color:#15803d; }
  .ra-insight-row.warn    .ra-insight-num { background:#fef9c3; color:#b45309; }
  .ra-insight-row.neutral .ra-insight-num { background:#dbeafe; color:var(--blue-700); }
  .ra-insight-text { font-size:0.9rem; line-height:1.65; color:var(--slate-700); margin:0; }

  /* ── SKILL CHIPS ── */
  .skills-card-header {
    display:flex; align-items:center; gap:12px; padding:20px 28px;
    background:linear-gradient(135deg,#fffbeb,#fff7ed);
    border-bottom:1px solid #fde68a;
  }
  .skills-card-title { margin:0; font-family:var(--font-display); font-size:1.1rem; font-weight:800; color:#92400e; }
  .skills-card-sub   { margin:2px 0 0; font-size:0.83rem; color:#b45309; }
  .skill-chip {
    background:linear-gradient(135deg,#fff7ed,#fffbeb); color:#c2410c;
    padding:10px 18px; border-radius:10px; font-size:0.9rem; font-weight:700;
    border:1.5px solid #fed7aa; display:inline-flex; align-items:center;
    gap:8px; font-family:var(--font-display);
    transition:all 0.2s; animation:scaleIn 0.3s ease both;
    box-shadow:0 2px 6px rgba(251,146,60,0.12);
  }
  .skill-chip:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 6px 16px rgba(251,146,60,0.22); border-color:#fdba74; }
  .skill-chip-num {
    width:22px; height:22px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,#f97316,#ef4444);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:0.68rem; color:#fff; font-weight:800;
  }

  /* ── ATS CARD ── */
  .ats-card-header {
    display:flex; align-items:center; gap:14px; padding:20px 28px;
    background:#f8fafc; border-bottom:1px solid var(--slate-200);
  }
  .ats-card-title { margin:0; font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:var(--slate-800); }
  .ats-card-sub   { margin:2px 0 0; font-size:0.83rem; color:var(--slate-500); }
  .ats-improve-heading { margin:0 0 16px; font-family:var(--font-display); font-size:1rem; color:var(--slate-800); font-weight:700; }
  .ats-suggestion-text { font-size:0.91rem; color:var(--slate-700); line-height:1.55; }
  .ats-suggestion-item {
    display:flex; gap:12px; align-items:flex-start; padding:12px 16px;
    border-radius:10px; background:#fafbff; border:1px solid var(--slate-100);
    transition:all 0.2s; animation:slideInLeft 0.3s ease both;
  }
  .ats-suggestion-item:hover { background:#f0f4ff; border-color:rgba(147,197,253,0.4); transform:translateX(3px); }

  /* ── CHATBOT ── */
  .chat-fab {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    width:58px; height:58px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(59,130,246,0.45), 0 0 0 0 rgba(59,130,246,0.3);
    transition:all 0.3s cubic-bezier(.34,1.56,.64,1);
    animation:glowPulse 3s ease-in-out infinite;
  }
  .chat-fab:hover { transform:scale(1.12) translateY(-2px); box-shadow:0 8px 28px rgba(59,130,246,0.55); }
  .chat-fab-badge {
    position:absolute; top:-4px; right:-4px;
    background:linear-gradient(135deg,var(--amber-400),#f97316);
    color:var(--navy-950); font-size:0.55rem; font-weight:900;
    font-family:var(--font-display); padding:2px 5px; border-radius:6px;
    letter-spacing:0.06em; border:2px solid #fff;
    animation:badgePulse 2.5s ease-in-out infinite;
  }
  .chat-window {
    position:fixed; bottom:100px; right:28px; z-index:9998;
    width:360px; border-radius:20px; overflow:hidden;
    box-shadow:0 24px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1);
    display:flex; flex-direction:column;
    animation:chatPop 0.35s cubic-bezier(.22,.68,0,1.1) both;
    background:#fff; border:1px solid rgba(226,232,240,0.7);
    max-height:520px;
  }
  .chat-header {
    padding:16px 18px; 
    background:linear-gradient(135deg,var(--navy-950),#1e293b);
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0;
  }
  .chat-header-left { display:flex; align-items:center; gap:11px; }
  .chat-header-avatar {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg,var(--blue-500),var(--indigo-500));
    display:flex; align-items:center; justify-content:center;
    font-size:16px; color:#fff;
    box-shadow:0 0 12px rgba(59,130,246,0.5);
  }
  .chat-header-name { font-family:var(--font-display); font-weight:700; font-size:0.9rem; color:#fff; margin:0; }
  .chat-header-status { display:flex; align-items:center; gap:5px; font-size:0.75rem; color:#94a3b8; margin:2px 0 0; }
  .chat-status-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:pulse-dot 2s ease-in-out infinite; display:inline-block; }
  .chat-close-btn { background:rgba(255,255,255,0.1); border:none; color:#94a3b8; cursor:pointer; border-radius:8px; padding:6px; transition:all 0.2s; }
  .chat-close-btn:hover { background:rgba(255,255,255,0.2); color:#fff; }
  .chat-messages { flex:1; overflow:hidden; display:flex; flex-direction:column; background:linear-gradient(160deg,#f8fafc,#f0f4ff); }
  .chat-bubble {
    padding:11px 15px; border-radius:14px; font-size:0.875rem; line-height:1.6;
    max-width:85%; word-break:break-word; animation:msgSlide 0.25s ease both;
  }
  .chat-bubble.user {
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    color:#fff; border-radius:14px 14px 4px 14px;
    box-shadow:0 2px 10px rgba(59,130,246,0.3);
  }
  .chat-bubble.bot {
    background:#fff; color:var(--slate-700); border:1px solid var(--slate-200);
    border-radius:4px 14px 14px 14px;
    box-shadow:0 2px 8px rgba(0,0,0,0.05);
  }
  .chat-msg { display:flex; align-items:flex-end; gap:8px; padding:0 16px; }
  .chat-bot-avatar { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,var(--blue-500),var(--indigo-400)); display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; flex-shrink:0; }
  .chat-typing { display:flex; align-items:center; gap:4px; padding:12px 16px; background:#fff; border-radius:14px; border:1px solid var(--slate-200); box-shadow:0 2px 8px rgba(0,0,0,0.05); }
  .chat-typing span { width:7px; height:7px; border-radius:50%; background:var(--blue-400); animation:typingBounce 1.2s ease-in-out infinite; }
  .chat-typing span:nth-child(2){ animation-delay:0.2s; }
  .chat-typing span:nth-child(3){ animation-delay:0.4s; }
  .chat-input-row { display:flex; gap:10px; padding:12px 14px; background:#fff; border-top:1px solid var(--slate-100); flex-shrink:0; }
  .chat-input {
    flex:1; resize:none; border:1px solid var(--slate-200); border-radius:10px;
    padding:10px 13px; font-family:var(--font-body); font-size:0.875rem;
    background:#f8fafc; transition:all 0.2s; outline:none; color:var(--slate-700);
  }
  .chat-input:focus { border-color:var(--blue-400); background:#fff; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
  .chat-send-btn {
    width:42px; height:42px; border-radius:50%; border:none;
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
    flex-shrink:0; transition:all 0.2s; align-self:flex-end;
    box-shadow:0 2px 10px rgba(59,130,246,0.3);
  }
  .chat-send-btn:hover { transform:scale(1.08); box-shadow:0 4px 16px rgba(59,130,246,0.45); }
  .chat-send-btn:disabled { background:var(--slate-200); box-shadow:none; cursor:not-allowed; }

  /* ── MESSAGES TAB ── */
  .messages-layout { animation:fadeUp 0.35s ease both; display:flex; gap:20px; height:calc(100vh - 150px); }
  .messages-inbox { width:320px; display:flex; flex-direction:column; overflow:hidden; flex-shrink:0; border-radius:16px; }
  .messages-chat  { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f8fafc; border-radius:16px; }
  .convo-item {
    padding:16px 20px; border-bottom:1px solid var(--slate-100); cursor:pointer;
    transition:all 0.18s; position:relative;
  }
  .convo-item:hover { background:#f8fafc; }
  .convo-item.active { background:linear-gradient(135deg,#eff6ff,#e0e7ff); }
  .convo-item.active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:var(--blue-500); border-radius:0 3px 3px 0; }

  /* ── JOBS LAYOUT ── */
  .jobs-layout { animation:fadeUp 0.35s ease both; display:flex; gap:24px; height:calc(100vh - 160px); }
  .jobs-list { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:12px; padding-right:4px; }
  .jobs-map { flex:1.1; border-radius:16px; overflow:hidden; border:1px solid var(--slate-200); flex-shrink:0; min-height:300px; z-index:1; box-shadow:0 4px 20px rgba(0,0,0,0.07); }

  /* ── SETTINGS ── */
  .settings-row { padding:16px 0; border-bottom:1px solid var(--slate-100); }
  .settings-row:last-child { border-bottom:none; }
  .settings-key { font-family:var(--font-display); font-size:0.92rem; font-weight:600; color:var(--slate-700); margin:0 0 3px; }
  .settings-val { font-size:0.85rem; color:var(--slate-500); margin:0; }
  .settings-header { padding:18px 24px; border-bottom:1px solid var(--slate-200); display:flex; align-items:center; gap:10px; }
  .role-input-box { background:#f8fafc; border:1px solid var(--slate-200); }

  /* ── SIDEBAR LOGOUT ── */
  .btn-sidebar-exit {
    width:100%; padding:10px 12px;
    background:rgba(255,255,255,0.04); color:#94a3b8;
    border:1px solid rgba(255,255,255,0.08); border-radius:10px;
    font-family:var(--font-body); font-size:0.875rem; cursor:pointer;
    display:flex; align-items:center; gap:10px; transition:all 0.2s;
  }
  .btn-sidebar-exit:hover { background:rgba(239,68,68,0.14); color:#fca5a5; border-color:rgba(239,68,68,0.25); transform:translateX(2px); }

  /* ── TOAST NOTIFICATIONS ── */
  .toast-stack {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    z-index:99999; display:flex; flex-direction:column-reverse; gap:10px;
    pointer-events:none; align-items:center; width:360px; max-width:calc(100vw - 40px);
  }
  .toast {
    display:flex; align-items:center; gap:10px; padding:13px 18px;
    border-radius:12px; font-family:var(--font-body); font-size:0.875rem;
    pointer-events:all; animation:toastIn 0.4s cubic-bezier(.34,1.56,.64,1) both;
    box-shadow:0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);
    width:100%; border:1px solid transparent;
  }
  .toast span { flex:1; font-weight:500; }
  .toast button { background:none; border:none; cursor:pointer; opacity:0.6; transition:opacity 0.15s; padding:0; display:flex; }
  .toast button:hover { opacity:1; }
  .toast-success { background:linear-gradient(135deg,#f0fdf4,#dcfce7); color:#166534; border-color:#bbf7d0; }
  .toast-error   { background:linear-gradient(135deg,#fef2f2,#fee2e2); color:#991b1b; border-color:#fecaca; }
  .toast-info    { background:linear-gradient(135deg,#eff6ff,#dbeafe); color:#1e40af; border-color:#bfdbfe; }

  /* ── INTERVIEW TAB ── */
  .interview-q-card {
    padding:24px; border-radius:14px; border-left:4px solid var(--indigo-500);
    background:#fff; border:1px solid var(--slate-200);
    border-left:4px solid var(--indigo-500);
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
    transition:all 0.2s; animation:fadeUp 0.35s ease both;
  }
  .interview-q-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,0.1); border-color:rgba(147,197,253,0.5); }
  .interview-q-num {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--indigo-100),#dbeafe);
    color:var(--indigo-600); display:flex; align-items:center; justify-content:center;
    font-weight:800; font-family:var(--font-display); font-size:0.85rem;
    box-shadow:0 2px 6px rgba(99,102,241,0.2);
  }
  .interview-rationale {
    background:linear-gradient(135deg,#f8fafc,#f5f8ff); padding:14px 16px;
    border-radius:10px; border:1px solid var(--slate-200); margin-top:14px;
  }

  /* ── RECRUITER TAB ── */
  .recruiter-job-card {
    display:flex; justify-content:space-between; align-items:center;
    flex-wrap:wrap; gap:16px;
    background:#fff; border-radius:14px; padding:20px 22px;
    border:1px solid var(--slate-200); box-shadow:0 1px 4px rgba(0,0,0,0.04);
    transition:all 0.2s; animation:fadeUp 0.35s ease both;
  }
  .recruiter-job-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.08); transform:translateY(-1px); }

  /* ── LOADING SPINNER ── */
  .full-spinner { display:flex; align-items:center; justify-content:center; padding:80px 0; flex-direction:column; gap:16px; }
  .full-spinner p { color:var(--slate-400); font-family:var(--font-display); font-size:0.9rem; }

  /* ── DARK MODE ── */
  .dark-mode .dash-layout { background:linear-gradient(135deg,#0f172a 0%,#0c1322 100%) !important; }
  .dark-mode .dash-header { background:rgba(15,23,42,0.85) !important; border-bottom-color:rgba(51,65,85,0.8) !important; }
  .dark-mode .dash-search { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .dash-search input { color:#f8fafc !important; }
  .dark-mode .dash-notif-btn { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .dash-avatar-name { color:#f8fafc !important; }
  .dark-mode .dash-avatar-wrap { border-color:#334155 !important; }
  .dark-mode .dash-dropdown { background:#1e293b !important; border-color:#334155 !important; box-shadow:0 20px 48px rgba(0,0,0,0.5) !important; }
  .dark-mode .card { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .chat-window { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .chat-messages { background:linear-gradient(160deg,#0f172a,#0c1322) !important; }
  .dark-mode .chat-bubble.bot { background:#1e293b !important; color:#f8fafc !important; border-color:#334155 !important; }
  .dark-mode .chat-input-row { background:#1e293b !important; border-top-color:#334155 !important; }
  .dark-mode .chat-input { background:#0f172a !important; border-color:#334155 !important; color:#f8fafc !important; }
  .dark-mode .page-heading { background:linear-gradient(135deg,#f8fafc,#94a3b8) !important; -webkit-background-clip:text !important; -webkit-text-fill-color:transparent !important; background-clip:text !important; }
  .dark-mode .page-sub { color:#64748b !important; }
  .dark-mode .job-card { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .job-card:hover { background:#0f172a !important; border-color:var(--blue-500) !important; }
  .dark-mode .job-title { color:#f8fafc !important; }
  .dark-mode .history-card { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .ats-card-header { background:#0f172a !important; border-bottom-color:#334155 !important; }
  .dark-mode .ats-card-title,.dark-mode .ats-improve-heading { color:#f1f5f9 !important; }
  .dark-mode .ats-card-sub,.dark-mode .ats-suggestion-text { color:#94a3b8 !important; }
  .dark-mode .ats-gauge-inner { background:#1e293b !important; }
  .dark-mode .ats-suggestion-item { background:#0f172a !important; border-color:#334155 !important; }
  .dark-mode .skills-card-header { background:#1c1400 !important; border-bottom-color:#78350f !important; }
  .dark-mode .skills-card-title { color:#fcd34d !important; }
  .dark-mode .skills-card-sub { color:#fbbf24 !important; }
  .dark-mode .skill-chip { background:#1c1400 !important; color:#fdba74 !important; border-color:#92400e !important; }
  .dark-mode .ra-domain-pill { background:#1e3a5f !important; color:#93c5fd !important; border-color:#1e40af !important; }
  .dark-mode .ra-insight-row.success { background:#052e16 !important; }
  .dark-mode .ra-insight-row.warn    { background:#1c1400 !important; }
  .dark-mode .ra-insight-row.neutral { background:#0c1a2e !important; }
  .dark-mode .ra-insight-text { color:#cbd5e1 !important; }
  .dark-mode .upload-zone { background:#0f172a !important; border-color:#334155 !important; }
  .dark-mode .upload-zone:hover { background:rgba(59,130,246,0.1) !important; border-color:var(--blue-500) !important; }
  .dark-mode .upload-filename { color:#f8fafc !important; }
  .dark-mode .progress-bar-wrap { background:#334155 !important; }
  .dark-mode .match-ring-inner { background:#1e293b !important; color:#f8fafc !important; }
  .dark-mode .messages-inbox,.dark-mode .messages-chat { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .convo-item { border-bottom-color:#334155 !important; }
  .dark-mode .convo-item:hover { background:#0f172a !important; }
  .dark-mode .convo-item.active { background:linear-gradient(135deg,#1e3a5f,#1e293b) !important; }
  .dark-mode .settings-header { background:#1e293b !important; border-bottom-color:#334155 !important; }
  .dark-mode .role-input-box { background:#0f172a !important; border-color:#334155 !important; }
  .dark-mode .settings-key { color:#f8fafc !important; }
  .dark-mode .settings-val { color:#64748b !important; }
  .dark-mode input[type="text"], .dark-mode input[type="email"], .dark-mode textarea { background:#0f172a !important; border-color:#334155 !important; color:#f8fafc !important; }
  .dark-mode label { color:#94a3b8 !important; }
  .dark-mode h2,  .dark-mode h3,  .dark-mode h4  { color:#f1f5f9 !important; }
  .dark-mode strong { color:#f8fafc !important; }
  .dark-mode p:not(.chat-header-status) { color:#94a3b8 !important; }
  .dark-mode .history-tag { background:linear-gradient(135deg,#1e3a5f,#1e293b) !important; color:#93c5fd !important; border-color:#1e40af !important; }
  .dark-mode .interview-q-card { background:#1e293b !important; border-left-color:var(--indigo-400) !important; border-color:#334155 !important; }
  .dark-mode .interview-rationale { background:#0f172a !important; border-color:#334155 !important; }
  .dark-mode .recruiter-job-card { background:#1e293b !important; border-color:#334155 !important; }
  .dark-mode .btn-analyze.disabled { background:#334155 !important; color:#64748b !important; }
  .dark-mode .leaflet-layer,
  .dark-mode .leaflet-control-zoom-in,
  .dark-mode .leaflet-control-zoom-out,
  .dark-mode .leaflet-control-attribution { filter:invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
  .dark-mode .toast-success { background:linear-gradient(135deg,#052e16,#14532d) !important; border-color:#166534 !important; color:#86efac !important; }
  .dark-mode .toast-error   { background:linear-gradient(135deg,#450a0a,#7f1d1d) !important; border-color:#991b1b !important; color:#fca5a5 !important; }
  .dark-mode .toast-info    { background:linear-gradient(135deg,#0c1a2e,#1e3a5f) !important; border-color:#1e40af !important; color:#93c5fd !important; }
`;

/* ─── MAIN DASHBOARD ─────────────────────────── */
function Dashboard() {
  const [activeTab, setActiveTab] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('seeker');
  const [userEmail, setUserEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName  = localStorage.getItem('userName');
    const storedRole  = localStorage.getItem('userRole') || 'seeker';
    const storedEmail = localStorage.getItem('userEmail');
    const storedIsPro = localStorage.getItem('isPro') === 'true';

    if (!token) return navigate('/');
    if (storedRole === 'admin') return navigate('/admin');
    if (storedName) setUserName(storedName);
    if (storedEmail && storedEmail !== 'undefined') setUserEmail(storedEmail);
    setUserRole(storedRole);
    setIsPro(storedIsPro);
    if (storedRole === 'recruiter' && !activeTab) setActiveTab('recruiter');
    else if (storedRole === 'seeker' && !activeTab) setActiveTab('dashboard');
  }, [navigate, activeTab]);

  useEffect(() => {
    if (isDarkMode) { document.body.classList.add('dark-mode'); localStorage.setItem('theme','dark'); }
    else { document.body.classList.remove('dark-mode'); localStorage.setItem('theme','light'); }
  }, [isDarkMode]);

  useEffect(() => {
    let tid;
    const logoutIdle = () => { alert('Signed out due to 15 min inactivity.'); localStorage.clear(); navigate('/'); };
    const reset = () => { clearTimeout(tid); tid = setTimeout(logoutIdle, 15*60*1000); };
    const events = ['mousedown','mousemove','keypress','scroll','touchstart'];
    events.forEach(e => document.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(tid); events.forEach(e => document.removeEventListener(e, reset)); };
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const navItems = userRole === 'recruiter'
    ? [
        { id:'recruiter', icon:<Briefcase size={18}/>, label:'Post a Job' },
        { id:'messages',  icon:<MessageSquare size={18}/>, label:'Messages' },
        { id:'settings',  icon:<Settings size={18}/>, label:'Settings' },
      ]
    : [
        { id:'dashboard', icon:<LayoutDashboard size={18}/>, label:'Career Discovery' },
        { id:'ats',       icon:<Target size={18}/>,          label:'ATS Scanner' },
        { id:'interview', icon:<HelpCircle size={18}/>,      label:'Interview Prep' },
        { id:'jobs',      icon:<MapPin size={18}/>,          label:'Jobs Posted' },
        { id:'messages',  icon:<MessageSquare size={18}/>,   label:'Messages' },
        { id:'history',   icon:<History size={18}/>,         label:'Analysis History' },
        { id:'settings',  icon:<Settings size={18}/>,        label:'Settings' },
      ];

  return (
    <ToastProvider>
      <div className="dash-layout">
        <style>{DASH_STYLES}</style>

        {/* ── SIDEBAR ── */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-logo">
            <div className="dash-logo-icon">🔍</div>
            <span className="dash-logo-text">ResuMatch</span>
            <span className="dash-logo-badge">AI</span>
          </div>

          <nav className="dash-nav">
            <span className="dash-nav-label">Navigation</span>
            {navItems.map((item, i) => (
              <button
                key={item.id}
                className={`dash-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                style={{ animationDelay:`${i*0.04}s` }}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="dash-sidebar-footer">
            <button className="btn-sidebar-exit" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="dash-main">
          {/* ── HEADER ── */}
          <header className="dash-header">
            <div className="dash-search">
              <Search size={16} color="var(--slate-400)" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (activeTab !== 'history' && e.target.value) setActiveTab('history'); }}
              />
            </div>

            <div className="dash-header-right">
              <div className="dash-notif-btn" title="Toggle Dark Mode" onClick={() => setIsDarkMode(v => !v)}>
                {isDarkMode ? <Sun size={17} color="var(--amber-400)" /> : <Moon size={17} />}
              </div>
              <div className="dash-notif-btn" title="Notifications">
                <Bell size={17} />
                <span className="notif-dot" />
              </div>
              <div className="dash-avatar-wrap" onClick={() => setShowProfileMenu(v => !v)}>
                <div className="dash-avatar">{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                <span className="dash-avatar-name">{userName || 'User'}</span>
                {showProfileMenu && (
                  <div className="dash-dropdown">
                    <button className="dash-dropdown-item" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── CONTENT ── */}
          <main
            className="dash-content"
            style={{ maxWidth: activeTab==='jobs' || activeTab==='messages' ? '100%' : '880px', margin:'0 auto', width:'100%' }}
            onClick={() => setShowProfileMenu(false)}
          >
            {userRole==='seeker' && activeTab==='dashboard' && <DiscoveryTab userName={userName} setActiveTab={setActiveTab} />}
            {userRole==='seeker' && activeTab==='ats'       && <AtsTab />}
            {userRole==='seeker' && activeTab==='interview' && <InterviewTab />}
            {userRole==='seeker' && activeTab==='jobs'      && <JobsTab />}
            {userRole==='seeker' && activeTab==='history'   && <HistoryTab searchQuery={searchQuery} />}
            {userRole==='recruiter' && activeTab==='recruiter' && <RecruiterTab />}
            {activeTab==='messages' && <MessagesTab />}
            {activeTab==='settings' && <SettingsTab userName={userName} userRole={userRole} userEmail={userEmail} isPro={isPro} />}
          </main>
        </div>

        <Chatbot />
      </div>
    </ToastProvider>
  );
}

/* ─── CHATBOT ────────────────────────────────── */
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:'bot', text:"Hi! I'm your ResuMatch AI assistant ✦\nAsk me anything about your career, resume, or job search!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { if (isOpen) endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isTyping, isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setMessages(p => [...p, { role:'user', text }]);
    setInput(''); setIsTyping(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resume/chat`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},
        body:JSON.stringify({ message:text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(p => [...p, { role:'bot', text: data.reply ?? 'Sorry, could not respond.' }]);
    } catch {
      setMessages(p => [...p, { role:'bot', text:'Something went wrong. Please try again!' }]);
    } finally { setIsTyping(false); }
  };

  const handleKey = e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      <button className="chat-fab" onClick={() => setIsOpen(v => !v)} title="Chat with AI">
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && <span className="chat-fab-badge">AI</span>}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-header-avatar">✦</div>
              <div>
                <p className="chat-header-name">ResuMatch Assistant</p>
                <p className="chat-header-status"><span className="chat-status-dot" /> Online</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>

          <div className="chat-messages">
            <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {messages.map((m,i) => {
                const mine = m.role !== 'bot';
                return (
                  <div key={i} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'8px', animationDelay:`${i*0.04}s` }}>
                    {!mine && <div className="chat-bot-avatar">✦</div>}
                    <div className={`chat-bubble ${mine?'user':'bot'}`}>{m.text}</div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="chat-msg">
                  <div className="chat-bot-avatar">✦</div>
                  <div className="chat-typing"><span/><span/><span/></div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input" rows={1}
              placeholder="Ask about your career…"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            />
            <button className="chat-send-btn" onClick={send} disabled={!input.trim() || isTyping}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── DISCOVERY TAB ──────────────────────────── */
function DiscoveryTab({ userName, setActiveTab }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [desiredDomain, setDesiredDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result && resultsRef.current) setTimeout(() => resultsRef.current.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
  }, [result]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const domainSnapshot = desiredDomain.trim();
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('desiredDomain', domainSnapshot);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/analyze`, formData, {
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data.data;
      data._desiredDomain = domainSnapshot;
      setResult(data);
      toast('Analysis complete! Scroll down to view results.', 'success');
    } catch {
      toast('Analysis failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <h2 className="page-heading">Welcome back, {userName.split(' ')[0] || 'there'} 👋</h2>
        <p className="page-sub">Upload your latest resume to discover your ideal career path powered by AI.</p>
      </div>

      <div className="card card-p card-shine card-accent-blue" style={{ marginBottom:'24px' }}>
        <label htmlFor="resume-upload">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap">
              {file ? <CheckCircle size={30} color="#22c55e" /> : <Upload size={30} color="#4f46e5" />}
            </div>
            <p className="upload-filename">
              {file ? `✓ ${file.name}` : 'Drop your resume here, or click to browse'}
            </p>
            <p className="upload-hint">{file ? 'Ready to analyse — click Generate below' : 'Accepts PDF files · Drag & drop enabled'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} id="resume-upload" />

        <div style={{ marginTop:'20px' }}>
          <label style={{ display:'block', fontSize:'0.83rem', fontWeight:'700', color:'var(--slate-600)', marginBottom:'8px', letterSpacing:'0.03em' }}>
            🎯 Target Role <span style={{ fontWeight:400, color:'var(--slate-400)' }}>(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Data Scientist, ML Engineer, Blockchain Developer..."
            value={desiredDomain}
            onChange={e => setDesiredDomain(e.target.value)}
            style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1px solid var(--slate-300)', fontSize:'0.9rem', outline:'none', transition:'all 0.2s', fontFamily:'var(--font-body)', boxSizing:'border-box' }}
            onFocus={e => { e.target.style.borderColor='var(--blue-400)'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor='var(--slate-300)'; e.target.style.boxShadow='none'; }}
          />
        </div>

        <button className={`btn-analyze ${loading||!file?'disabled':'ready'}`} onClick={handleAnalyze} disabled={loading||!file}>
          {loading
            ? <><Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} /> Processing with AI…</>
            : <><Sparkles size={18} /> Generate Career Insights</>
          }
        </button>
      </div>

      {result && (
        <div ref={resultsRef} style={{ display:'flex', flexDirection:'column', gap:'22px', animation:'fadeUp 0.4s ease both' }}>

          {/* Analysis Card */}
          <div className="card card-accent-blue card-shine card-lift" style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'20px 28px', background:'linear-gradient(135deg,#f8faff,#f0f4ff)', borderBottom:'1px solid rgba(226,232,240,0.7)' }}>
              <div style={{ width:44, height:44, borderRadius:'12px', background:'linear-gradient(135deg,#eff6ff,#dbeafe)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(99,102,241,0.15)' }}>
                <Sparkles size={20} color="var(--blue-600)" />
              </div>
              <div>
                <h3 style={{ margin:0, fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--slate-800)' }}>Resume Analysis</h3>
                <p style={{ margin:'2px 0 0', fontSize:'0.8rem', color:'var(--slate-500)' }}>AI-powered insights from your uploaded document</p>
              </div>
            </div>

            <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:'24px' }}>
              <div>
                <div className="ra-section-label">
                  <Compass size={14} color="var(--indigo-500)" />
                  <span>Best-Fit Domains</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {result.suggestedDomains?.map((d,i) => (
                    <span key={i} className="ra-domain-pill" style={{ animationDelay:`${i*0.07}s` }}>
                      <TrendingUp size={12} /> {d}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop:'1px solid rgba(226,232,240,0.7)' }} />

              <div>
                <div className="ra-section-label">
                  <ChevronRight size={14} color="var(--blue-500)" />
                  <span>Key Insights</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {(() => {
                    const items = Array.isArray(result.careerAdvice) ? result.careerAdvice : [result.careerAdvice];
                    const pos = /strong|excellent|great|good|solid|impressive|proficient|highlight|advantage|expertise|effective/i;
                    const warn = /improve|consider|missing|lack|add|update|weak|gap|unclear|avoid|better|could|should|recommend/i;
                    return items.map((adv,i) => {
                      const tone = pos.test(adv)?'success':warn.test(adv)?'warn':'neutral';
                      return (
                        <div key={i} className={`ra-insight-row ${tone}`} style={{ animationDelay:`${i*0.06}s` }}>
                          <div className="ra-insight-num">{i+1}</div>
                          <p className="ra-insight-text">{adv}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="card card-accent-amber card-shine card-lift" style={{ overflow:'hidden' }}>
            <div className="skills-card-header">
              <div style={{ width:42, height:42, borderRadius:'10px', background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(245,158,11,0.35)' }}>
                <Zap size={20} color="#fff" />
              </div>
              <div>
                <h3 className="skills-card-title">
                  {result._desiredDomain ? `Skills to Acquire for ${result._desiredDomain}` : 'Recommended Skills to Strengthen'}
                </h3>
                <p className="skills-card-sub">
                  {result._desiredDomain ? 'Skill gaps between your resume and target role' : 'Skills that would make your profile more competitive'}
                </p>
              </div>
            </div>
            <div style={{ padding:'24px 28px' }}>
              {result.missingSkills?.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
                  {result.missingSkills.map((skill,i) => (
                    <span key={i} className="skill-chip" style={{ animationDelay:`${i*0.06}s` }}>
                      <span className="skill-chip-num">{i+1}</span> {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--slate-400)' }}>
                  <Zap size={32} color="#fde68a" style={{ display:'block', margin:'0 auto 12px' }} />
                  <p style={{ margin:0, fontSize:'0.9rem' }}>Enter a Target Role above to see personalized skill gaps.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('jobs')}
            style={{ alignSelf:'flex-start', padding:'13px 26px', background:'linear-gradient(135deg,var(--blue-600),var(--indigo-500))', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.22s', boxShadow:'0 4px 16px rgba(59,130,246,0.35)' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(59,130,246,0.45)'; }}
            onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 16px rgba(59,130,246,0.35)'; }}
          >
            View Live Job Matches <ExternalLink size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── ATS TAB ────────────────────────────────── */
function AtsTab() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleScan = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('desiredDomain', '');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/analyze`, formData, {
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` },
      });
      setResult(res.data.data);
      toast('ATS scan complete!', 'success');
    } catch {
      toast('ATS Scan failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <h2 className="page-heading">ATS Resume Scanner</h2>
        <p className="page-sub">Check if your resume can pass through Applicant Tracking Systems with confidence.</p>
      </div>

      <div className="card card-p card-shine card-accent-indigo" style={{ marginBottom:'24px' }}>
        <label htmlFor="ats-upload">
          <div
            className={`upload-zone ${dragging?'dragging':''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap">
              {file ? <CheckCircle size={30} color="#22c55e" /> : <Target size={30} color="#4f46e5" />}
            </div>
            <p className="upload-filename">{file ? `✓ ${file.name}` : 'Drop your resume here to scan'}</p>
            <p className="upload-hint">{file ? 'Ready to scan — click Run ATS Check below' : 'Accepts PDF files'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} id="ats-upload" />

        <button className={`btn-analyze ${loading||!file?'disabled':'ready'}`} onClick={handleScan} disabled={loading||!file}>
          {loading
            ? <><Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} /> Scanning Format…</>
            : <><Target size={18} /> Run ATS Check</>
          }
        </button>
      </div>

      {result && (() => {
        const score = result.atsScore || 78;
        const atsColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
        const defaultSuggestions = [
          'Ensure standard section headers like "Experience" and "Education".',
          'Remove complex formatting or tables that might confuse parsers.',
          'Add more quantifiable metrics to your recent roles.',
        ];
        const suggestions = result.atsSuggestions?.length > 0 ? result.atsSuggestions : defaultSuggestions;

        return (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="card card-lift" style={{ borderTop:`4px solid ${atsColor}`, overflow:'hidden' }}>
              <div className="ats-card-header">
                <div style={{ width:42, height:42, borderRadius:'11px', background:atsColor, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${atsColor}55` }}>
                  <Target size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="ats-card-title">ATS Compatibility Score</h3>
                  <p className="ats-card-sub">How well your resume is parsed by automated recruiter systems</p>
                </div>
              </div>

              <div style={{ display:'flex', gap:'40px', padding:'36px 32px', alignItems:'center', flexWrap:'wrap' }}>
                {/* Animated Score Ring */}
                <div className="ats-gauge-wrap">
                  <div
                    className="ats-gauge"
                    style={{
                      background:`conic-gradient(${atsColor} ${score}%, #e2e8f0 0)`,
                      '--ring-color':atsColor,
                      '--ring-end':`${score}%`,
                    }}
                  >
                    <div className="ats-gauge-inner">
                      <span className="ats-gauge-score" style={{ color:atsColor }}>{score}</span>
                      <span className="ats-gauge-label">/ 100</span>
                    </div>
                  </div>

                  {/* Score label */}
                  <div style={{ marginTop:'14px', textAlign:'center' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.85rem', color:atsColor }}>
                      {score>=80?'✓ ATS Friendly':score>=60?'⚠ Needs Work':'✗ Poor Fit'}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div style={{ width:'140px', marginTop:'10px' }}>
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar"
                        style={{ '--target-width':`${score}%`, background:`linear-gradient(90deg,${atsColor},${atsColor}cc)` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div style={{ flex:1, minWidth:'240px' }}>
                  <h4 className="ats-improve-heading">How to improve your score:</h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {suggestions.map((s,i) => (
                      <div key={i} className="ats-suggestion-item" style={{ animationDelay:`${i*0.08}s` }}>
                        <AlertCircle size={18} color={atsColor} style={{ flexShrink:0, marginTop:'1px' }} />
                        <span className="ats-suggestion-text">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── JOBS TAB ────────────────────────────────── */
function JobsTab() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/matches`, {
      headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` },
    }).then(res => setJobs(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleApply = async e => {
    e.preventDefault();
    if (!resumeFile || !selectedJob) return;
    setApplying(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobId', selectedJob._id || selectedJob.id);
    formData.append('recruiterId', selectedJob.recruiterId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/applications/apply`, formData, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      toast('Application submitted successfully! 🎉', 'success');
      setSelectedJob(null); setResumeFile(null);
    } catch { toast('Failed to submit application.', 'error'); }
    finally { setApplying(false); }
  };

  const handleStartChat = async job => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/send`, { receiverId:job.recruiterId, text:`Hi! I am very interested in your ${job.title} position and would love to connect.` }, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      toast('Message sent! Go to Messages tab to view the conversation.', 'info');
      setSelectedJob(null);
    } catch { toast('Failed to send message.', 'error'); }
  };

  if (loading) return (
    <div className="full-spinner">
      <Loader2 size={36} color="var(--blue-500)" style={{ animation:'spin 1s linear infinite' }} />
      <p>Loading job matches…</p>
    </div>
  );

  return (
    <div className="jobs-layout">
      <div className="jobs-list">
        <div style={{ marginBottom:'8px' }}>
          <h2 className="page-heading">Jobs Posted</h2>
          <p className="page-sub">{jobs.length} job{jobs.length!==1?'s':''} matching your profile.</p>
        </div>

        {jobs.map((job, idx) => {
          const score = job.matchScore;
          const scoreColor = !score ? '#94a3b8' : score>=75 ? '#22c55e' : score>=50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={job._id||job.id} className="job-card" style={{ cursor:'pointer', animationDelay:`${idx*0.06}s` }} onClick={() => setSelectedJob(job)}>
              <div style={{ paddingRight:'64px' }}>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
              </div>

              {score && (
                <div className="match-ring-wrap">
                  <div
                    className="match-ring"
                    style={{
                      background:`conic-gradient(${scoreColor} ${score}%, #f1f5f9 0)`,
                      '--ring-color':scoreColor,
                      '--ring-end':`${score}%`,
                      animationDelay:`${idx*0.1}s`,
                    }}
                  >
                    <div className="match-ring-inner" style={{ color:scoreColor }}>{score}%</div>
                  </div>
                </div>
              )}

              <div className="job-meta">
                <span><MapPin size={14} /> {job.location}</span>
                <span><Briefcase size={14} /> {job.salary || 'Competitive'}</span>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <span className={`job-badge ${job.type?.toLowerCase().replace(' ','')===('fulltime')?'fulltime':'remote'}`}>{job.type}</span>
                <span style={{ background:'#f1f5f9', color:'var(--slate-600)', padding:'4px 10px', borderRadius:'15px', fontSize:'0.7rem', fontWeight:700 }}>{job.domain}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="jobs-map">
        <MapContainer center={[22.5726,88.3639]} zoom={4} scrollWheelZoom style={{ width:'100%', height:'100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {jobs.map((job,idx) => {
            const lat = job.lat || (22.5726 + (Math.random()*2-1));
            const lng = job.lng || (88.3639 + (Math.random()*2-1));
            return (
              <Marker key={job._id||job.id||idx} position={[lat,lng]}>
                <Popup>
                  <strong style={{ display:'block', fontFamily:'var(--font-display)', fontSize:'14px' }}>{job.title}</strong>
                  <span style={{ color:'var(--slate-500)', fontSize:'13px' }}>{job.company}</span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {selectedJob && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div className="card" style={{ width:'100%', maxWidth:'600px', maxHeight:'90vh', overflowY:'auto', background:'#fff', padding:'32px', position:'relative', animation:'scaleIn 0.25s cubic-bezier(.34,1.56,.64,1)', margin:'20px' }}>
            <button onClick={() => { setSelectedJob(null); setResumeFile(null); }} style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(241,245,249,0.8)', border:'none', cursor:'pointer', color:'var(--slate-500)', borderRadius:'8px', padding:'7px', transition:'all 0.2s' }}>
              <X size={18} />
            </button>

            <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'20px' }}>
              <div style={{ width:48, height:48, borderRadius:'12px', background:'linear-gradient(135deg,#eff6ff,#dbeafe)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Briefcase size={22} color="var(--blue-600)" />
              </div>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--slate-900)', margin:'0 0 3px', letterSpacing:'-0.01em' }}>{selectedJob.title}</h2>
                <p style={{ fontSize:'1rem', color:'var(--blue-600)', fontWeight:600, margin:0 }}>{selectedJob.company} · {selectedJob.location}</p>
              </div>
            </div>

            <div style={{ background:'linear-gradient(135deg,#f8fafc,#f0f4ff)', padding:'18px', borderRadius:'10px', marginBottom:'20px', border:'1px solid rgba(226,232,240,0.7)' }}>
              <h4 style={{ margin:'0 0 10px', fontFamily:'var(--font-display)', color:'var(--slate-800)' }}>Job Description</h4>
              <p style={{ margin:0, fontSize:'0.93rem', color:'var(--slate-700)', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{selectedJob.description}</p>

              <button onClick={() => handleStartChat(selectedJob)} style={{ marginTop:'14px', padding:'9px 18px', background:'#eff6ff', color:'var(--blue-600)', border:'1px solid #bfdbfe', borderRadius:'8px', cursor:'pointer', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'8px', transition:'all 0.2s', fontSize:'0.875rem' }}>
                <MessageSquare size={15} /> Message Recruiter
              </button>
            </div>

            <h4 style={{ margin:'0 0 10px', fontFamily:'var(--font-display)', color:'var(--slate-800)' }}>Required Skills</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'24px' }}>
              {(Array.isArray(selectedJob.requiredSkills) ? selectedJob.requiredSkills : [selectedJob.requiredSkills].filter(Boolean)).map((skill,i) => (
                <span key={i} style={{ background:'linear-gradient(135deg,#eff6ff,#e0e7ff)', padding:'5px 12px', borderRadius:'6px', fontSize:'0.82rem', color:'var(--blue-700)', fontWeight:600, border:'1px solid #bfdbfe' }}>{skill}</span>
              ))}
            </div>

            <form onSubmit={handleApply} style={{ borderTop:'1px solid var(--slate-200)', paddingTop:'20px' }}>
              <h4 style={{ margin:'0 0 12px', fontFamily:'var(--font-display)', color:'var(--slate-800)' }}>Apply Now</h4>
              <input type="file" accept=".pdf" required onChange={e => setResumeFile(e.target.files[0])} style={{ display:'block', marginBottom:'16px', width:'100%', padding:'12px', border:'2px dashed var(--slate-300)', borderRadius:'10px', cursor:'pointer' }} />
              <button type="submit" disabled={applying||!resumeFile} className="btn-analyze ready" style={{ margin:0 }}>
                {applying ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> : <FileText size={18} />}
                &nbsp;{applying ? 'Sending Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── HISTORY TAB ────────────────────────────── */
function HistoryTab({ searchQuery }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/resume/history`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})
      .then(res => setHistory(res.data.data));
  }, []);

  const filtered = searchQuery ? history.filter(h => JSON.stringify(h).toLowerCase().includes(searchQuery.toLowerCase())) : history;

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <h2 className="page-heading">Analysis History</h2>
        <p className="page-sub">{filtered.length} past {filtered.length===1?'analysis':'analyses'} found.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        {filtered.map((item,idx) => (
          <div key={item._id} className="history-card" style={{ animationDelay:`${idx*0.06}s`, paddingLeft:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', paddingBottom:'14px', borderBottom:'1px solid rgba(241,245,249,0.8)' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                {item.suggestedDomains?.map((d,i) => <span key={i} className="history-tag">{d}</span>)}
              </div>
              <span className="history-date"><Calendar size={14} />{new Date(item.date).toLocaleDateString()}</span>
            </div>
            {Array.isArray(item.careerAdvice)
              ? <ul style={{ margin:0, paddingLeft:'18px', color:'var(--slate-600)', display:'flex', flexDirection:'column', gap:'7px', fontSize:'0.9rem', lineHeight:1.65 }}>
                  {item.careerAdvice.map((adv,i) => <li key={i}>{adv}</li>)}
                </ul>
              : <p style={{ color:'var(--slate-600)', margin:0, lineHeight:1.65, fontSize:'0.9rem', fontStyle:'italic' }}>"{item.careerAdvice}"</p>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SETTINGS TAB ───────────────────────────── */
function SettingsTab({ userName, userRole, userEmail, isPro }) {
  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <h2 className="page-heading">Settings</h2>
        <p className="page-sub">Manage your personal information and application preferences.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'22px' }}>
        {/* Profile */}
        <div className="card card-shine">
          <div className="settings-header" style={{ background:'linear-gradient(135deg,#f8fafc,#f0f4ff)' }}>
            <div style={{ width:36, height:36, borderRadius:'9px', background:'linear-gradient(135deg,#dbeafe,#e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Users size={18} color="var(--blue-600)" />
            </div>
            <h3 style={{ margin:0, fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1.05rem' }}>Profile Information</h3>
          </div>
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.82rem', fontWeight:'700', color:'var(--slate-600)', marginBottom:'8px', letterSpacing:'0.03em' }}>Display Name</label>
              <input type="text" defaultValue={userName} className="chat-input" style={{ width:'100%', maxWidth:'420px', borderRadius:'9px', padding:'11px 15px', display:'block' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.82rem', fontWeight:'700', color:'var(--slate-600)', marginBottom:'8px', letterSpacing:'0.03em' }}>Account Role</label>
              <div className="role-input-box" style={{ display:'inline-flex', alignItems:'center', padding:'11px 16px', borderRadius:'9px', cursor:'not-allowed', width:'100%', maxWidth:'420px', border:'1px solid var(--slate-200)' }}>
                <span style={{ fontWeight:700, color:'var(--blue-600)', textTransform:'capitalize', fontFamily:'var(--font-display)' }}>{userRole||'Seeker'}</span>
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.82rem', fontWeight:'700', color:'var(--slate-600)', marginBottom:'8px', letterSpacing:'0.03em' }}>Email Address</label>
              <input type="email" defaultValue={userEmail&&userEmail!=='undefined'?userEmail:'No email provided'} disabled className="chat-input" style={{ width:'100%', maxWidth:'420px', borderRadius:'9px', padding:'11px 15px', opacity:0.7, cursor:'not-allowed', display:'block' }} />
              <p style={{ margin:'6px 0 0', fontSize:'0.75rem', color:'var(--slate-400)' }}>Email cannot be changed here.</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card card-shine card-accent-amber">
          <div className="settings-header" style={{ background:'linear-gradient(135deg,#fffbeb,#fff7ed)' }}>
            <div style={{ width:36, height:36, borderRadius:'9px', background:'linear-gradient(135deg,#fef3c7,#fde68a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={18} color="#d97706" />
            </div>
            <h3 style={{ margin:0, fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1.05rem' }}>Subscription & AI Engine</h3>
          </div>
          <div style={{ padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                <h4 style={{ margin:0, color:'var(--slate-900)', fontSize:'1.05rem', fontFamily:'var(--font-display)' }}>Free Tier</h4>
                <span style={{ background:'rgba(59,130,246,0.1)', color:'var(--blue-600)', padding:'2px 8px', borderRadius:'12px', fontSize:'0.68rem', fontWeight:800, textTransform:'uppercase' }}>ResuMatch v2</span>
              </div>
              <p style={{ margin:0, color:'var(--slate-500)', fontSize:'0.88rem', maxWidth:'480px', lineHeight:1.55 }}>
                Upgrade to unlock deep resume rewrites, priority matching, and advanced analytics.
              </p>
            </div>
            {isPro
              ? <span style={{ padding:'11px 22px', background:'rgba(34,197,94,0.1)', color:'#16a34a', borderRadius:'9px', fontWeight:700, fontFamily:'var(--font-display)', border:'1px solid #bbf7d0', boxShadow:'0 2px 8px rgba(34,197,94,0.15)' }}>Pro Tier Active ✨</span>
              : <UpgradePro userEmail={userEmail} userName={userName} />
            }
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card card-accent-red card-shine">
          <div style={{ padding:'22px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h4 style={{ margin:'0 0 5px', color:'var(--slate-900)', fontSize:'1rem', fontFamily:'var(--font-display)' }}>Delete Account</h4>
              <p style={{ margin:0, color:'var(--slate-500)', fontSize:'0.85rem' }}>Permanently remove your account and all associated data.</p>
            </div>
            <button style={{ padding:'10px 20px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'9px', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', transition:'all 0.2s', fontFamily:'var(--font-display)' }}
              onMouseOver={e => { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.transform='scale(1.02)'; }}
              onMouseOut={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.transform='none'; }}>
              Delete Account
            </button>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button className="btn-analyze ready" style={{ width:'auto', margin:0, padding:'14px 36px' }} onClick={() => alert('Settings saved!')}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RECRUITER TAB ──────────────────────────── */
function RecruiterTab() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [viewingApplicants, setViewingApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const initialForm = { title:'', company:'', location:'', type:'Full-Time', salary:'', domain:'', requiredSkills:'', description:'' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/recruiter`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      setJobs(res.data.data);
    } catch {} finally { setFetchingJobs(false); }
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]:e.target.value }));

  const handleAddNew = () => { setEditingId(null); setFormData(initialForm); setShowForm(true); };

  const handleEdit = job => {
    setEditingId(job._id);
    setFormData({ title:job.title, company:job.company, location:job.location, type:job.type, salary:job.salary||'', domain:job.domain, requiredSkills:Array.isArray(job.requiredSkills)?job.requiredSkills.join(', '):job.requiredSkills, description:job.description });
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      toast('Job posting deleted.', 'info');
      fetchMyJobs();
    } catch { toast('Failed to delete.', 'error'); }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${editingId}`, formData, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
        toast('Job posting updated!', 'success');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/post`, formData, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
        toast('Job posted successfully! 🎉', 'success');
      }
      setShowForm(false); setEditingId(null); fetchMyJobs();
    } catch { toast('Failed to save job.', 'error'); }
    finally { setLoading(false); }
  };

  const handleViewApplicants = async jobId => {
    setViewingApplicants(jobId);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/recruiter/${jobId}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      setApplicantsList(res.data.data);
    } catch { toast('Failed to load applicants.', 'error'); }
  };

  if (fetchingJobs) return (
    <div className="full-spinner">
      <Loader2 size={36} color="var(--blue-500)" style={{ animation:'spin 1s linear infinite' }} />
      <p>Loading your jobs…</p>
    </div>
  );

  const inputStyle = { width:'100%', padding:'11px 14px', borderRadius:'9px', border:'1px solid var(--slate-300)', fontSize:'0.9rem', outline:'none', fontFamily:'var(--font-body)', transition:'all 0.2s', boxSizing:'border-box' };
  const labelStyle = { fontSize:'0.82rem', fontWeight:'700', color:'var(--slate-600)', marginBottom:'8px', display:'block', letterSpacing:'0.03em' };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px' }}>
        <div>
          <h2 className="page-heading">Recruiter Dashboard</h2>
          <p className="page-sub">Manage job postings and review applicants.</p>
        </div>
        {!showForm && (
          <button onClick={handleAddNew} className="btn-analyze ready" style={{ width:'auto', marginTop:0, padding:'11px 22px', animation:'none' }}>
            + Post New Job
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card card-p card-shine card-accent-blue">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'22px' }}>
            <h3 style={{ margin:0, fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1.2rem' }}>{editingId?'Edit Job Posting':'Create New Job Posting'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'var(--slate-500)', cursor:'pointer', fontSize:'0.875rem', textDecoration:'underline' }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <div style={{ flex:'1 1 200px' }}><label style={labelStyle}>Job Title</label><input required name="title" value={formData.title} onChange={handleChange} style={inputStyle} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
              <div style={{ flex:'1 1 200px' }}><label style={labelStyle}>Company</label><input required name="company" value={formData.company} onChange={handleChange} style={inputStyle} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
            </div>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <div style={{ flex:'1 1 200px' }}><label style={labelStyle}>Location</label><input required name="location" value={formData.location} onChange={handleChange} style={inputStyle} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
              <div style={{ flex:'1 1 200px' }}><label style={labelStyle}>Target Domain</label><input required name="domain" value={formData.domain} onChange={handleChange} style={inputStyle} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
            </div>
            <div><label style={labelStyle}>Required Skills</label><input required name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="React, Node.js, Python..." style={inputStyle} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
            <div><label style={labelStyle}>Job Description</label><textarea required name="description" value={formData.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none'}} /></div>
            <button type="submit" disabled={loading} className="btn-analyze ready" style={{ marginTop:'8px' }}>
              {loading ? <><Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Publish Job Post'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {jobs.map((job, idx) => (
            <div key={job._id} className="recruiter-job-card" style={{ animationDelay:`${idx*0.06}s` }}>
              <div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company" style={{ margin:'4px 0 8px' }}>{job.company} · {job.location}</p>
                <span style={{ background:'#f1f5f9', color:'var(--slate-600)', padding:'4px 10px', borderRadius:'15px', fontSize:'0.73rem', fontWeight:600 }}>{job.domain}</span>
              </div>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <button onClick={() => handleViewApplicants(job._id)} style={{ padding:'9px 16px', background:'linear-gradient(135deg,var(--indigo-500),var(--blue-600))', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.83rem', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(99,102,241,0.3)' }}>
                  <Users size={14}/> Applicants
                </button>
                <button onClick={() => handleEdit(job)} style={{ padding:'9px 16px', background:'#f1f5f9', color:'var(--slate-700)', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.83rem', transition:'all 0.2s' }}
                  onMouseOver={e=>{e.currentTarget.style.background='#e2e8f0';}} onMouseOut={e=>{e.currentTarget.style.background='#f1f5f9';}}>Edit</button>
                <button onClick={() => handleDelete(job._id)} style={{ padding:'9px 16px', background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.83rem', transition:'all 0.2s' }}
                  onMouseOver={e=>{e.currentTarget.style.background='#fee2e2';}} onMouseOut={e=>{e.currentTarget.style.background='#fef2f2';}}>Delete</button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--slate-400)' }}>
              <Briefcase size={40} style={{ marginBottom:'16px', opacity:0.4 }} />
              <p style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', margin:0 }}>No jobs posted yet. Create your first listing!</p>
            </div>
          )}
        </div>
      )}

      {/* Applicants Modal */}
      {viewingApplicants && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div className="card" style={{ width:'100%', maxWidth:'580px', maxHeight:'80vh', overflowY:'auto', background:'#fff', padding:'32px', position:'relative', animation:'scaleIn 0.25s cubic-bezier(.34,1.56,.64,1)', margin:'20px' }}>
            <button onClick={() => setViewingApplicants(null)} style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(241,245,249,0.8)', border:'none', cursor:'pointer', color:'var(--slate-500)', borderRadius:'8px', padding:'7px' }}><X size={18}/></button>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', color:'var(--slate-900)', margin:'0 0 20px' }}>Applicants for this Role</h2>
            {applicantsList.length === 0
              ? <p style={{ color:'var(--slate-400)', textAlign:'center', padding:'20px 0' }}>No applications received yet.</p>
              : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {applicantsList.map(app => (
                    <div key={app._id} style={{ padding:'16px', border:'1px solid var(--slate-200)', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', transition:'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='#f8fafc';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';}}>
                      <div>
                        <strong style={{ display:'block', fontSize:'1rem', color:'var(--slate-800)' }}>{app.seekerId?.name||'Unknown User'}</strong>
                        <span style={{ fontSize:'0.83rem', color:'var(--slate-500)' }}>{app.seekerId?.email}</span>
                        <span style={{ display:'block', fontSize:'0.75rem', color:'var(--slate-400)', marginTop:'3px' }}>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      <a href={`${import.meta.env.VITE_API_URL}/${app.resumePath}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'linear-gradient(135deg,#eff6ff,#e0e7ff)', color:'var(--blue-600)', textDecoration:'none', borderRadius:'8px', fontSize:'0.83rem', fontWeight:600, border:'1px solid #bfdbfe', transition:'all 0.2s' }}>
                        <Download size={14}/> View Resume
                      </a>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MESSAGES TAB ────────────────────────────── */
function MessagesTab() {
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/chat/inbox`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})
      .then(res => setConversations(res.data.data));
  }, []);

  useEffect(() => {
    let interval;
    if (activeChat) {
      const fetchChat = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${activeChat._id}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})
          .then(res => setMessages(res.data.data));
      };
      fetchChat(); interval = setInterval(fetchChat, 3000);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/send`, { receiverId:activeChat._id, text:newMessage }, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      setNewMessage('');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${activeChat._id}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }});
      setMessages(res.data.data);
    } catch { toast('Failed to send message.', 'error'); }
  };

  return (
    <div className="messages-layout">
      {/* Inbox */}
      <div className="card messages-inbox" style={{ overflow:'hidden' }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--slate-100)', background:'linear-gradient(135deg,#f8fafc,#f0f4ff)' }}>
          <h3 style={{ margin:0, fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1.05rem' }}>Inbox</h3>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {conversations.length === 0
            ? <p style={{ padding:'24px 20px', color:'var(--slate-400)', fontSize:'0.88rem', textAlign:'center' }}>No conversations yet.</p>
            : conversations.map(c => (
              <div key={c._id} className={`convo-item ${activeChat?._id===c._id?'active':''}`} onClick={() => setActiveChat(c)}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue-500),var(--indigo-500))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.9rem', flexShrink:0 }}>{c.name.charAt(0).toUpperCase()}</div>
                    <strong style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:'var(--slate-800)' }}>{c.name}</strong>
                  </div>
                  <span style={{ fontSize:'0.7rem', color:'var(--slate-400)' }}>{new Date(c.date).toLocaleDateString()}</span>
                </div>
                <p style={{ margin:'2px 0 0 44px', fontSize:'0.82rem', color:'var(--slate-500)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMessage}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Chat window */}
      <div className="card messages-chat">
        {activeChat ? (
          <>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--slate-100)', background:'linear-gradient(135deg,#f8fafc,#fff)', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue-500),var(--indigo-500))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', boxShadow:'0 2px 10px rgba(59,130,246,0.3)' }}>
                {activeChat.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin:0, fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1rem' }}>{activeChat.name}</h3>
                <p style={{ margin:0, fontSize:'0.78rem', color:'var(--slate-500)', textTransform:'capitalize', display:'flex', alignItems:'center', gap:'5px' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }} /> {activeChat.role}
                </p>
              </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {messages.map((m,i) => {
                const mine = m.sender !== activeChat._id;
                return (
                  <div key={i} style={{ display:'flex', justifyContent:mine?'flex-end':'flex-start' }}>
                    <div className={`chat-bubble ${mine?'user':'bot'}`}>{m.text}</div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding:'14px 18px', borderTop:'1px solid var(--slate-100)', background:'#fff', display:'flex', gap:'12px' }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message…" style={{ flex:1, padding:'12px 16px', borderRadius:'24px', border:'1px solid var(--slate-300)', outline:'none', fontFamily:'var(--font-body)', fontSize:'0.875rem', transition:'all 0.2s' }} onFocus={e=>{e.target.style.borderColor='var(--blue-400)';e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)';}} onBlur={e=>{e.target.style.borderColor='var(--slate-300)';e.target.style.boxShadow='none';}} />
              <button type="submit" disabled={!newMessage.trim()} className="chat-send-btn">
                <Send size={17} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--slate-400)', gap:'12px' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MessageSquare size={32} style={{ opacity:0.5 }} />
            </div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', margin:0 }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── INTERVIEW TAB ──────────────────────────── */
function InterviewTab() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true); setQuestions(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/interview`, formData, {
        headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions(res.data.data);
      toast(`Generated ${res.data.data?.length || ''} interview questions!`, 'success');
    } catch {
      toast('Failed to generate interview questions.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <div style={{ marginBottom:'28px' }}>
        <h2 className="page-heading">AI Interview Prep</h2>
        <p className="page-sub">Generate personalized, challenging interview questions based on your resume's claims.</p>
      </div>

      <div className="card card-p card-shine card-accent-indigo" style={{ marginBottom:'24px' }}>
        <label htmlFor="interview-upload">
          <div
            className={`upload-zone ${dragging?'dragging':''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap">
              {file ? <CheckCircle size={30} color="#22c55e" /> : <HelpCircle size={30} color="#4f46e5" />}
            </div>
            <p className="upload-filename">{file ? `✓ ${file.name}` : 'Drop your resume here to generate questions'}</p>
            <p className="upload-hint">{file ? 'Ready to analyze — click Generate below' : 'Accepts PDF files'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} id="interview-upload" />

        <button className={`btn-analyze ${loading||!file?'disabled':'ready'}`} onClick={handleGenerate} disabled={loading||!file}>
          {loading
            ? <><Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} /> Analyzing Experience…</>
            : <><HelpCircle size={18} /> Generate My Questions</>
          }
        </button>
      </div>

      {questions && (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', animation:'fadeUp 0.4s ease both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--slate-800)', fontSize:'1.2rem', margin:0 }}>Your Personalized Questions</h3>
            <span style={{ background:'linear-gradient(135deg,#e0e7ff,#dbeafe)', color:'var(--blue-700)', padding:'3px 10px', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700, fontFamily:'var(--font-display)' }}>
              {questions.length} questions
            </span>
          </div>

          {questions.map((q,idx) => (
            <div key={idx} className="interview-q-card" style={{ animationDelay:`${idx*0.07}s` }}>
              <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <div className="interview-q-num">Q{idx+1}</div>
                <div style={{ flex:1 }}>
                  <h4 style={{ margin:'0 0 10px', fontSize:'1.02rem', color:'var(--slate-900)', lineHeight:1.55 }}>{q.question}</h4>
                  <div className="interview-rationale">
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--slate-500)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'5px' }}>Why the interviewer is asking this:</span>
                    <p style={{ margin:0, fontSize:'0.88rem', color:'var(--slate-700)', lineHeight:1.6 }}>{q.rationale}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
