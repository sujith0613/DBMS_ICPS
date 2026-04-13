import { NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  LayoutDashboard, 
  FileStack, 
  Shield, 
  LineChart, 
  LogOut, 
  Users, 
  Building2, 
  AlertCircle,
  CreditCard,
  FileSearch,
  ClipboardList,
  Stethoscope,
  Briefcase
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      queryClient.clear();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      logout(); // still clear local state
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? 'nav-link active' : 'nav-link';

  const getLinksByRole = () => {
    const role = user?.role;
    if (role === 'admin') {
      return (
        <>
          <div className="nav-section-label">Overview</div>
          <NavLink to="/" className={navLinkClass} end><LayoutDashboard /> Dashboard</NavLink>
          <NavLink to="/analytics" className={navLinkClass}><LineChart /> Analytics</NavLink>
          
          <div className="nav-section-label">Claims</div>
          <NavLink to="/claims" className={navLinkClass}><FileStack /> All Claims</NavLink>
          <NavLink to="/claims?status=Under%20Review" className={navLinkClass}><FileSearch /> Pending Review</NavLink>
          <NavLink to="/payments" className={navLinkClass}><CreditCard /> Payments</NavLink>
          
          <div className="nav-section-label">Management</div>
          <NavLink to="/policyholders" className={navLinkClass}><Users /> Policyholders</NavLink>
          <NavLink to="/policies" className={navLinkClass}><Shield /> Policies</NavLink>
          <NavLink to="/branches" className={navLinkClass}><Building2 /> Branches</NavLink>
          <NavLink to="/service-providers" className={navLinkClass}><Stethoscope /> Service Providers</NavLink>
          <NavLink to="/surveyors" className={navLinkClass}><Briefcase /> Surveyors</NavLink>
          
          <div className="nav-section-label">Settings</div>
          <NavLink to="/audit-log" className={navLinkClass}><ClipboardList /> Audit Log</NavLink>
        </>
      );
    }

    if (role === 'branch_manager') {
      return (
        <>
          <div className="nav-section-label">Overview</div>
          <NavLink to="/" className={navLinkClass} end><LayoutDashboard /> Dashboard</NavLink>
          
          <div className="nav-section-label">Claims</div>
          <NavLink to="/claims" className={navLinkClass}><FileStack /> Branch Claims</NavLink>
          <NavLink to="/claims?status=Submitted" className={navLinkClass}><AlertCircle /> Pending Assignments</NavLink>
          
          <div className="nav-section-label">Management</div>
          <NavLink to="/policyholders" className={navLinkClass}><Users /> Policyholders</NavLink>
          <NavLink to="/policies" className={navLinkClass}><Shield /> Policies</NavLink>
          
          <div className="nav-section-label">Team</div>
          <NavLink to="/surveyors" className={navLinkClass}><Briefcase /> Surveyors</NavLink>
        </>
      );
    }

    if (role === 'policyholder') {
      return (
        <>
          <div className="nav-section-label">My Account</div>
          <NavLink to="/" className={navLinkClass} end><LayoutDashboard /> Dashboard</NavLink>
          <NavLink to="/policies" className={navLinkClass}><Shield /> My Policies</NavLink>
          <NavLink to="/claims" className={navLinkClass}><FileStack /> My Claims</NavLink>
          
          <div className="nav-section-label">Actions</div>
          <NavLink to="/claims/new" className={navLinkClass}><FileStack /> File a Claim</NavLink>
        </>
      );
    }

    if (role === 'surveyor') {
      return (
        <>
          <div className="nav-section-label">Work</div>
          <NavLink to="/" className={navLinkClass} end><LayoutDashboard /> Dashboard</NavLink>
          <NavLink to="/claims?assigned=true" className={navLinkClass}><FileStack /> Assigned Claims</NavLink>
          <NavLink to="/my-reviews" className={navLinkClass}><ClipboardList /> My Reviews</NavLink>
        </>
      );
    }

    if (role === 'service_provider') {
      return (
        <>
          <div className="nav-section-label">Overview</div>
          <NavLink to="/" className={navLinkClass} end><LayoutDashboard /> Dashboard</NavLink>
          <NavLink to="/claims" className={navLinkClass}><FileStack /> Linked Claims</NavLink>
        </>
      );
    }

    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">ICPS ENTERPRISE</div>
        <div className="sidebar-logo-sub">Smart Claim System</div>
      </div>
      
      <nav className="sidebar-nav">
        {getLinksByRole()}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {user?.email?.[0].toUpperCase()}
        </div>
        <div>
          <div className="sidebar-user-name">{user?.email?.split('@')[0]}</div>
          <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
