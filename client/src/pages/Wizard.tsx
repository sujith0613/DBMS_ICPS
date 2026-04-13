import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UploadCloud, File, X, ArrowLeft } from 'lucide-react';

export default function Wizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => Math.min(5, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, claimId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('files', file);
      formData.append('document_type', file.type.includes('pdf') ? 'Report' : 'Image');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: percentComplete }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Failed to upload ${file.name}`));
        }
      };

      xhr.onerror = () => reject(new Error(`Network error uploading ${file.name}`));

      xhr.open('POST', `/api/claims/${claimId}/documents`);
      xhr.withCredentials = true; 
      xhr.send(formData);
    });
  };

  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');

  const { data: policies } = useQuery({
    queryKey: ['my-policies'],
    queryFn: async () => {
      const res = await fetch('/api/policies', { credentials: 'include' });
      return res.json();
    }
  });

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/service-providers', { credentials: 'include' });
      return res.json();
    }
  });

  const submitClaim = async () => {
    if (!selectedPolicy || !selectedProvider || !incidentDate || !claimAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const policy = policies.find((p: any) => p._id === selectedPolicy);
      
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_number: `CLM-${Date.now()}`,
          claim_date: new Date(incidentDate),
          claim_amount: parseFloat(claimAmount),
          claim_status: 'Submitted',
          event_id: policy.event_id._id,
          policy_id: selectedPolicy,
          provider_id: selectedProvider,
          description: description
        }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Claim creation failed');
      const claim = await res.json();
      toast.success('Claim created. Uploading documents...');

      for (const file of files) {
        await uploadFile(file, claim._id);
      }

      toast.success('All documents uploaded successfully!');
      setTimeout(() => {
        navigate('/claims');
      }, 1500);

    } catch (err: any) {
      toast.error(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wizard-container">
      <button onClick={() => navigate('/claims')} className="back-link">
        <ArrowLeft size={14} /> Back to Claims
      </button>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>File a New Claim</h1>
          <p>Follow the steps to submit your insurance claim for processing.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`wizard-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
            <div className="wizard-step-number">{s}</div>
            <div className="wizard-step-label">
              {s === 1 && "Policy"}
              {s === 2 && "Incident"}
              {s === 3 && "Provider"}
              {s === 4 && "Evidence"}
              {s === 5 && "Review"}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {step === 1 && "Select Policy"}
            {step === 2 && "Incident Details"}
            {step === 3 && "Service Provider"}
            {step === 4 && "Upload Documents"}
            {step === 5 && "Review & Submit"}
          </div>
          <div className="card-subtitle">
            {step === 1 && "Choose the active policy you want to claim against."}
            {step === 2 && "Provide the date, amount, and description of the incident."}
            {step === 3 && "Select the hospital or garage handling this claim."}
            {step === 4 && "Upload all necessary bills and reports."}
            {step === 5 && "Review your information before final submission."}
          </div>
        </div>

        <div className="card-body">
          {step === 1 && (
            <div className="form-group">
              <label className="form-label">Available Policies</label>
              <select 
                className="form-select" 
                value={selectedPolicy} 
                onChange={(e) => setSelectedPolicy(e.target.value)}
              >
                <option value="">Select a policy...</option>
                {policies?.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.policy_number} - {p.event_id?.event_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Date of Incident</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Claim Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Enter amount" 
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Describe what happened..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="form-group">
              <label className="form-label">Search Service Provider</label>
              <select 
                className="form-select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">Select a provider...</option>
                {providers?.map((pr: any) => (
                  <option key={pr._id} value={pr._id}>
                    {pr.provider_name} ({pr.provider_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <label style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '140px', 
                border: '2px dashed var(--border)', 
                borderRadius: '12px', 
                background: 'var(--base-bg)', 
                cursor: 'pointer' 
              }}>
                <UploadCloud size={32} style={{ color: 'var(--ink-muted)', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Click to upload files</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>PDF, JPG, PNG allowed</div>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Selected Files</div>
                  {files.map((file, i) => (
                    <div key={i} style={{ 
                      padding: '12px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <File size={14} style={{ color: 'var(--ink-muted)' }} />
                          {file.name}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeFile(i)} style={{ padding: '4px' }}>
                          <X size={14} />
                        </button>
                      </div>
                      {isSubmitting && uploadProgress[file.name] !== undefined && (
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--accent)', width: `${uploadProgress[file.name]}%`, transition: 'width 0.3s' }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div style={{ background: 'var(--base-bg)', padding: '24px', borderRadius: '12px' }}>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--ink-muted)', paddingBottom: '12px' }}>Policy</td>
                    <td style={{ fontWeight: 600, paddingBottom: '12px' }}>
                      {policies?.find((p: any) => p._id === selectedPolicy)?.policy_number}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--ink-muted)', paddingBottom: '12px' }}>Amount</td>
                    <td style={{ fontWeight: 600, paddingBottom: '12px' }}>₹{claimAmount}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--ink-muted)', paddingBottom: '12px' }}>Provider</td>
                    <td style={{ fontWeight: 600, paddingBottom: '12px' }}>
                      {providers?.find((pr: any) => pr._id === selectedProvider)?.provider_name}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--ink-muted)' }}>Documents</td>
                    <td style={{ fontWeight: 600 }}>{files.length} Files attached</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                 <label style={{ display: 'flex', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                   <input type="checkbox" style={{ marginTop: '3px' }} />
                   <span>I declare that all information provided is accurate and I understand that fraud carries legal consequences.</span>
                 </label>
              </div>
            </div>
          )}
        </div>

        <div className="card-footer" style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', padding: '24px' }}>
          <button className="btn btn-outline" onClick={handlePrev} disabled={step === 1 || isSubmitting}>Back</button>
          {step < 5 ? (
             <button className="btn btn-primary" onClick={handleNext} disabled={step === 4 && files.length === 0}>Continue</button>
          ) : (
             <button className="btn btn-primary" onClick={submitClaim} disabled={isSubmitting}>
               {isSubmitting ? 'Submitting...' : 'Submit Claim'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
