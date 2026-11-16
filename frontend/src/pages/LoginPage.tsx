import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Lock, Mail, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Authentication successful! Welcome to HillGuard.');
      // Direct according to email/role
      if (email.includes('official') || email.includes('admin')) {
        navigate('/dashboard/official');
      } else {
        navigate('/dashboard/traveller');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Demo credentials loaded for ${demoEmail}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#16A36A] flex items-center justify-center text-white shadow-md">
              <Mountain className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#123B2A] font-mono">
              HILL<span className="text-[#16A36A]">GUARD</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Access real-time Arunachal highway intelligence & control centre
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons for Evaluation */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2.5">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
            Demo Accounts for Viva & Evaluation
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('traveller@hillguard.in', 'Traveller@123')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold text-center transition shadow-xs"
            >
              Traveller
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('official@hillguard.in', 'Official@123')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold text-center transition shadow-xs"
            >
              BRO Official
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@hillguard.in', 'Admin@123')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold text-center transition shadow-xs"
            >
              Administrator
            </button>
          </div>
          <p className="text-[10px] text-emerald-700 italic">
            Clicking loads pre-seeded credentials into the form below.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hillguard.in"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#123B2A] hover:bg-[#1a4a36] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:underline">
              Register as Traveller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
