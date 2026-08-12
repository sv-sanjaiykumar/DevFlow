import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './Badges';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  User as UserIcon,
  LogOut,
  Terminal,
  ChevronRight,
  Code2,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects & Kanban', path: '/projects', icon: FolderKanban },
    { label: 'AI Task Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Developer Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 border-r border-zinc-800/80 bg-[#0c0c0e] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Logo / Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-white font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                DevFlow
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-zinc-400 font-mono">Dev OS Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile */}
      <div className="border-t border-zinc-800/80 p-3">
        <div className="flex items-center justify-between rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <UserAvatar user={user} size="md" />
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-zinc-200">{user?.fullName}</p>
              <p className="truncate text-[11px] text-zinc-400 font-mono">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
