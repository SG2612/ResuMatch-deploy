// client/src/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Users, Activity, LogOut, Loader2, Crown,
  Trash2, UserPlus, ArrowLeft, Calendar, FileText, ChevronRight, X,
  Briefcase // <-- NEW IMPORT
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const ADMIN_STYLES = `
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }

  .admin-layout { display:flex; height:100vh; background:#f1f5f9; font-family:var(--font-body); }

  /* ── SIDEBAR ── */
  .admin-sidebar { width:252px; background:var(--navy-950); color:#f8fafc; display:flex; flex-direction:column; flex-shrink:0; position:relative; overflow:hidden; }
  .admin-sidebar::before { content:''; position:absolute; inset:0; pointer-events:none; background: radial-gradient(ellipse 80% 40% at 20% 10%, rgba(245,158,11,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 80%, rgba(59,130,246,0.07) 0%, transparent 55%); }
  .admin-sidebar-logo { padding:22px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:12px; position:relative; }
  .admin-logo-icon { width:38px; height:38px; background:linear-gradient(135deg,#d97706,#f59e0b); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; box-shadow:var(--shadow-glow-amber); }
  .admin-logo-text { font-family:var(--font-display); font-size:1.1rem; font-weight:800; color:#fff; }
  .admin-logo-badge { font-size:0.6rem; font-family:var(--font-display); font-weight:700; letter-spacing:0.08em; background:rgba(245,158,11,0.2); color:var(--amber-400); padding:2px 7px; border-radius:4px; border:1px solid rgba(245,158,11,0.3); text-transform:uppercase; margin-left:auto; flex-shrink:0; }
  .admin-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:4px; position:relative; }
  .admin-nav-label { font-family:var(--font-display); font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(148,163,184,0.5); padding:8px 8px 4px; margin-top:8px; }
  .admin-nav-btn { display:flex; align-items:center; gap:11px; padding:11px 12px; width:100%; background:transparent; color:#94a3b8; border:none; border-radius:var(--radius-md); cursor:pointer; font-family:var(--font-body); font-size:0.9rem; font-weight:500; transition:all 0.18s; text-align:left; position:relative; }
  .admin-nav-btn:hover { background:rgba(255,255,255,0.05); color:#e2e8f0; }
  .admin-nav-btn.active { background:rgba(245,158,11,0.15); color:#fbbf24; font-weight:600; border:1px solid rgba(245,158,11,0.25); }
  .admin-nav-btn.active::before { content:''; position:absolute; left:0; top:25%; bottom:25%; width:3px; background:var(--amber-400); border-radius:0 3px 3px 0; }
  .admin-sidebar-footer { padding:14px 12px; border-top:1px solid rgba(255,255,255,0.06); }
  .btn-admin-exit { width:100%; padding:10px 12px; background:rgba(239, 68, 68, 0.08); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.2); border-radius:var(--radius-md); font-family:var(--font-body); font-size:0.875rem; font-weight: 600; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all 0.18s; }
  .btn-admin-exit:hover { background:rgba(239, 68, 68, 0.15); color:#dc2626; }

  /* ── MAIN ── */
  .admin-main { flex:1; overflow-y:auto; padding:38px 40px; }
  .page-heading { font-family:var(--font-display); font-size:1.7rem; font-weight:800; color:var(--slate-900); margin:0 0 6px; letter-spacing:-0.01em; }
  .page-sub     { color:var(--slate-500); margin:0; font-size:0.95rem; font-weight:300; }

  /* ── STAT CARDS & CHART ── */
  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:18px; margin-bottom:24px; }
  .stat-card { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); padding:22px 24px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:18px; animation:fadeUp 0.35s ease both; }
  .stat-icon { padding:14px; border-radius:var(--radius-md); flex-shrink:0; }
  .stat-icon.blue   { background:#dbeafe; }
  .stat-icon.green  { background:#dcfce7; }
  .stat-label { font-family:var(--font-display); font-size:0.75rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--slate-400); margin:0 0 4px; }
  .stat-value { font-family:var(--font-display); font-size:2rem; font-weight:800; color:var(--slate-900); margin:0; }
  
  .chart-card { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm); margin-bottom:32px; animation:fadeUp 0.4s ease both; }
  .chart-header { font-family:var(--font-display); font-weight:700; font-size:1.1rem; color:var(--slate-800); margin:0 0 20px; display:flex; justify-content:space-between; align-items:center;}
  .chart-legend { display:flex; gap:16px; font-size:0.8rem; font-weight:600; color:var(--slate-500); }
  .chart-legend-item { display:flex; align-items:center; gap:6px; }
  .chart-dot { width:8px; height:8px; border-radius:50%; }

  /* ── TABLE & BUTTONS ── */
  .admin-table-wrap { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); box-shadow:var(--shadow-sm); overflow:hidden; animation:fadeUp 0.45s ease both; }
  .admin-table-head { padding:18px 24px; border-bottom:1px solid var(--slate-200); background:#fafbfc; display:flex; flex-direction:column; align-items:flex-start; gap:16px; }
  .admin-table-title { font-family:var(--font-display); font-weight:700; font-size:1rem; color:var(--slate-800); margin:0; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#f8fafc; }
  th { padding:13px 22px; text-align:left; font-family:var(--font-display); font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--slate-400); border-bottom:1px solid var(--slate-200); }
  td { padding:14px 22px; border-bottom:1px solid #f8fafc; font-size:0.9rem; }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr { transition:background 0.15s; }
  tbody tr:hover { background:#fafbff; }

  .role-badge { padding:3px 10px; border-radius:20px; font-family:var(--font-display); font-size:0.7rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }
  .role-badge.admin { background:#fef3c7; color:#b45309; } 
  .role-badge.seeker  { background:#eff6ff; color:#2563eb; } 
  .role-badge.recruiter { background:#fdf4ff; color:#c026d3; } 
  .role-badge.user { background:#f1f5f9; color:var(--slate-500); } 

  .status-badge { padding:3px 10px; border-radius:20px; font-family:var(--font-display); font-size:0.7rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }
  .status-badge.active { background:#dcfce7; color:#16a34a; }
  .status-badge.closed { background:#f1f5f9; color:var(--slate-500); }
  
  .filter-btn { padding:6px 14px; border-radius:20px; border:1px solid var(--slate-200); background:#fff; color:var(--slate-600); font-family:var(--font-display); font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .filter-btn:hover { background:var(--slate-50); }
  .filter-btn.active { background:var(--slate-800); color:#fff; border-color:var(--slate-800); }

  .btn-view { padding:6px 14px; background:#eff6ff; color:var(--blue-600); border:none; border-radius:var(--radius-sm); cursor:pointer; font-family:var(--font-display); font-size:0.8rem; font-weight:600; margin-right:8px; transition:all 0.15s; }
  .btn-view:hover { background:#dbeafe; }
  .btn-delete { padding:6px 14px; background:#fef2f2; color:var(--red-500); border:none; border-radius:var(--radius-sm); cursor:pointer; font-family:var(--font-display); font-size:0.8rem; font-weight:600; transition:all 0.15s; }
  .btn-delete:hover { background:#fee2e2; }

  /* ── ADD USER FORM ── */
  .add-user-form { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); padding:24px; margin-bottom:24px; animation:fadeUp 0.25s ease both; box-shadow:var(--shadow-sm); }
  .add-user-form-title { font-family:var(--font-display); font-weight:700; color:var(--slate-800); margin:0 0 18px; font-size:0.95rem; display:flex; align-items:center; gap:8px; }
  .form-grid { display:flex; gap:14px; flex-wrap:wrap; align-items:flex-end; }
  .form-group { display:flex; flex-direction:column; flex:1; min-width:140px; }
  .form-label { font-family:var(--font-display); font-size:0.72rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--slate-400); margin-bottom:6px; }
  .form-input { padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--slate-300); font-family:var(--font-body); font-size:0.9rem; color:var(--slate-700); background:#fafbfc; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
  .form-input:focus { border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.10); background:#fff; }
  .form-select { padding:10px 12px; border-radius:var(--radius-md); border:1px solid var(--slate-300); font-family:var(--font-body); font-size:0.9rem; color:var(--slate-700); background:#fafbfc; outline:none; }
  .btn-create { padding:10px 22px; background:linear-gradient(135deg,#16a34a,#059669); color:#fff; border:none; border-radius:var(--radius-md); font-family:var(--font-display); font-weight:700; font-size:0.875rem; cursor:pointer; height:42px; align-self:flex-end; white-space:nowrap; transition:all 0.2s; }
  .btn-create:hover { transform:translateY(-1px); box-shadow:0 0 20px rgba(22,163,74,0.25); }

  .btn-add-user { display:flex; align-items:center; gap:7px; padding:9px 18px; background:var(--blue-600); color:#fff; border:none; border-radius:var(--radius-md); font-family:var(--font-display); font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; }
  .btn-add-user:hover { background:var(--blue-700); transform:translateY(-1px); }
  .btn-add-user.cancel { background:#f1f5f9; color:var(--slate-600); }
  .btn-add-user.cancel:hover { background:var(--slate-200); transform:none; }

  /* ── USER DETAIL / FEED / ERROR ── */
  .user-detail-header { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); padding:26px 28px; margin-bottom:24px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:18px; }
  .user-detail-avatar { width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg,var(--blue-500),var(--indigo-500)); display:flex; align-items:center; justify-content:center; color:#fff; font-family:var(--font-display); font-weight:800; font-size:1.3rem; flex-shrink:0; box-shadow:var(--shadow-glow-blue); }
  .user-detail-name { font-family:var(--font-display); font-weight:800; font-size:1.2rem; color:var(--slate-900); margin:0 0 3px; }
  .user-detail-sub  { color:var(--slate-500); font-size:0.875rem; margin:0; }
  .btn-back { display:flex; align-items:center; gap:7px; background:none; border:none; color:var(--slate-500); cursor:pointer; font-family:var(--font-body); font-size:0.9rem; padding:0; margin-bottom:20px; transition:color 0.15s; }
  .btn-back:hover { color:var(--slate-800); }
  
  .feed-card { background:#fff; border-radius:var(--radius-lg); border:1px solid var(--slate-200); padding:22px 24px; box-shadow:var(--shadow-sm); animation:fadeUp 0.3s ease both; }
  .feed-avatar { width:32px; height:32px; border-radius:10px; background:linear-gradient(135deg,var(--slate-300),var(--slate-400)); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:0.8rem; font-weight:700; color:#fff; }
  .feed-domain { background:#f1f5f9; color:var(--slate-600); padding:4px 12px; border-radius:15px; font-family:var(--font-display); font-size:0.78rem; font-weight:600; }
  .feed-advice-label { font-family:var(--font-display); font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--slate-400); margin:0 0 6px; }

  .admin-error-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; gap:16px; }
  .btn-return { padding:10px 22px; background:var(--blue-600); color:#fff; border:none; border-radius:var(--radius-md); cursor:pointer; font-family:var(--font-display); font-weight:700; }
`;

