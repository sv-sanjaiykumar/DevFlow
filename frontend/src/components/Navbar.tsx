import React from 'react';
import { Menu, Bell, Sparkles, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from './Badges';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC<{ onMenuToggle: () => void; title?: string }> = ({ onMenuToggle, title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-[#09090b]/80 px-4 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-100">{title || 'DevFlow Workspace'}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick AI Task Button */}
        <button
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/20 transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>AI Task Generator</span>
        </button>

        {/* Notifications Button with Coming Soon tooltip */}
        <div className="relative group">
          <button
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 opacity-60 cursor-not-allowed"
            title="Notifications coming soon"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="absolute right-0 top-11 hidden group-hover:block z-50 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 shadow-lg border border-zinc-700">
            Notifications (Coming soon)
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <UserAvatar user={user} size="sm" />
          <span className="hidden md:inline text-xs font-medium text-zinc-300">{user?.username}</span>
        </div>
      </div>
    </header>
  );
};
