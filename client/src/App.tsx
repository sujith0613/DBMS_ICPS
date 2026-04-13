import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from './components/ui/sonner';

// Import Layout & Pages
import PageLayout from './components/layout/PageLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import ClaimDetail from './pages/ClaimDetail';
import Wizard from './pages/Wizard';
import Analytics from './pages/Analytics';
import Policies from './pages/Policies';

import { useEffect } from 'react';

import { API_BASE_URL } from './lib/api';

// Protected Route Guard
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    
    if (isLoading) return <div className="skeleton" style={{ width: '100vw', height: '100vh' }}></div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    return <PageLayout />;
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    checkAuth();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />
          <Route path="/claims/new" element={<Wizard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/policies" element={<Policies />} />
          {/* Remaining placeholder routes that redirect to dashboard for now */}
          <Route path="/payments" element={<Navigate to="/" replace />} />
          <Route path="/policyholders" element={<Navigate to="/" replace />} />
          <Route path="/branches" element={<Navigate to="/" replace />} />
          <Route path="/service-providers" element={<Navigate to="/" replace />} />
          <Route path="/surveyors" element={<Navigate to="/" replace />} />
          <Route path="/audit-log" element={<Navigate to="/" replace />} />
          <Route path="/my-reviews" element={<Navigate to="/" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
