// client/src/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Loader2, Briefcase, Compass, LogOut, Sparkles,
  LayoutDashboard, History, Settings, Bell, Search,
  Calendar, MapPin, ExternalLink, ChevronRight, Zap, TrendingUp,
  MessageCircle, X, Send, MessageSquare, FileText, Download, Users,
  Sun, Moon, Target, AlertCircle, HelpCircle // 🌟 Added Target and AlertCircle
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import UpgradePro from './UpgradePro';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DASH_STYLES = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-dot{ 0%,100%{opacity:1} 50%{opacity:.35} }

  .dash-layout { display:flex; height:100vh; width:100vw; background:#f1f5f9; font-family:var(--font-body); transition: background 0.3s; }

  /* ── SIDEBAR ── */
  .dash-sidebar {
    width:252px; background:var(--navy-950); color:#f8fafc;
    display:flex; flex-direction:column; flex-shrink:0;
    position:relative; overflow:hidden; z-index:20; transition: width 0.3s ease;
  }
  .dash-sidebar::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse 80% 40% at 20% 10%, rgba(59,130,246,0.12) 0%, transparent 60%),
                radial-gradient(ellipse 60% 30% at 80% 80%, rgba(245,158,11,0.07) 0%, transparent 55%);
    pointer-events:none;
  }
  .dash-sidebar-logo {
    padding:22px 20px; border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex; align-items:center; gap:12px; position:relative;
  }
  .dash-logo-icon {
    width:38px; height:38px; background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    border-radius:10px; display:flex; align-items:center; justify-content:center;
    font-size:17px; flex-shrink:0; box-shadow:var(--shadow-glow-blue);
  }
  .dash-logo-text {
    font-family:var(--font-display); font-size:1.15rem; font-weight:800;
    background:linear-gradient(135deg,#fff 40%,var(--amber-400));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .dash-logo-badge {
    font-size:0.6rem; font-family:var(--font-display); font-weight:700; letter-spacing:0.08em;
    background:var(--amber-500); color:var(--navy-950); padding:2px 6px; border-radius:4px;
    text-transform:uppercase; margin-left:auto; flex-shrink:0;
  }

  .dash-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:4px; position:relative; }
  .dash-nav-label {
    font-family:var(--font-display); font-size:0.65rem; font-weight:700; letter-spacing:0.12em;
    text-transform:uppercase; color:rgba(148,163,184,0.5); padding:8px 8px 4px; margin-top:8px;
  }
  .dash-nav-btn {
    display:flex; align-items:center; gap:11px; padding:11px 12px;
    background:transparent; color:#94a3b8; border:none; border-radius:var(--radius-md);
    cursor:pointer; font-family:var(--font-body); font-size:0.9rem; font-weight:500;
    transition:all 0.18s; text-align:left; position:relative; width:100%;
  }
  .dash-nav-btn:hover { background:rgba(255,255,255,0.05); color:#e2e8f0; }
  .dash-nav-btn.active {
    background:rgba(59,130,246,0.18); color:#fff; font-weight:600;
    border:1px solid rgba(59,130,246,0.3);
  }
  .dash-nav-btn.active::before {
    content:''; position:absolute; left:0; top:25%; bottom:25%;
    width:3px; background:var(--blue-400); border-radius:0 3px 3px 0;
  }
  .dash-nav-btn .nav-icon { opacity:0.75; flex-shrink: 0; }
  .dash-nav-btn.active .nav-icon { opacity:1; }

  .dash-sidebar-footer { padding:14px 12px; border-top:1px solid rgba(255,255,255,0.06); }

  /* ── MAIN ── */
  .dash-main { flex:1; display:flex; flex-direction:column; min-width:0; }

  /* ── HEADER ── */
  .dash-header {
    height:64px; background:#ffffff; border-bottom:1px solid var(--slate-200);
    display:flex; align-items:center; justify-content:space-between; padding:0 32px;
    flex-shrink:0; z-index:10; box-shadow:var(--shadow-sm); transition: background 0.3s;
  }
  .dash-search {
    display:flex; align-items:center; gap:9px; background:#f8fafc;
    padding:9px 16px; border-radius:30px; border:1px solid var(--slate-200);
    transition:border-color 0.2s, box-shadow 0.2s, background 0.3s;
  }
  .dash-search:focus-within {
    border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.10);
  }
  .dash-search input {
    border:none; outline:none; background:transparent;
    font-family:var(--font-body); font-size:0.875rem; color:var(--slate-700); width:220px;
  }
  .dash-search input::placeholder { color:var(--slate-400); }

  .dash-header-right { display:flex; align-items:center; gap:20px; }
  .dash-notif-btn {
    width:38px; height:38px; border-radius:10px; border:1px solid var(--slate-200);
    background:#f8fafc; display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:var(--slate-500); transition:all 0.18s;
  }
  .dash-notif-btn:hover { background:var(--slate-200); color:var(--slate-700); }

  .dash-avatar-wrap { display:flex; align-items:center; gap:10px; cursor:pointer; position:relative; padding-left:18px; border-left:1px solid var(--slate-200); }
  .dash-avatar {
    width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--blue-500),var(--indigo-500));
    display:flex; align-items:center; justify-content:center; color:white;
    font-family:var(--font-display); font-weight:700; font-size:0.95rem;
    box-shadow:0 0 0 2px rgba(59,130,246,0.2);
  }
  .dash-avatar-name { font-family:var(--font-display); font-weight:600; font-size:0.875rem; color:var(--slate-700); transition: color 0.3s; }
  .dash-dropdown {
    position:absolute; top:calc(100% + 12px); right:0; width:175px;
    background:#fff; border:1px solid var(--slate-200); border-radius:var(--radius-md);
    box-shadow:var(--shadow-lg); padding:6px; z-index:50; animation:fadeUp 0.15s ease;
  }
  .dash-dropdown-item {
    width:100%; padding:9px 12px; background:none; border:none; text-align:left;
    font-family:var(--font-body); font-size:0.875rem; cursor:pointer; border-radius:var(--radius-sm);
    transition:background 0.15s; display:flex; align-items:center; gap:8px;
    color:var(--red-500);
  }
  .dash-dropdown-item:hover { background:#fef2f2; }

  /* ── CONTENT ── */
  .dash-content {
    flex:1; overflow-y:auto; padding:36px 40px;
    animation:fadeUp 0.35s cubic-bezier(.22,.68,0,1.1) both;
  }

  /* ── CARDS & COMPONENTS ── */
  .card {
    background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200);
    box-shadow:var(--shadow-sm); overflow:hidden; transition: background 0.3s, border-color 0.3s;
  }
  .card-p { padding:28px; }

  .page-heading {
    font-family:var(--font-display); font-size:1.7rem; font-weight:800;
    color:var(--slate-900); margin:0 0 6px; letter-spacing:-0.01em; transition: color 0.3s;
  }
  .page-sub { color:var(--slate-500); margin:0; font-size:0.95rem; font-weight:300; transition: color 0.3s; }

  /* Upload zone */
  .upload-zone {
    border:2px dashed var(--slate-300); padding:44px 30px; border-radius:var(--radius-lg);
    text-align:center; cursor:pointer; background:#fafbfc;
    transition:border-color 0.2s, background 0.2s;
  }
  .upload-zone:hover { border-color:var(--blue-400); background:rgba(59,130,246,0.03); }
  .upload-icon-wrap {
    width:72px; height:72px; background:linear-gradient(135deg,#e0e7ff,#dbeafe);
    border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
  }
  .upload-filename {
    font-family:var(--font-display); font-weight:700; font-size:1.05rem; color:var(--slate-800);
  }
  .upload-hint { font-size:0.85rem; color:var(--slate-400); margin-top:4px; }

  .btn-analyze {
    width:100%; margin-top:22px; padding:15px; border:none; border-radius:var(--radius-md);
    font-family:var(--font-display); font-size:1rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:all 0.2s; letter-spacing:0.02em;
  }
  .btn-analyze.ready {
    background:linear-gradient(135deg,var(--indigo-500),var(--blue-600));
    color:#fff; box-shadow:var(--shadow-glow-blue);
  }
  .btn-analyze.ready:hover { transform:translateY(-1px); box-shadow:0 0 32px rgba(59,130,246,0.35); }
  .btn-analyze.disabled { background:var(--slate-200); color:var(--slate-400); cursor:not-allowed; }

  /* Jobs */
  .job-card {
    background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200);
    padding:22px 24px; box-shadow:var(--shadow-sm); transition:all 0.2s;
  }
  .job-card:hover { border-color:var(--blue-300,#93c5fd); box-shadow:var(--shadow-md); transform:translateY(-1px); }
  .job-title { font-family:var(--font-display); font-size:1.1rem; font-weight:700; color:var(--slate-900); margin:0 0 3px; }
  .job-company { color:var(--blue-600); font-weight:600; font-size:0.9rem; margin:0 0 14px; }
  .job-badge { padding:4px 10px; border-radius:20px; font-family:var(--font-display); font-size:0.72rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; }
  .job-badge.fulltime { background:#dcfce7; color:#166534; }
  .job-badge.remote   { background:#dbeafe; color:#1e40af; }
  .job-meta { display:flex; gap:16px; color:var(--slate-500); font-size:0.855rem; margin-bottom:18px; }
  .job-meta span { display:flex; align-items:center; gap:5px; }

  /* History */
  .history-card {
    background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200);
    padding:24px; box-shadow:var(--shadow-sm); animation:fadeUp 0.3s ease both;
  }
  .history-tag {
    background:#f1f5f9; color:var(--slate-600); padding:4px 12px; border-radius:15px;
    font-size:0.82rem; font-family:var(--font-display); font-weight:600;
  }
  .history-date { display:flex; align-items:center; gap:6px; color:var(--slate-400); font-size:0.85rem; }

  /* ── RESUME ANALYSIS CARD (improved) ── */
  .ra-section-label { display:flex; align-items:center; gap:7px; margin-bottom:12px; }
  .ra-section-label span { font-family:var(--font-display); font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--slate-500); }

  .ra-domain-pill {
    display:inline-flex; align-items:center; gap:7px; padding:7px 16px;
    background:#eff6ff; color:var(--blue-700,#1d4ed8); border:1px solid #bfdbfe;
    border-radius:999px; font-size:0.85rem; font-weight:600;
    font-family:var(--font-display); transition:all 0.18s;
  }
  .ra-domain-pill:hover { background:#dbeafe; border-color:#93c5fd; transform:translateY(-1px); }

  .ra-insight-row {
    display:flex; gap:12px; align-items:flex-start;
    padding:12px 16px; border-radius:var(--radius-md);
    background:#f8fafc; border-left:3px solid transparent;
  }
  .ra-insight-row.success { border-left-color:#22c55e; background:#f0fdf4; }
  .ra-insight-row.warn    { border-left-color:#f59e0b; background:#fffbeb; }
  .ra-insight-row.neutral { border-left-color:var(--blue-400,#60a5fa); background:#eff6ff; }

  .ra-insight-num {
    width:22px; height:22px; border-radius:50%; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-display); font-size:0.72rem; font-weight:800;
  }
  .ra-insight-row.success .ra-insight-num { background:#dcfce7; color:#15803d; }
  .ra-insight-row.warn    .ra-insight-num { background:#fef9c3; color:#b45309; }
  .ra-insight-row.neutral .ra-insight-num { background:#dbeafe; color:var(--blue-700,#1d4ed8); }

  .ra-insight-text { font-size:0.9rem; line-height:1.6; color:var(--slate-700); margin:0; }

  /* dark-mode overrides for new classes */
  .dark-mode .ra-domain-pill { background:#1e3a5f !important; color:#93c5fd !important; border-color:#1e40af !important; }
  .dark-mode .ra-insight-row.success { background:#052e16 !important; }
  .dark-mode .ra-insight-row.warn    { background:#1c1400 !important; }
  .dark-mode .ra-insight-row.neutral { background:#0c1a2e !important; }
  .dark-mode .ra-insight-row.success .ra-insight-num { background:#14532d !important; color:#86efac !important; }
  .dark-mode .ra-insight-row.warn    .ra-insight-num { background:#451a03 !important; color:#fcd34d !important; }
  .dark-mode .ra-insight-row.neutral .ra-insight-num { background:#1e3a5f !important; color:#93c5fd !important; }
  .dark-mode .ra-insight-text { color:#cbd5e1 !important; }

  /* Sidebar logout button */
  .btn-sidebar-exit {
    width:100%; padding:10px 12px; background:rgba(255,255,255,0.04); color:#94a3b8;
    border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-md);
    font-family:var(--font-body); font-size:0.875rem; cursor:pointer;
    display:flex; align-items:center; gap:10px; transition:all 0.18s;
  }
  .btn-sidebar-exit:hover { background:rgba(239,68,68,0.12); color:#fca5a5; border-color:rgba(239,68,68,0.2); }

  /* Layout Classes for specific tabs */
  .messages-layout { animation: fadeUp 0.35s ease both; display: flex; gap: 20px; height: calc(100vh - 150px); }
  .messages-inbox { width: 320px; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
  .messages-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #f8fafc; }
  
  .jobs-layout { animation: fadeUp 0.35s ease both; display: flex; gap: 28px; height: calc(100vh - 160px); }
  .jobs-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding-right: 4px; }
  .jobs-map { flex: 1.1; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--slate-200); flex-shrink: 0; min-height: 300px; z-index: 1;}

  /* ── CHATBOT ── */
  @keyframes chatPop {
    0%   { opacity:0; transform:scale(0.88) translateY(18px); }
    70%  { transform:scale(1.03) translateY(-3px); }
    100% { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes typingBounce {
    0%,80%,100% { transform:translateY(0); }
    40%         { transform:translateY(-6px); }
  }
  @keyframes msgSlide {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .chat-fab {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    width:56px; height:56px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(59,130,246,0.45), 0 2px 8px rgba(0,0,0,0.15);
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .chat-fab:hover { transform:scale(1.1) translateY(-2px); box-shadow:0 8px 28px rgba(59,130,246,0.55); }
  .chat-fab:active { transform:scale(0.96); }
  .chat-fab-badge {
    position:absolute; top:-4px; right:-4px; width:18px; height:18px;
    background:var(--amber-500); border-radius:50%; border:2px solid #f1f5f9;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-display); font-size:0.6rem; font-weight:800; color:#fff;
  }
  .chat-window {
    position:fixed; bottom:96px; right:28px; z-index:9998;
    width:370px; height:520px; background:#fff;
    border-radius:var(--radius-xl); overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
    border:1px solid var(--slate-200); display:flex; flex-direction:column;
    animation:chatPop 0.3s cubic-bezier(.22,.68,0,1.2) both;
  }
  .chat-header {
    padding:16px 18px; background:linear-gradient(135deg,var(--navy-900),var(--navy-800));
    display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
    border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .chat-header-left { display:flex; align-items:center; gap:10px; }
  .chat-header-avatar {
    width:36px; height:36px; border-radius:10px; font-size:16px;
    background:linear-gradient(135deg,var(--blue-500),var(--indigo-500));
    display:flex; align-items:center; justify-content:center;
    box-shadow:var(--shadow-glow-blue);
  }
  .chat-header-name { font-family:var(--font-display); font-weight:700; font-size:0.9rem; color:#fff; margin:0; }
  .chat-header-status { font-size:0.72rem; color:var(--slate-400); margin:0; display:flex; align-items:center; gap:4px; }
  .chat-status-dot { width:7px; height:7px; border-radius:50%; background:var(--green-400); animation:pulse-dot 2s ease-in-out infinite; }
  .chat-close-btn {
    width:30px; height:30px; border-radius:8px; border:none; cursor:pointer;
    background:rgba(255,255,255,0.08); color:var(--slate-400);
    display:flex; align-items:center; justify-content:center; transition:all 0.15s;
  }
  .chat-close-btn:hover { background:rgba(255,255,255,0.15); color:#fff; }
  .chat-messages {
    flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px;
    background:#f8fafc;
  }
  .chat-msg { display:flex; gap:8px; animation:msgSlide 0.22s ease both; }
  .chat-msg.user { flex-direction:row-reverse; }
  
  /* 🌟 CHAT BUBBLE CSS 🌟 */
  .chat-bubble {
    max-width: 75%; 
    padding: 10px 14px; 
    border-radius: 16px;
    font-family: var(--font-body); 
    font-size: 0.875rem; 
    line-height: 1.55;
    word-break: break-word; 
    white-space: pre-wrap;  
  }
  .chat-bubble.bot { background:#fff; color:var(--slate-700); border:1px solid var(--slate-200); border-bottom-left-radius:4px; box-shadow:var(--shadow-sm); }
  .chat-bubble.user { background:linear-gradient(135deg,var(--blue-600),var(--indigo-500)); color:#fff; border-bottom-right-radius:4px; }
  .chat-bot-avatar {
    width:28px; height:28px; border-radius:8px; flex-shrink:0; margin-top:2px;
    background:linear-gradient(135deg,var(--blue-500),var(--indigo-500));
    display:flex; align-items:center; justify-content:center; font-size:12px;
  }
  .chat-typing {
    display:flex; align-items:center; gap:5px; padding:10px 14px;
    background:#fff; border:1px solid var(--slate-200); border-radius:16px;
    border-bottom-left-radius:4px; width:fit-content; box-shadow:var(--shadow-sm);
  }
  .chat-typing span { width:7px; height:7px; border-radius:50%; background:var(--slate-400); animation:typingBounce 1.2s ease-in-out infinite; }
  .chat-typing span:nth-child(2) { animation-delay:0.15s; }
  .chat-typing span:nth-child(3) { animation-delay:0.30s; }
  .chat-input-row {
    padding:12px 14px; border-top:1px solid var(--slate-200); background:#fff;
    display:flex; align-items:center; gap:10px; flex-shrink:0;
  }
  .chat-input {
    flex:1; padding:10px 14px; border-radius:24px;
    border:1px solid var(--slate-200); background:#f8fafc;
    font-family:var(--font-body); font-size:0.875rem; color:var(--slate-700);
    outline:none; transition:border-color 0.2s, box-shadow 0.2s; resize:none; line-height:1.4;
  }
  .chat-input:focus { border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.10); background:#fff; }
  .chat-input::placeholder { color:var(--slate-400); }
  .chat-send-btn {
    width:38px; height:38px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0;
    background:linear-gradient(135deg,var(--blue-600),var(--indigo-500));
    color:#fff; display:flex; align-items:center; justify-content:center;
    transition:all 0.18s; box-shadow:var(--shadow-glow-blue);
  }
  .chat-send-btn:hover { transform:scale(1.08); }
  .chat-send-btn:disabled { background:var(--slate-200); color:var(--slate-400); cursor:not-allowed; box-shadow:none; transform:none; }

  /* 🌟 MEDIA QUERIES FOR RESPONSIVENESS 🌟 */
  @media (max-width: 1200px) {
    .dash-sidebar { width: 200px; }
    .dash-content { padding: 24px 24px; }
    .messages-inbox { width: 260px; }
  }

  @media (max-width: 900px) {
    .dash-sidebar { width: 72px; align-items: center; }
    .dash-sidebar-logo { padding: 20px 0; justify-content: center; }
    .dash-logo-text, .dash-logo-badge { display: none; }
    .dash-nav { padding: 16px 8px; align-items: center; }
    .dash-nav-label { display: none; }
    .dash-nav-btn { justify-content: center; padding: 12px; }
    .nav-text { display: none; }
    .dash-sidebar-footer { padding: 14px 8px; }
    .btn-sidebar-exit { justify-content: center; padding: 10px; }
    .btn-sidebar-exit span { display: none; } 
    .dash-header { padding: 0 24px; }
    .messages-inbox { width: 220px; }
  }

  @media (max-width: 768px) {
    .dash-header-right { gap: 12px; }
    .dash-avatar-name { display: none; }
    .dash-search input { width: 130px; }
    .messages-layout { flex-direction: column; height: auto; }
    .messages-inbox { width: 100%; height: 350px; flex-shrink: 0; }
    .messages-chat { height: 500px; }
    .jobs-layout { flex-direction: column; height: auto; }
    .jobs-list { overflow-y: visible; }
    .jobs-map { height: 400px; flex: none; }
    .job-meta { flex-direction: column; gap: 8px; }
  }

  /* 🌟 SAFETY NET FOR VERTICAL CHAT SQUISH 🌟 */
  .messages-chat { min-width: 250px; }
  .dash-gauge-inner { background: #fff; }

  /* 🌟 CLASSES FOR SETTINGS 🌟 */
  .settings-header { background: #fafbfc; }
  .role-input-box { background: var(--slate-100); border: 1px solid var(--slate-200); }

  /* 🌟 MAGIC DARK MODE STYLES 🌟 */
  body.dark-mode { background: #0f172a; }
  .dark-mode.dash-layout, .dark-mode .dash-layout { background: #0f172a !important; color: #f8fafc !important; }
  
  .dark-mode .dash-sidebar { background: #020617 !important; border-right: 1px solid #1e293b !important; }
  .dark-mode .dash-header, 
  .dark-mode .card, 
  .dark-mode .chat-window, 
  .dark-mode .chat-header,
  .dark-mode .chat-input-row, 
  .dark-mode .dash-dropdown { 
    background: #1e293b !important; border-color: #334155 !important; 
  }
  
  .dark-mode .dash-search, .dark-mode .dash-notif-btn, 
  .dark-mode .upload-zone, .dark-mode .chat-input,
  .dark-mode .settings-row, .dark-mode .history-card,
  .dark-mode input[type="text"], .dark-mode textarea { 
    background: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important; 
  }
  
  .dark-mode .page-heading, .dark-mode h2, .dark-mode h3, .dark-mode h4, 
  .dark-mode .job-title, .dark-mode .upload-filename,
  .dark-mode .dash-avatar-name, .dark-mode .settings-key, .dark-mode strong { color: #f8fafc !important; }
  
  .dark-mode p, .dark-mode .page-sub, .dark-mode .job-meta,
  .dark-mode .upload-hint, .dark-mode .settings-val, .dark-mode label,
  .dark-mode span:not(.job-badge):not(.insight-tag):not(.history-tag):not(.chat-fab-badge):not(.dash-logo-badge):not(.nav-icon) { 
    color: #94a3b8 !important; 
  }

  .dark-mode .job-badge { filter: brightness(0.9); }
  .dark-mode .upload-zone:hover { background: rgba(59,130,246,0.1) !important; border-color: var(--blue-500) !important; }
  .dark-mode .job-card { background: #1e293b !important; border-color: #334155 !important; }
  .dark-mode .job-card:hover { border-color: var(--blue-500) !important; background: #0f172a !important; }
  .dark-mode .history-card { background: #1e293b !important; border-color: #334155 !important; color: #cbd5e1 !important; }
  .dark-mode .dash-notif-btn:hover { background: #334155 !important; }
  .dark-mode .messages-inbox, .dark-mode .messages-chat { background: #1e293b !important; border-color: #334155 !important; }
  .dark-mode .messages-inbox > div:last-child > div { background: #1e293b !important; border-color: #334155 !important; }
  .dark-mode .messages-inbox > div:last-child > div:hover { background: #0f172a !important; }
  .dark-mode [style*="background: var(--blue-50)"] { background: #1e3a5f !important; }
  .dark-mode [style*="background: #fafbfc"] { background: #1e293b !important; color: #f8fafc !important; }
  
  .dark-mode .chat-messages { background: #0f172a !important; }
  .dark-mode .chat-bubble.bot { background: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }

  .dark-mode .settings-header { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
  .dark-mode .role-input-box { background: #0f172a !important; border-color: #334155 !important; }
  .dark-mode .dash-gauge-inner { background: #1e293b !important; }

  /* Invert map tiles to make them dark mode friendly */
  .dark-mode .leaflet-layer,
  .dark-mode .leaflet-control-zoom-in,
  .dark-mode .leaflet-control-zoom-out,
  .dark-mode .leaflet-control-attribution { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }

  /* ── ATS SCORE CARD ── */
  .ats-card-header {
    display:flex; align-items:center; gap:12px; padding:20px 28px;
    background:#f8fafc; border-bottom:1px solid var(--slate-200);
  }
  .ats-card-title { margin:0; font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:var(--slate-800); }
  .ats-card-sub   { margin:2px 0 0; font-size:0.85rem; color:var(--slate-500); }
  .ats-improve-heading { margin:0 0 16px; font-family:var(--font-display); font-size:1.05rem; color:var(--slate-800); }
  .ats-suggestion-text { font-size:0.92rem; color:var(--slate-700); line-height:1.5; }

  .dark-mode .ats-card-header     { background:#1e293b !important; border-bottom-color:#334155 !important; }
  .dark-mode .ats-card-title      { color:#f1f5f9 !important; }
  .dark-mode .ats-card-sub        { color:#94a3b8 !important; }
  .dark-mode .ats-improve-heading { color:#f1f5f9 !important; }
  .dark-mode .ats-suggestion-text { color:#cbd5e1 !important; }

  /* ── SKILLS RECOMMENDATION CARD ── */
  .skills-card-header {
    display:flex; align-items:center; gap:12px; padding:20px 28px;
    background:#fffbeb; border-bottom:1px solid #fde68a;
  }
  .skills-card-title { margin:0; font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:#92400e; }
  .skills-card-sub   { margin:2px 0 0; font-size:0.85rem; color:#b45309; }
  .skill-chip {
    background:#fff7ed; color:#c2410c; padding:10px 18px;
    border-radius:10px; font-size:0.92rem; font-weight:700;
    border:1.5px solid #fed7aa; display:inline-flex; align-items:center;
    gap:8px; box-shadow:0 1px 4px rgba(251,146,60,0.15); font-family:var(--font-display);
  }
  .skill-chip-num {
    width:22px; height:22px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,#f97316,#ef4444);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:0.7rem; color:#fff; font-weight:800;
  }
  .dark-mode .skills-card-header { background:#1c1400 !important; border-bottom-color:#78350f !important; }
  .dark-mode .skills-card-title  { color:#fcd34d !important; }
  .dark-mode .skills-card-sub    { color:#fbbf24 !important; }
  .dark-mode .skill-chip         { background:#1c1400 !important; color:#fdba74 !important; border-color:#92400e !important; box-shadow:none !important; }

  /* Ensure inline modals & advice backgrounds are dark */
  .dark-mode [style*="background: #fff"], 
  .dark-mode [style*="background: rgb(255, 255, 255)"] { background: #1e293b !important; }
  .dark-mode [style*="background: #f8fafc"], 
  .dark-mode [style*="background: rgb(248, 250, 252)"] { background: #0f172a !important; color: #cbd5e1 !important; }
  .dark-mode [style*="background: #f1f5f9"],
  .dark-mode [style*="background: rgb(241, 245, 249)"] { background: #334155 !important; color: #f8fafc !important; }
`;

function Dashboard() {
  const [activeTab, setActiveTab] = useState(''); 
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('seeker'); 
  const [userEmail, setUserEmail] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole') || 'seeker'; 
    const storedEmail = localStorage.getItem('userEmail');
    const storedIsPro = localStorage.getItem('isPro') === 'true';

    if (!token) return navigate('/');
    if (storedRole === 'admin') return navigate('/admin');
    
    if (storedName) setUserName(storedName);
    if (storedEmail && storedEmail !== 'undefined') setUserEmail(storedEmail);
    setUserRole(storedRole);
    
    if (storedRole === 'recruiter' && !activeTab) setActiveTab('recruiter'); 
    else if (storedRole === 'seeker' && !activeTab) setActiveTab('dashboard'); 
  }, [navigate, activeTab]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let timeoutId;
    const logoutIdleUser = () => {
      alert("For your security, you have been signed out due to 15 minutes of inactivity.");
      localStorage.clear();
      navigate('/');
    };
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutIdleUser, 15 * 60 * 1000); 
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer(); 
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  const navItems = userRole === 'recruiter' 
    ? [
        { id: 'recruiter', icon: <Briefcase size={18} />, label: 'Post a Job' },
        { id: 'messages',  icon: <MessageSquare size={18} />, label: 'Messages' },
        { id: 'settings',  icon: <Settings size={18} />,  label: 'Settings' },
      ]
    : [
        { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Career Discovery' },
        { id: 'ats',       icon: <Target size={18} />,          label: 'ATS Scanner' }, // 🌟 NEW TAB IN SIDEBAR
        { id: 'interview', icon: <HelpCircle size={18} />,      label: 'Interview Prep' },
        { id: 'jobs',      icon: <MapPin size={18} />,          label: 'Jobs Posted' },
        { id: 'messages',  icon: <MessageSquare size={18} />, label: 'Messages' },
        { id: 'history',   icon: <History size={18} />,         label: 'Analysis History' },
        { id: 'settings',  icon: <Settings size={18} />,        label: 'Settings' },
      ];

  return (
    <div className="dash-layout">
      <style>{DASH_STYLES}</style>

      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <div className="dash-logo-icon">🔍</div>
          <span className="dash-logo-text">ResuMatch</span>
          <span className="dash-logo-badge">AI</span>
        </div>

        <nav className="dash-nav">
          <span className="dash-nav-label">Navigation</span>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`dash-nav-btn ${activeTab === item.id ? 'active' : ''}`}
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
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-search">
            <Search size={16} color="var(--slate-400)" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'history' && e.target.value !== '') setActiveTab('history');
              }}
            />
          </div>

          <div className="dash-header-right">
            <div 
              className="dash-notif-btn" 
              title="Toggle Dark Mode" 
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={17} color="var(--amber-400)" /> : <Moon size={17} />}
            </div>

            <div className="dash-notif-btn" title="Notifications">
              <Bell size={17} />
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

        {/* CONTENT */}
        <main
          className="dash-content"
          style={{ maxWidth: activeTab === 'jobs' || activeTab === 'messages' ? '100%' : '860px', margin: '0 auto', width: '100%' }}
          onClick={() => setShowProfileMenu(false)}
        >
          
          {userRole === 'seeker' && activeTab === 'dashboard' && <DiscoveryTab userName={userName} setActiveTab={setActiveTab} />}
          {userRole === 'seeker' && activeTab === 'ats'       && <AtsTab />} {/* 🌟 NEW ROUTE */}
          {userRole === 'seeker' && activeTab === 'interview' && <InterviewTab />}
          {userRole === 'seeker' && activeTab === 'jobs'      && <JobsTab />}
          {userRole === 'seeker' && activeTab === 'history'   && <HistoryTab searchQuery={searchQuery} />}
          {userRole === 'recruiter' && activeTab === 'recruiter' && <RecruiterTab />}
          
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'settings'  && <SettingsTab userName={userName} userRole={userRole} userEmail={userEmail} isPro={isPro} />}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CHATBOT COMPONENT
───────────────────────────────────────────────── */
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your ResuMatch AI assistant ✦\nAsk me anything about your career, resume, or job search!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/resume/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ message: text }), 
      });

      if (!res.ok) throw new Error('Backend responded with an error');
      const data = await res.json();
      
      const reply = data.reply ?? 'Sorry, I could not respond right now.';
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong connecting to the server. Please try again!' }]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

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
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((m, i) => {
                const isMyMessage = m.role !== 'bot';
                return (
                  <div key={i} style={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div className={`chat-bubble ${isMyMessage ? 'user' : 'bot'}`} style={{ textAlign: 'left' }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {isTyping && <div className="chat-msg"><div className="chat-bot-avatar">✦</div><div className="chat-typing"><span /><span /><span /></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-row">
            <textarea className="chat-input" rows={1} placeholder="Ask about your career…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
            <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim() || isTyping}><Send size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────
   🌟 NEW: ATS SCANNER TAB 🌟
───────────────────────────────────────────────── */
function AtsTab() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('desiredDomain', ''); // Empty, just doing an ATS scan

    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/resume/analyze', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResult(res.data.data);
    } catch {
      alert('ATS Scan failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-heading">ATS Resume Scanner</h2>
        <p className="page-sub">Check if your resume format can easily pass through Applicant Tracking Systems.</p>
      </div>

      <div className="card card-p" style={{ marginBottom: '24px' }}>
        <label htmlFor="ats-upload">
          <div
            className="upload-zone"
            style={{ borderColor: dragging ? 'var(--blue-400)' : undefined, background: dragging ? 'rgba(59,130,246,0.04)' : undefined }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap"><Target size={30} color="#4f46e5" /></div>
            <p className="upload-filename">{file ? `✓ ${file.name}` : 'Drop your resume here to scan'}</p>
            <p className="upload-hint">{file ? 'Ready to scan' : 'Accepts PDF files'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id="ats-upload" />

        <button className={`btn-analyze ${loading || !file ? 'disabled' : 'ready'}`} onClick={handleScan} disabled={loading || !file}>
          {loading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Scanning Format…</> : <><Target size={18} /> Run ATS Check</>}
        </button>
      </div>

      {result && (
         <div style={{ animation: 'fadeUp 0.4s ease both' }}>
          {(() => {
            const score = result.atsScore || 78; 
            const atsColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
            const defaultSuggestions = [
              "Ensure standard section headers like 'Experience' and 'Education'.",
              "Remove complex formatting or tables that might confuse parsers.",
              "Add more quantifiable metrics to your recent roles."
            ];
            const suggestions = result.atsSuggestions && result.atsSuggestions.length > 0 ? result.atsSuggestions : defaultSuggestions;

            return (
              <div className="card" style={{ borderTop: `4px solid ${atsColor}`, overflow: 'hidden' }}>
                <div className="ats-card-header">
                  <div style={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0, background: atsColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={20} color="#fff" /></div>
                  <div>
                    <h3 className="ats-card-title">ATS Compatibility Score</h3>
                    <p className="ats-card-sub">How well your resume is parsed by automated recruiter systems</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '32px', padding: '32px 28px', alignItems: 'center', flexWrap: 'wrap' }}>

                  {/* Gauge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, margin: '0 auto' }}>
                    <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: `conic-gradient(${atsColor} ${score}%, var(--slate-200) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                      <div className="dash-gauge-inner" style={{ width: '108px', height: '108px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: atsColor, lineHeight: 1 }}>{score}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h4 className="ats-improve-heading">How to improve your score:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {suggestions.map((suggestion, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <AlertCircle size={18} color={atsColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span className="ats-suggestion-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
         </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DISCOVERY TAB
───────────────────────────────────────────────── */
function DiscoveryTab({ userName, setActiveTab }) {
  const [file, setFile] = useState(null);
  const [desiredDomain, setDesiredDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result && resultsRef.current) setTimeout(() => resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [result]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const domainSnapshot = desiredDomain.trim();

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('desiredDomain', domainSnapshot);

    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/resume/analyze', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data.data;
      data._desiredDomain = domainSnapshot;
      setResult(data);
    } catch {
      alert('Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-heading">Welcome back, {userName.split(' ')[0] || 'there'} 👋</h2>
        <p className="page-sub">Upload your latest resume to discover your ideal career path powered by AI.</p>
      </div>

      <div className="card card-p" style={{ marginBottom: '24px' }}>
        <label htmlFor="resume-upload">
          <div
            className="upload-zone"
            style={{ borderColor: dragging ? 'var(--blue-400)' : undefined, background: dragging ? 'rgba(59,130,246,0.04)' : undefined }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap"><Upload size={30} color="#4f46e5" /></div>
            <p className="upload-filename">{file ? `✓ ${file.name}` : 'Drop your resume here, or click to browse'}</p>
            <p className="upload-hint">{file ? 'Ready to analyse' : 'Accepts PDF files'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id="resume-upload" />

        <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px' }}>Target Role (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Data Scientist, Deep Learning Engineer, Blockchain Developer..." 
              value={desiredDomain}
              onChange={(e) => setDesiredDomain(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-body)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue-400)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--slate-300)'}
            />
        </div>

        <button className={`btn-analyze ${loading || !file ? 'disabled' : 'ready'}`} onClick={handleAnalyze} disabled={loading || !file}>
          {loading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing with AI…</> : <><Sparkles size={18} /> Generate Career Insights</>}
        </button>
      </div>

      {result && (
        <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeUp 0.4s ease both' }}>
          
          <div className="card" style={{ borderTop: '3px solid var(--blue-500)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 28px', borderBottom: '1px solid var(--slate-100)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '10px', flexShrink: 0, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="var(--blue-600,#2563eb)" /></div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>Resume Analysis</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--slate-500)' }}>Insights & domain fit based on your uploaded document</p>
              </div>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Best-Fit Domains */}
              <div>
                <div className="ra-section-label">
                  <Compass size={14} color="var(--indigo-500)" />
                  <span>Best-Fit Domains</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.suggestedDomains?.map((d, i) => (
                    <span key={i} className="ra-domain-pill">
                      <TrendingUp size={12} />
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-100)' }} />

              {/* Key Insights */}
              <div>
                <div className="ra-section-label">
                  <ChevronRight size={14} color="var(--blue-500)" />
                  <span>Key Insights</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const items = Array.isArray(result.careerAdvice) ? result.careerAdvice : [result.careerAdvice];
                    const positiveWords = /strong|excellent|great|good|solid|impressive|proficient|highlight|advantage|expertise|effective/i;
                    const warnWords = /improve|consider|missing|lack|add|update|weak|gap|unclear|avoid|better|could|should|recommend/i;
                    return items.map((adv, i) => {
                      const tone = positiveWords.test(adv) ? 'success' : warnWords.test(adv) ? 'warn' : 'neutral';
                      return (
                        <div key={i} className={`ra-insight-row ${tone}`}>
                          <div className="ra-insight-num">{i + 1}</div>
                          <p className="ra-insight-text">{adv}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--amber-500)', overflow: 'hidden' }}>
            <div className="skills-card-header">
              <div style={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} color="#fff" /></div>
              <div>
                <h3 className="skills-card-title">
                  {result._desiredDomain ? `Skills to Acquire for ${result._desiredDomain}` : 'Recommended Skills to Strengthen'}
                </h3>
                <p className="skills-card-sub">
                  {result._desiredDomain ? 'Skill gaps identified between your resume and your target role' : 'General skills that would make your profile more competitive'}
                </p>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {result.missingSkills && result.missingSkills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {result.missingSkills.map((skill, i) => (
                    <span key={i} className="skill-chip">
                      <span className="skill-chip-num">{i + 1}</span>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--slate-400)' }}>
                  <Zap size={32} color="#fde68a" style={{ marginBottom: '10px', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>Enter a Target Role above before analyzing to see your personalized skill gaps here.</p>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setActiveTab('jobs')} style={{ alignSelf: 'flex-start', padding: '12px 24px', background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
            View Live Job Matches <ExternalLink size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   JOBS TAB (SEEKER VIEW)
───────────────────────────────────────────────── */
function JobsTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null); 
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_URL}/api/jobs/matches', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => setJobs(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile || !selectedJob) return;
    setApplying(true);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobId', selectedJob._id || selectedJob.id);
    formData.append('recruiterId', selectedJob.recruiterId);

    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/applications/apply', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      alert('Application submitted successfully!');
      setSelectedJob(null); setResumeFile(null);
    } catch (err) { alert('Failed to submit application.'); } finally { setApplying(false); }
  };

  const handleStartChat = async (job) => {
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/chat/send', { receiverId: job.recruiterId, text: `Hi! I am very interested in your ${job.title} position and would love to connect.` }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      alert('Message sent! Go to your Messages tab to view the conversation.');
      setSelectedJob(null); 
    } catch (err) { alert("Failed to send message."); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={36} color="var(--blue-500)" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div className="jobs-layout">
      <div className="jobs-list">
        <div style={{ marginBottom: '4px' }}>
          <h2 className="page-heading">Jobs Posted</h2>
          <p className="page-sub">Click on a job to view details and apply.</p>
        </div>
        
        {jobs.map(job => (
          <div key={job._id || job.id} className="job-card" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedJob(job)}>
            <div style={{ paddingRight: '60px' }}>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
            </div>
            
            {job.matchScore && (
              <div style={{ position: 'absolute', top: '22px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `conic-gradient(${job.matchScore >= 75 ? '#22c55e' : job.matchScore >= 50 ? '#f59e0b' : '#ef4444'} ${job.matchScore}%, #f1f5f9 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem' }}>
                    {job.matchScore}%
                  </div>
                </div>
              </div>
            )}
            <div className="job-meta">
              <span><MapPin size={14} /> {job.location}</span>
              <span><Briefcase size={14} /> {job.salary || 'Competitive'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`job-badge ${job.type?.toLowerCase().replace(' ', '') === 'fulltime' ? 'fulltime' : 'remote'}`}>{job.type}</span>
              <span style={{ background: '#f1f5f9', color: 'var(--slate-600)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.72rem', fontWeight: 700 }}>{job.domain}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="jobs-map">
        <MapContainer center={[22.5726, 88.3639]} zoom={4} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {jobs.map((job, idx) => {
            const lat = job.lat || (22.5726 + (Math.random() * 2 - 1));
            const lng = job.lng || (88.3639 + (Math.random() * 2 - 1));
            return (
              <Marker key={job._id || job.id || idx} position={[lat, lng]}>
                <Popup>
                  <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '14px' }}>{job.title}</strong>
                  <span style={{ color: 'var(--slate-500)', fontSize: '13px' }}>{job.company}</span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '32px', position: 'relative', animation: 'fadeUp 0.2s ease-out', margin: '20px' }}>
            <button onClick={() => { setSelectedJob(null); setResumeFile(null); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={24} /></button>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--slate-900)', margin: '0 0 4px' }}>{selectedJob.title}</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--blue-600)', fontWeight: 600, margin: '0 0 20px' }}>{selectedJob.company} • {selectedJob.location}</p>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Job Description</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
              
              <button 
                onClick={() => handleStartChat(selectedJob)}
                style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-200)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageSquare size={16} /> Send direct message to Recruiter
              </button>

              <h4 style={{ margin: '16px 0 8px', fontFamily: 'var(--font-display)' }}>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(Array.isArray(selectedJob.requiredSkills) ? selectedJob.requiredSkills : [selectedJob.requiredSkills].filter(Boolean)).map((skill, i) => (
                  <span key={i} style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--slate-700)' }}>{skill}</span>
                ))}
              </div>
            </div>

            <form onSubmit={handleApply} style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>Apply Now</h4>
              <input type="file" accept=".pdf" required onChange={e => setResumeFile(e.target.files[0])} style={{ display: 'block', marginBottom: '16px', width: '100%', padding: '10px', border: '1px dashed var(--slate-300)', borderRadius: '8px' }} />
              <button type="submit" disabled={applying || !resumeFile} className="btn-analyze ready" style={{ margin: 0 }}>
                {applying ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={18} />}&nbsp;{applying ? 'Sending Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   HISTORY TAB
───────────────────────────────────────────────── */
function HistoryTab({ searchQuery }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_URL}/api/resume/history', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
      .then(res => setHistory(res.data.data));
  }, []);

  const filtered = searchQuery ? history.filter(h => JSON.stringify(h).toLowerCase().includes(searchQuery.toLowerCase())) : history;

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-heading">Analysis History</h2>
        <p className="page-sub">{filtered.length} past {filtered.length === 1 ? 'analysis' : 'analyses'} found.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((item, idx) => (
          <div key={item._id} className="history-card" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--slate-100)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {item.suggestedDomains?.map((d, i) => <span key={i} className="history-tag">{d}</span>)}
              </div>
              <span className="history-date"><Calendar size={14} />{new Date(item.date).toLocaleDateString()}</span>
            </div>
            {Array.isArray(item.careerAdvice)
              ? <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.careerAdvice.map((adv, i) => <li key={i}>{adv}</li>)}</ul>
              : <p style={{ color: 'var(--slate-600)', margin: 0, lineHeight: 1.6, fontSize: '0.9rem', fontStyle: 'italic' }}>"{item.careerAdvice}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SETTINGS TAB
───────────────────────────────────────────────── */
function SettingsTab({ userName, userRole, userEmail,isPro }) { 
  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-heading">Settings</h2>
        <p className="page-sub">Manage your personal information and application preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="settings-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--slate-800)', fontSize: '1.05rem' }}>Profile Information</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px' }}>Display Name</label>
                <input type="text" defaultValue={userName} className="chat-input" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', padding: '10px 14px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px' }}>Account Role</label>
                <div className="role-input-box" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', borderRadius: '8px', opacity: 0.8, cursor: 'not-allowed', width: '100%', maxWidth: '400px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue-600)', textTransform: 'capitalize', fontFamily: 'var(--font-display)' }}>
                    {userRole || 'Seeker'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px' }}>Email Address</label>
                <input 
                  type="email" 
                  defaultValue={userEmail && userEmail !== 'undefined' ? userEmail : "No email provided"} 
                  disabled 
                  className="chat-input" 
                  style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', padding: '10px 14px', opacity: 0.7, cursor: 'not-allowed' }} 
                />
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--slate-400)' }}>Your email address is used for login and cannot be changed here.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="settings-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="var(--amber-500)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--slate-800)', fontSize: '1.05rem' }}>Subscription & AI Engine</h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, color: 'var(--slate-900)', fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Free Tier</h4>
                <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>ResuMatch v2</span>
              </div>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '500px', lineHeight: 1.5 }}>
                You currently have access to standard AI career discovery and basic job matching. Upgrade to unlock deep resume rewrites and priority matching.
              </p>
            </div>
           {isPro ? (
           <span style={{ padding: '10px 20px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', borderRadius: '8px', fontWeight: 700, fontFamily: 'var(--font-display)', border: '1px solid #bbf7d0' }}>
             Pro Tier Active ✨
           </span>
         ) : (
           <UpgradePro userEmail={userEmail} userName={userName} />
         )}
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--red-500)' }}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--slate-900)', fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>Delete Account</h4>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.85rem' }}>Permanently remove your account and all associated resume data.</p>
            </div>
            <button style={{ padding: '10px 20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
              Delete Account
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn-analyze ready" style={{ width: 'auto', margin: 0, padding: '14px 32px' }} onClick={() => alert('Settings saved successfully!')}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   RECRUITER TAB
───────────────────────────────────────────────── */
function RecruiterTab() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [viewingApplicants, setViewingApplicants] = useState(null); 
  const [applicantsList, setApplicantsList] = useState([]);

  const initialFormState = { title: '', company: '', location: '', type: 'Full-Time', salary: '', domain: '', requiredSkills: '', description: '' };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/jobs/recruiter', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setJobs(res.data.data);
      if (res.data.data.length === 0) setShowForm(true); 
    } catch (err) {} finally { setFetchingJobs(false); }
  };

  const handleAddNew = () => { setFormData(initialFormState); setEditingId(null); setShowForm(true); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = (job) => { setFormData({ ...job, requiredSkills: job.requiredSkills.join(', ') }); setEditingId(job._id); setShowForm(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
    setJobs(jobs.filter(j => j._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      let lat = null, lng = null;
      try {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
        if (geoRes.data && geoRes.data.length > 0) { lat = parseFloat(geoRes.data[0].lat); lng = parseFloat(geoRes.data[0].lon); }
      } catch (geoErr) {}
      const payload = { ...formData, requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()), lat, lng };
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

      if (editingId) await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${editingId}`, payload, config);
      else await axios.post('${import.meta.env.VITE_API_URL}/api/jobs/post', payload, config);
      await fetchMyJobs(); setShowForm(false);  
    } catch (error) { alert('Failed to save job.'); } finally { setLoading(false); }
  };

  const handleViewApplicants = async (jobId) => {
    setViewingApplicants(jobId);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/recruiter/${jobId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setApplicantsList(res.data.data);
    } catch (error) { alert("Failed to load applicants."); }
  };

  if (fetchingJobs) return <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={36} color="var(--blue-500)" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div><h2 className="page-heading">Recruiter Dashboard</h2><p className="page-sub">Manage jobs and review applicants.</p></div>
        {!showForm && <button onClick={handleAddNew} className="btn-analyze ready" style={{ width: 'auto', marginTop: 0, padding: '10px 20px' }}>+ Post New Job</button>}
      </div>

      {showForm ? (
        <div className="card card-p">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--slate-800)' }}>{editingId ? 'Edit Job Posting' : 'Create New Job Posting'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--slate-500)', cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Job Title</label><input required name="title" value={formData.title} onChange={handleChange} className="chat-input" style={{ width: '100%', borderRadius: '8px' }} /></div>
              <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Company</label><input required name="company" value={formData.company} onChange={handleChange} className="chat-input" style={{ width: '100%', borderRadius: '8px' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Location</label><input required name="location" value={formData.location} onChange={handleChange} className="chat-input" style={{ width: '100%', borderRadius: '8px' }} /></div>
              <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Target Domain</label><input required name="domain" value={formData.domain} onChange={handleChange} className="chat-input" style={{ width: '100%', borderRadius: '8px' }} /></div>
            </div>
            <div><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Required Skills</label><input required name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} className="chat-input" style={{ width: '100%', borderRadius: '8px' }} /></div>
            <div><label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--slate-600)', marginBottom: '8px', display: 'block' }}>Job Description</label><textarea required name="description" value={formData.description} onChange={handleChange} className="chat-input" rows={4} style={{ width: '100%', borderRadius: '8px', resize: 'vertical' }} /></div>
            <button type="submit" disabled={loading} className="btn-analyze ready" style={{ marginTop: '10px' }}>{loading ? 'Saving...' : 'Publish Job Post'}</button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map(job => (
            <div key={job._id} className="job-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div><h3 className="job-title">{job.title}</h3><p className="job-company" style={{ margin: '4px 0' }}>{job.company} • {job.location}</p><div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}><span style={{ background: '#f1f5f9', color: 'var(--slate-600)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600 }}>{job.domain}</span></div></div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => handleViewApplicants(job._id)} style={{ padding: '8px 16px', background: 'var(--indigo-500)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14}/> Applicants</button>
                <button onClick={() => handleEdit(job)} style={{ padding: '8px 16px', background: 'var(--slate-100)', color: 'var(--slate-700)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Edit</button>
                <button onClick={() => handleDelete(job._id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 APPLICANTS MODAL 🌟 */}
      {viewingApplicants && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', padding: '32px', position: 'relative', animation: 'fadeUp 0.2s ease-out', margin: '20px' }}>
            <button onClick={() => setViewingApplicants(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={24} /></button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--slate-900)', margin: '0 0 20px' }}>Applicants for this Role</h2>
            
            {applicantsList.length === 0 ? <p style={{ color: 'var(--slate-500)' }}>No applications received yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applicantsList.map(app => (
                  <div key={app._id} style={{ padding: '16px', border: '1px solid var(--slate-200)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--slate-800)' }}>{app.seekerId?.name || 'Unknown User'}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{app.seekerId?.email}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a href={`${import.meta.env.VITE_API_URL}/${app.resumePath}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#eff6ff', color: 'var(--blue-600)', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}><Download size={14} /> View Resume</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MESSAGES TAB
───────────────────────────────────────────────── */
function MessagesTab() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_URL}/api/chat/inbox', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
      .then(res => setConversations(res.data.data));
  }, []);

  useEffect(() => {
    let interval;
    if (activeChat) {
      const fetchChat = () => { axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${activeChat._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(res => setMessages(res.data.data)); };
      fetchChat(); interval = setInterval(fetchChat, 3000); 
    }
    return () => clearInterval(interval); 
  }, [activeChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault(); if (!newMessage.trim() || !activeChat) return;
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/chat/send', { receiverId: activeChat._id, text: newMessage }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setNewMessage('');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${activeChat._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setMessages(res.data.data);
    } catch (err) { alert("Failed to send message"); }
  };

  return (
    <div className="messages-layout">
      <div className="card messages-inbox">
        <div className='chat-header' style={{ padding: '20px', borderBottom: '1px solid var(--slate-200)', background: '#fafbfc' }}><h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--slate-800)' }}>Inbox</h3></div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? <p style={{ padding: '20px', color: 'var(--slate-400)', fontSize: '0.9rem', textAlign: 'center' }}>No conversations yet.</p> : (
            conversations.map(c => (
              <div key={c._id} onClick={() => setActiveChat(c)} style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer', background: activeChat?._id === c._id ? 'var(--blue-50)' : '#fff', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--slate-800)' }}>{c.name}</strong><span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{new Date(c.date).toLocaleDateString()}</span></div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="card messages-chat">
        {activeChat ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--slate-200)', background: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--indigo-500))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{activeChat.name.charAt(0).toUpperCase()}</div>
              <div><h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--slate-800)' }}>{activeChat.name}</h3><p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>{activeChat.role}</p></div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              {messages.map((m, i) => {
                const isMyMessage = m.sender !== activeChat._id;
                return (<div key={i} style={{ display:'flex', justifyContent: isMyMessage ? 'flex-end' : 'flex-start', width: '100%' }}><div className={`chat-bubble ${isMyMessage ? 'user' : 'bot'}`}>{m.text}</div></div>);
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid var(--slate-200)', background: '#fff', display: 'flex', gap: '12px' }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--slate-300)', outline: 'none', fontFamily: 'var(--font-body)' }} />
              <button type="submit" disabled={!newMessage.trim()} style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: 'var(--blue-600)', color: '#fff', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: newMessage.trim() ? 1 : 0.6 }}><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
/* ─────────────────────────────────────────────────
   🌟 NEW: INTERVIEW PREP TAB 🌟
───────────────────────────────────────────────── */
function InterviewTab() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setQuestions(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/resume/interview', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuestions(res.data.data);
    } catch {
      alert('Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-heading">AI Interview Prep</h2>
        <p className="page-sub">Generate personalized, challenging interview questions based on your resume's claims.</p>
      </div>

      <div className="card card-p" style={{ marginBottom: '24px' }}>
        <label htmlFor="interview-upload">
          <div
            className="upload-zone"
            style={{ borderColor: dragging ? 'var(--blue-400)' : undefined, background: dragging ? 'rgba(59,130,246,0.04)' : undefined }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon-wrap"><HelpCircle size={30} color="#4f46e5" /></div>
            <p className="upload-filename">{file ? `✓ ${file.name}` : 'Drop your resume here to generate questions'}</p>
            <p className="upload-hint">{file ? 'Ready to analyze' : 'Accepts PDF files'}</p>
          </div>
        </label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id="interview-upload" />

        <button className={`btn-analyze ${loading || !file ? 'disabled' : 'ready'}`} onClick={handleGenerate} disabled={loading || !file}>
          {loading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Experience…</> : <><HelpCircle size={18} /> Generate My Questions</>}
        </button>
      </div>

      {questions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp 0.4s ease both' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--slate-800)', fontSize: '1.2rem', marginBottom: '8px' }}>Your Personalized Questions</h3>
          
          {questions.map((q, idx) => (
            <div key={idx} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--indigo-500)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--indigo-100)', color: 'var(--indigo-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
                  Q{idx + 1}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--slate-900)', lineHeight: 1.5 }}>{q.question}</h4>
                  <div style={{ background: 'var(--slate-50)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--slate-200)', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Why the interviewer is asking this:</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>{q.rationale}</p>
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