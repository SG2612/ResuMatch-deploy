// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import AdminPanel from './AdminPanel';

// --- THE ROUTE GUARD ---
// This acts as a bouncer. If there is no token, it instantly kicks the user back to the login screen.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Make sure this route exists to catch the redirect! */}
        <Route path="/admin" element={<AdminPanel />} /> 
      </Routes>
    </Router>
  );
}

export default App;