function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  
  // 🌟 NEW STATES FOR JOBS 🌟
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewState, setViewState] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [roleFilter, setRoleFilter] = useState('all');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');        
  };

  useEffect(() => {
    let timeoutId;
    const logoutIdleUser = () => {
      alert("Admin session expired due to inactivity.");
      localStorage.clear();
      navigate('/');
    };
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutIdleUser, 5*1000*60); 
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer(); 
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  // Fallback Mock Data for Jobs (in case backend isn't ready)
  const fallbackMockJobs = [
    { _id: 'j1', title: 'Senior Frontend Engineer', company: 'TechNova', recruiterName: 'Alice Smith', status: 'active', createdAt: '2026-04-12T10:00:00Z' },
    { _id: 'j2', title: 'Machine Learning Architect', company: 'DataSphere', recruiterName: 'Bob Jones', status: 'closed', createdAt: '2026-04-10T10:00:00Z' },
    { _id: 'j3', title: 'Web3 Developer', company: 'ChainLinker', recruiterName: 'Alice Smith', status: 'active', createdAt: '2026-04-14T10:00:00Z' },
  ];

  const fetchAdminData = async () => {
    try {
      if (!token) return navigate('/');
      
      // We added the Jobs API call here, with a catch so it doesn't break if the route isn't built yet
      const [statsRes, usersRes, analysesRes, jobsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats',    { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/users',    { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/analyses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/jobs',     { headers: { Authorization: `Bearer ${token}` } }) 
        // ^^^ I removed the .catch() fallback line here!
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAllAnalyses(analysesRes.data);
      setJobs(jobsRes.data);

    } catch {
      setError('Access Denied. Admin privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      alert('User Created!');
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      fetchAdminData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create user'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name} and ALL their data?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAdminData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete user'); }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Delete job posting: ${title}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAdminData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete job'); }
  };

  const handleViewUser = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedUser(res.data.user);
      setSelectedUserHistory(res.data.history);
      setViewState('userDetails');
    } catch { alert('Failed to load details'); }
  };

  const getUserName = (userId) => users.find(u => u._id === userId)?.name ?? 'Deleted User';

  const chartDataToRender = stats?.chartData || [
    { name: 'Mon', seekers: 3, recruiters: 1, analyses: 4 },
    { name: 'Tue', seekers: 4, recruiters: 2, analyses: 8 },
    { name: 'Wed', seekers: 2, recruiters: 1, analyses: 12 },
    { name: 'Thu', seekers: 6, recruiters: 3, analyses: 18 },
    { name: 'Fri', seekers: 5, recruiters: 2, analyses: 22 },
    { name: 'Sat', seekers: 8, recruiters: 4, analyses: 15 },
    { name: 'Sun', seekers: 11, recruiters: 5, analyses: 28 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <Loader2 size={40} color="var(--amber-500)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="admin-error-wrap">
        <ShieldAlert size={56} color="var(--red-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--slate-800)', margin: 0 }}>{error}</h2>
        <button className="btn-return" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      <style>{ADMIN_STYLES}</style>

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">♛</div>
          <span className="admin-logo-text">Admin Panel</span>
          <span className="admin-logo-badge">Pro</span>
        </div>
        <nav className="admin-nav">
          <span className="admin-nav-label">Management</span>
          {[
            { id: 'overview',    icon: <Users size={18} />,    label: 'User Management' },
            { id: 'jobs',        icon: <Briefcase size={18} />, label: 'Job Postings' }, // <-- NEW TAB
            { id: 'globalFeed',  icon: <Activity size={18} />, label: 'Global Data Feed' },
          ].map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); if (item.id === 'overview') setViewState('dashboard'); }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="btn-admin-exit" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">

        {/* ── OVERVIEW: DASHBOARD ── */}
        {activeTab === 'overview' && viewState === 'dashboard' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 className="page-heading">Platform Overview</h2>
                <p className="page-sub">Monitor users and platform activity.</p>
              </div>
              <button
                className={`btn-add-user ${showAddForm ? 'cancel' : ''}`}
                onClick={() => setShowAddForm(v => !v)}
              >
                {showAddForm ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Register New User</>}
              </button>
            </div>

            {showAddForm && (
              <div className="add-user-form">
                <p className="add-user-form-title"><UserPlus size={16} /> New User Details</p>
                <form onSubmit={handleAddUser}>
                  <div className="form-grid">
                    {[
                      { field: 'name',     type: 'text',     placeholder: 'Jane Smith' },
                      { field: 'email',    type: 'email',    placeholder: 'jane@example.com' },
                      { field: 'password', type: 'text',     placeholder: 'Temp password' },
                    ].map(({ field, type, placeholder }) => (
                      <div key={field} className="form-group">
                        <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                          required type={type} placeholder={placeholder}
                          className="form-input" value={newUser[field]}
                          onChange={e => setNewUser({ ...newUser, [field]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="form-group" style={{ minWidth: '130px', maxWidth: '160px' }}>
                      <label className="form-label">Role</label>
                      <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                        <option value="user">User</option>
                        <option value="seeker">Seeker</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-create">Create →</button>
                  </div>
                </form>
              </div>
            )}

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><Users size={28} color="var(--blue-600)" /></div>
                <div>
                  <p className="stat-label">Total Users</p>
                  <h3 className="stat-value">{stats?.totalUsers ?? '—'}</h3>
                </div>
              </div>
              <div className="stat-card" style={{ animationDelay: '0.06s' }}>
                <div className="stat-icon green"><Activity size={28} color="#16a34a" /></div>
                <div>
                  <p className="stat-label">Total Analyses</p>
                  <h3 className="stat-value">{stats?.totalAnalyses ?? '—'}</h3>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                Platform Growth
                <div className="chart-legend">
                  <div className="chart-legend-item">
                    <div className="chart-dot" style={{ background: '#3b82f6' }}></div> Seekers
                  </div>
                  <div className="chart-legend-item">
                    <div className="chart-dot" style={{ background: '#c026d3' }}></div> Recruiters
                  </div>
                  <div className="chart-legend-item">
                    <div className="chart-dot" style={{ background: '#16a34a' }}></div> Analyses Run
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartDataToRender} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSeekers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRecruiters" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c026d3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c026d3" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="seekers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSeekers)" />
                    <Area type="monotone" dataKey="recruiters" stroke="#c026d3" strokeWidth={3} fillOpacity={1} fill="url(#colorRecruiters)" />
                    <Area type="monotone" dataKey="analyses" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorAnalyses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-head">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <h3 className="admin-table-title">User Directory</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontFamily: 'var(--font-display)' }}>{users.length} total</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>All</button>
                  <button className={`filter-btn ${roleFilter === 'seeker' ? 'active' : ''}`} onClick={() => setRoleFilter('seeker')}>Seekers</button>
                  <button className={`filter-btn ${roleFilter === 'recruiter' ? 'active' : ''}`} onClick={() => setRoleFilter('recruiter')}>Recruiters</button>
                  <button className={`filter-btn ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => setRoleFilter('admin')}>Admins</button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => roleFilter === 'all' || user.role === roleFilter)
                    .map(user => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 600, color: 'var(--slate-800)', fontFamily: 'var(--font-display)' }}>{user.name}</td>
                      <td style={{ color: 'var(--slate-500)' }}>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-view" onClick={() => handleViewUser(user._id)}>View</button>
                        <button className="btn-delete" onClick={() => handleDeleteUser(user._id, user.name)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(user => roleFilter === 'all' || user.role === roleFilter).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--slate-400)' }}>
                        No {roleFilter !== 'all' ? roleFilter + 's' : 'users'} found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── OVERVIEW: USER DETAILS ── */}
        {activeTab === 'overview' && viewState === 'userDetails' && selectedUser && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <button className="btn-back" onClick={() => setViewState('dashboard')}>
              <ArrowLeft size={16} /> Back to Users
            </button>
            <div className="user-detail-header">
              <div className="user-detail-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="user-detail-name">{selectedUser.name}</h2>
                <p className="user-detail-sub">{selectedUser.email} · Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <FileText size={18} color="var(--slate-500)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-800)', margin: 0 }}>
                Personal History ({selectedUserHistory.length})
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedUserHistory.map(item => (
                <div key={item._id} style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ color: 'var(--slate-700)', margin: 0, lineHeight: 1.6, fontStyle: 'italic', fontSize: '0.9rem' }}>
                    "{item.careerAdvice}"
                  </p>
                </div>
              ))}
              {selectedUserHistory.length === 0 && (
                <p style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No analyses found for this user.</p>
              )}
            </div>
          </div>
        )}

        {/* ── 🌟 NEW JOBS TAB 🌟 ── */}
        {activeTab === 'jobs' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 className="page-heading">Job Listings</h2>
              <p className="page-sub">Manage all active and closed job postings by recruiters.</p>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-head">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <h3 className="admin-table-title">Current Postings</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontFamily: 'var(--font-display)' }}>{jobs.length} total</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={`filter-btn ${jobFilter === 'all' ? 'active' : ''}`} onClick={() => setJobFilter('all')}>All</button>
                  <button className={`filter-btn ${jobFilter === 'active' ? 'active' : ''}`} onClick={() => setJobFilter('active')}>Active</button>
                  <button className={`filter-btn ${jobFilter === 'closed' ? 'active' : ''}`} onClick={() => setJobFilter('closed')}>Closed</button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Recruiter</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. SAFEGUARD: Ensure jobs is actually an array before filtering */}
                  {(Array.isArray(jobs) ? jobs : [])
                    .filter(job => jobFilter === 'all' || (job.status || 'active') === jobFilter)
                    .map(job => (
                    <tr key={job._id}>
                      {/* 2. SAFEGUARD: Provide fallback text if a field is empty in the database */}
                      <td style={{ fontWeight: 600, color: 'var(--slate-800)', fontFamily: 'var(--font-display)' }}>
                        {job.title || 'Untitled Job'}
                      </td>
                      <td style={{ color: 'var(--slate-500)' }}>{job.company || 'Unknown Company'}</td>
                      <td style={{ color: 'var(--slate-500)' }}>{job.recruiterId?.name || 'Unknown Recruiter'}</td>
                      
                      {/* 3. SAFEGUARD: Only format the date if it exists */}
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      
                      {/* 4. THE WSOD CULPRIT FIXED: Fallback to 'active' if status is missing */}
                      <td>
                        <span className={`status-badge ${job.status || 'active'}`}>
                          {(job.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-delete" onClick={() => handleDeleteJob(job._id, job.title)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty State */}
                  {(Array.isArray(jobs) ? jobs : []).filter(job => jobFilter === 'all' || (job.status || 'active') === jobFilter).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--slate-400)' }}>
                        No {jobFilter !== 'all' ? jobFilter : ''} job postings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GLOBAL FEED ── */}
        {activeTab === 'globalFeed' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 className="page-heading">Global Analysis Feed</h2>
              <p className="page-sub">Every career insight generated on the platform — live.</p>
            </div>

            {allAnalyses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
                <Activity size={40} color="var(--slate-300)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--slate-400)', margin: 0 }}>No analyses have been run yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {allAnalyses.map((item, idx) => (
                  <div key={item._id} className="feed-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid var(--slate-100)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="feed-avatar">{getUserName(item.userId).charAt(0).toUpperCase()}</div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                          {getUserName(item.userId)}
                        </span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--slate-400)', fontSize: '0.83rem' }}>
                        <Calendar size={14} />
                        {new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <p className="feed-advice-label">AI Feedback</p>
                      <p style={{ color: 'var(--slate-700)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>"{item.careerAdvice}"</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                      {item.suggestedDomains?.map((d, i) => (
                        <span key={i} className="feed-domain">{d}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;