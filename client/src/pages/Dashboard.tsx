import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import MetricCard from '../components/ui/MetricCard';
import { FileText, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data: analytics, isLoading, isError: analyticsError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/summary`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
  });

  const { data: recentClaims, isLoading: claimsLoading, isError: claimsError } = useQuery({
    queryKey: ['recent-claims'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/claims?limit=10`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch claims');
      return res.json();
    }
  });

  if (isLoading || claimsLoading) return <div className="skeleton" style={{ width: '100%', height: '80vh' }}></div>;
  if (analyticsError || claimsError) return (
    <div className="error-state">
      <AlertCircle size={48} />
      <h2>Failed to load dashboard</h2>
      <p>Please check your connection or try again later.</p>
      <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1>System Overview</h1>
          <p>Welcome back, {user?.email.split('@')[0]}. Here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analytics, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href",     dataStr);
              downloadAnchorNode.setAttribute("download", `report_${user?.role}_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
              toast.success('Report downloaded successfully');
            }}
          >
            Download Report
          </button>
          <button onClick={() => navigate('/claims/new')} className="btn btn-primary">
            New Claim
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Total Claims" value={analytics?.kpis.totalClaims || 0} change="+12.5%" changeType="positive" icon={FileText} variant="blue" />
        <MetricCard label="Under Review" value={analytics?.kpis.pendingClaims || 0} change="-4.2%" changeType="positive" icon={AlertCircle} variant="amber" />
        <MetricCard label="Avg. Response" value="2.4 days" change="-10%" changeType="positive" icon={TrendingUp} variant="green" />
        <MetricCard label="Satisfaction" value="98%" change="+2.1%" changeType="positive" icon={CheckCircle2} variant="blue" />
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Claims</div>
              <div className="card-subtitle">Latest activity across the system</div>
            </div>
            <button onClick={() => navigate('/claims')} className="btn btn-ghost btn-sm">
              VIEW ALL Activity
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Policyholder</th>
                  <th>Status</th>
                  <th className="col-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims?.map((claim: any) => (
                  <tr key={claim._id} onClick={() => navigate(`/claims/${claim._id}`)} style={{ cursor: 'pointer' }}>
                    <td className="col-mono">{claim.claim_number}</td>
                    <td>
                      <div>
                        {claim.policy_id?.policy_holder_id?.name || '---'}
                        <div className="col-muted">{claim.event_id?.event_name}</div>
                      </div>
                    </td>
                    <td><StatusBadge status={claim.claim_status} /></td>
                    <td className="col-right" style={{ fontWeight: 600 }}>
                      {formatCurrency(claim.claim_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Claims by Event</div>
          <div className="chart-card-sub">Distribution of claim types</div>
          <div style={{ height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.claimsByEvent} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--ink-muted)" />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--ink-muted)" width={100} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} 
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ height: '400px' }}>
        <div className="chart-card-title">Monthly Activity Trend</div>
        <div className="chart-card-sub">Claim filing frequency over the last 6 months</div>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--ink-muted)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--ink-muted)" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} 
              />
              <Area type="monotone" dataKey="claims" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorClaims)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
