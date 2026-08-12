import React from 'react';
import { TaskStatus, TaskPriority } from '../types';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const config = {
    BACKLOG: { label: 'Backlog', bg: 'bg-zinc-800/80 text-zinc-300 border-zinc-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    CODE_REVIEW: { label: 'Code Review', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    TESTING: { label: 'Testing', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  }[status] || { label: status, bg: 'bg-zinc-800 text-zinc-300' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${config.bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const config = {
    LOW: { label: 'Low', bg: 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50', icon: ArrowDown },
    MEDIUM: { label: 'Medium', bg: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: ArrowUp },
    HIGH: { label: 'High', bg: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
    URGENT: { label: 'Urgent', bg: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: AlertCircle },
  }[priority] || { label: priority, bg: 'text-zinc-400', icon: HelpCircle };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.bg}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export const UserAvatar: React.FC<{
  user?: { username?: string; fullName?: string; avatarUrl?: string } | null;
  size?: 'sm' | 'md' | 'lg';
}> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }[size];

  const name = user?.fullName || user?.username || 'User';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover ring-1 ring-zinc-700/50`}
        onError={(e) => {
          // Fallback if image load fails
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 font-semibold text-white ring-1 ring-zinc-700/50`}
      title={name}
    >
      {initials}
    </div>
  );
};
