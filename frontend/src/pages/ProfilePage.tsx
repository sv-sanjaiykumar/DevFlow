import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/Badges';
import { User, Shield, Mail, Calendar, KeyRound, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Developer Profile</h2>
        <p className="text-sm text-zinc-400">Manage your DevFlow session, credentials, and avatar</p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121215] p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-800/80">
          <UserAvatar user={user} size="lg" />
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-bold text-zinc-100">{user?.fullName}</h3>
            <p className="text-sm text-cyan-400 font-mono">@{user?.username}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" /> Authenticated JWT Session
            </span>
          </div>
        </div>

        {/* User Info Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" /> Email Address
            </span>
            <p className="text-sm font-medium text-zinc-200">{user?.email}</p>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-400" /> Account ID
            </span>
            <p className="text-xs font-mono text-zinc-400 truncate">{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
