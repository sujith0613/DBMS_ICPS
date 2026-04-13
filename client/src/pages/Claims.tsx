import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';

export default function Claims() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: claims, isLoading } = useQuery({
    queryKey: ['claims', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'All' ? '/api/claims' : `/api/claims?claim_status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch claims');
      return res.json();
    }
  });

  const filteredClaims = claims?.filter((c: any) => 
    c.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.policy_id?.policy_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventBadgeClass = (name: string) => {
    switch(name?.toLowerCase()) {
      case 'medical treatment': return 'badge-medical';
      case 'vehicle accident': return 'badge-vehicle';
      case 'theft': return 'badge-theft';
      case 'fire damage': return 'badge-rejected'; // using rejected red for fire
      default: return 'badge-neutral';
    }
  };

  if (isLoading) return <div className="skeleton" style={{ width: '100%', height: '400px' }}></div>;

  return (
    <div className="claims-page">
      <div className="page-header">
        <div>
          <h1>Claims Queue</h1>
          <p>Manage and track all insurance claims in the system.</p>
        </div>
        <button onClick={() => navigate('/claims/new')} className="btn btn-primary">
          + File Claim
        </button>
      </div>

      <div className="filter-bar">
        {['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'].map(status => (
          <button 
            key={status}
            className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
        <input 
          type="text" 
          className="filter-search" 
          placeholder="Search claim or policy #" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim #</th>
              <th>Policy #</th>
              <th>Event Type</th>
              <th>Status</th>
              <th className="col-right">Amount</th>
              <th>Date</th>
              <th className="col-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims?.map((claim: any) => (
              <tr key={claim._id}>
                <td className="col-mono">{claim.claim_number}</td>
                <td>{claim.policy_id?.policy_number}</td>
                <td>
                  <span className={`badge ${getEventBadgeClass(claim.event_id?.event_name)}`}>
                    {claim.event_id?.event_name}
                  </span>
                </td>
                <td>
                  <StatusBadge status={claim.claim_status} />
                </td>
                <td className="col-right" style={{ fontWeight: 600 }}>
                  {formatCurrency(claim.claim_amount)}
                </td>
                <td className="col-muted">{format(new Date(claim.claim_date), 'MMM d, yyyy')}</td>
                <td className="col-right">
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/claims/${claim._id}`)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
