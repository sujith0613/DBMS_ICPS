import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ChevronRight, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function TopBar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const pathnames = location.pathname.split('/').filter((x) => x);
  
  return (
    <header className="topbar">
      <div className="topbar-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--ink-muted)' }}>ICPS</span>
          {pathnames.length > 0 && <ChevronRight size={14} style={{ color: 'var(--ink-muted)' }} />}
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            return (
              <div key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  color: isLast ? 'var(--ink)' : 'var(--ink-muted)', 
                  fontWeight: isLast ? 600 : 400,
                  textTransform: 'capitalize' 
                }}>
                  {value.replace('-', ' ')}
                </span>
                {!isLast && <ChevronRight size={14} style={{ color: 'var(--ink-muted)' }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="topbar-right">
        <button 
          className="topbar-icon-btn"
          onClick={() => toast.info('No new notifications')}
        >
          <Bell />
          <div className="notif-dot"></div>
        </button>
        
        <div style={{ height: '20px', width: '1px', background: 'var(--border)', margin: '0 8px' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="sidebar-user-name" style={{ color: 'var(--ink)', fontSize: '13px' }}>
              {user?.email?.split('@')[0]}
            </div>
            <div className="sidebar-user-role" style={{ marginTop: '0' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
          <div className="sidebar-avatar" style={{ width: '30px', height: '30px', fontSize: '11px' }}>
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
