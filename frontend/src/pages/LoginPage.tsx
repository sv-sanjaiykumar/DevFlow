import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      toast.error('Please enter both username/email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ usernameOrEmail, password });
      toast.success('Welcome back to DevFlow!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (username: string) => {
    setUsernameOrEmail(username);
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b] p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20 mb-2">
            <Terminal className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DevFlow Operating Platform</h1>
          <p className="text-sm text-zinc-400">Sign in to access AI task boards & project telemetry</p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#121215]/80 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="alex_dev or alex@devflow.io"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500 focus:outline-none transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Picker */}
          <div className="mt-6 border-t border-zinc-800/80 pt-4">
            <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Quick Demo Login:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('sarah_lead')}
                className="rounded-md border border-zinc-800 bg-zinc-900/50 py-1.5 px-2 text-[11px] font-medium text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
              >
                Sarah (Lead)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('alex_dev')}
                className="rounded-md border border-zinc-800 bg-zinc-900/50 py-1.5 px-2 text-[11px] font-medium text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
              >
                Alex (Dev)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('marcus_qa')}
                className="rounded-md border border-zinc-800 bg-zinc-900/50 py-1.5 px-2 text-[11px] font-medium text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors"
              >
                Marcus (QA)
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
            Register new developer profile
          </Link>
        </p>
      </div>
    </div>
  );
};
