import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDemoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password');
    toast.info('Demo credentials filled');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      queryClient.clear();
      login(data.user);
      toast.success('Login successful');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">I</div>
          <h1 className="login-title">ICPS Enterprise</h1>
          <p className="login-sub">Insurance Claim Processing System</p>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className="form-input"
              placeholder="name@icps.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="form-input"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit">
            Sign In to ICPS
          </button>
        </form>

        <div className="login-divider">
          <div className="login-divider-line"></div>
          <span className="login-divider-text">DEMO ACCOUNTS</span>
          <div className="login-divider-line"></div>
        </div>
        
        <div className="demo-buttons">
          <button onClick={() => handleDemoLogin('admin@icps.com')} className="demo-btn">Admin</button>
          <button onClick={() => handleDemoLogin('manager@icps.com')} className="demo-btn">Manager</button>
          <button onClick={() => handleDemoLogin('arjunkumar@gmail.com')} className="demo-btn">Policyholder</button>
          <button onClick={() => handleDemoLogin('rajesh@icps.com')} className="demo-btn">Surveyor</button>
          <button onClick={() => handleDemoLogin('apollo@hospital.com')} className="demo-btn">Provider</button>
        </div>
      </div>
    </div>
  );
}
