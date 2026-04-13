import { useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { FileText, AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency } from '../lib/utils';

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [hasViewedDocument, setHasViewedDocument] = useState(false);
  const [reviewAmount, setReviewAmount] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/claims/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch claim');
      return res.json();
    }
  });

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/claims/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Claim status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['claim', id] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submitReview = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/claim_reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claim._id,
          surveyor_id: user?.reference_id,
          review_date: new Date(),
          recommended_amount: Number(reviewAmount),
          remarks: reviewRemarks
        }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to submit review');
      toast.success('Review submitted successfully');
      if (claim.claim_status === 'Submitted') {
         await updateStatus('Under Review');
      } else {
         queryClient.invalidateQueries({ queryKey: ['claim', id] });
      }
      setReviewAmount('');
      setReviewRemarks('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDocument = (doc: any) => {
    setViewingDoc(doc);
    setHasViewedDocument(true);
  };

  if (isLoading) return <div className="skeleton" style={{ width: '100%', height: '500px' }}></div>;
  if (!claim) return <div>Claim not found</div>;

  const hasDocuments = claim.documents && claim.documents.length > 0;

  return (
    <div className="claim-detail-page">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/claims')} className="btn btn-ghost btn-sm" style={{ marginLeft: '-12px', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Claims
          </button>
          <h1>Claim {claim.claim_number}</h1>
          <p>Filed on {format(new Date(claim.claim_date), 'MMMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <StatusBadge status={claim.claim_status} />
        </div>
      </div>

      <div className="claim-detail-grid">
        {/* Left: Timeline */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">STATUS HISTORY</div>
          </div>
          <div className="card-body-sm">
            <div className="timeline">
              {claim.status_history?.map((history: any, idx: number) => (
                <div key={history.status_id} className="timeline-item">
                  <div className="timeline-left">
                    <div className={`timeline-dot ${history.status.toLowerCase().replace(' ', '')}`}></div>
                    {idx < claim.status_history.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-status">{history.status}</div>
                    <div className="timeline-meta">{format(new Date(history.status_date), 'MMM d, h:mm a')}</div>
                    <div className="timeline-actor">by {history.updated_by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Content & Docs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">CLAIM INFORMATION</div>
            </div>
            <div className="card-body">
              <div className="info-grid" style={{ marginBottom: '24px' }}>
                <div>
                  <div className="info-item-label">Claim Amount</div>
                  <div className="info-item-value" style={{ fontSize: '20px', color: 'var(--accent)' }}>
                    {formatCurrency(claim.claim_amount)}
                  </div>
                </div>
                <div>
                  <div className="info-item-label">Event Type</div>
                  <div className="info-item-value">{claim.event_id?.event_name}</div>
                  <div className="col-muted">Risk Level: {claim.event_id?.risk_level}</div>
                </div>
              </div>

              <div className="section-title">Evidence & Documents</div>
              {hasDocuments ? (
                <div>
                  {claim.documents.map((doc: any) => (
                    <div key={doc.document_id} className="doc-card">
                      <div className="doc-icon"><FileText /></div>
                      <div>
                        <div className="doc-name">{doc.document_type || 'Attached File'}</div>
                        <div className="doc-meta">Uploaded {format(new Date(doc.upload_date), 'MMM d, yyyy')}</div>
                      </div>
                      <div className="doc-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openDocument(doc)}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-doc-banner">
                  <AlertTriangle /> No documents have been uploaded for this claim.
                </div>
              )}

              <div className="divider" style={{ margin: '24px 0' }}></div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {['admin', 'branch_manager'].includes(user?.role || '') && ['Submitted', 'Under Review'].includes(claim.claim_status) && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => updateStatus('Approved')}
                      disabled={!hasDocuments}
                    >
                      Approve Claim
                    </button>
                    <button className="btn btn-danger" onClick={() => updateStatus('Rejected')}>Reject Claim</button>
                    {claim.claim_status === 'Submitted' && (
                      <button className="btn btn-outline" onClick={() => updateStatus('Under Review')}>Assign to Surveyor</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {user?.role === 'surveyor' && ['Submitted', 'Under Review'].includes(claim.claim_status) && (
            <div className="card" style={{ border: '1px solid #fde68a', background: '#fffbeb' }}>
              <div className="card-header">
                <div className="card-title">SURVEYOR ASSESSMENT</div>
              </div>
              <div className="card-body">
                {!hasViewedDocument && (
                  <div className="doc-warning">
                    <AlertTriangle /> You must view at least one document before submitting the review.
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Recommended Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={reviewAmount} 
                    onChange={e => setReviewAmount(e.target.value)} 
                    placeholder="0.00" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Review Remarks</label>
                  <textarea 
                    className="form-textarea" 
                    value={reviewRemarks} 
                    onChange={e => setReviewRemarks(e.target.value)} 
                    placeholder="Provide details about the damage assessment..."
                  />
                </div>
                <button 
                  className="btn btn-primary btn-full" 
                  disabled={!hasViewedDocument || !reviewAmount}
                  onClick={submitReview}
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Meta Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">LINKED POLICY</div>
            </div>
            <div className="card-body-sm">
              <div className="col-mono" style={{ fontSize: '14px', marginBottom: '8px' }}>{claim.policy_id?.policy_number}</div>
              <div className="info-item-label">Coverage Limit</div>
              <div className="info-item-value">{formatCurrency(claim.policy_id?.coverage_amount)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">SERVICE PROVIDER</div>
            </div>
            <div className="card-body-sm">
              <div className="info-item-value">{claim.provider_id?.provider_name}</div>
              <div className="col-muted">{claim.provider_id?.provider_type}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT MODAL */}
      {viewingDoc && (
        <div className="modal-overlay" onClick={() => setViewingDoc(null)}>
          <div className="modal-panel modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{viewingDoc.document_type || 'Document Viewer'}</div>
              <button className="modal-close" onClick={() => setViewingDoc(null)}><X /></button>
            </div>
            <div className="modal-body" style={{ padding: '0', height: '70vh' }}>
              <iframe 
                src={viewingDoc.file_path.startsWith('http') ? viewingDoc.file_path : `${API_BASE_URL}${viewingDoc.file_path}`} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
                title="Document viewer"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewingDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
