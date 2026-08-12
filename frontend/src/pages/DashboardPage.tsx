import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/apiServices';
import { DashboardStats } from '../types';
import { StatusBadge, PriorityBadge, UserAvatar } from '../components/Badges';
import { CardSkeleton } from '../components/Skeleton';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const isNoProjects = !stats || stats.totalProjects === 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Engineering Telemetry Dashboard
          </h2>
          <p className="text-sm text-zinc-400">Real-time aggregate project stats & team activity breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI Task Generator
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {isNoProjects ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/60 p-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-semibold text-zinc-200">No Projects Found</h3>
            <p className="text-sm text-zinc-400">
              Create your first project or get invited by a teammate to unlock Kanban boards, sprint telemetry, and AI task tracking.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-950/50"
          >
            <Plus className="h-4 w-4" />
            Create Your First Project
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Projects */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-5 shadow-sm space-y-2 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
                <FolderKanban className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{stats.totalProjects}</span>
                <span className="text-xs text-zinc-400 font-mono">Active Workspaces</span>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-5 shadow-sm space-y-2 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
                <ListTodo className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{stats.totalTasks}</span>
                <span className="text-xs text-zinc-400 font-mono">Across Board Columns</span>
              </div>
            </div>

            {/* Completed Tasks & Completion % */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-5 shadow-sm space-y-2 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-400">{stats.completedTasks}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {stats.completionPercentage}% Done
                </span>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-5 shadow-sm space-y-2 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold ${stats.overdueTasks > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
                  {stats.overdueTasks}
                </span>
                <span className={`text-xs font-semibold ${stats.overdueTasks > 0 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded' : 'text-zinc-400'}`}>
                  {stats.overdueTasks > 0 ? 'Action Required' : 'All On Track'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Graph & Project Progress Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Bar Chart (2 columns) */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-[#121215] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    Weekly Task Velocity (Last 7 Days)
                  </h3>
                  <p className="text-xs text-zinc-400">Daily comparison of created vs completed engineering tasks</p>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="dayName" stroke="#71717a" fontSize={12} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="createdCount" name="Created" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completedCount" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per-Project Progress Bars (1 column) */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-semibold text-zinc-100">Project Completion</h3>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {stats.projectProgress.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="group cursor-pointer rounded-lg p-2.5 hover:bg-zinc-800/50 transition-colors space-y-2 border border-transparent hover:border-zinc-800"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors truncate">
                        {p.name}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {p.completedTasks}/{p.totalTasks} ({p.progressPercentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Tasks List */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#121215] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Recently Updated Tasks</h3>
                <p className="text-xs text-zinc-400">Tasks with recent status or assignment updates across all boards</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-xs uppercase text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Task Title</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {stats.recentTasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/projects/${t.projectId}`)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-zinc-100 flex items-center gap-2">
                        <span>{t.title}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                        {t.projectName || 'DevFlow'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={t.assignee} size="sm" />
                          <span className="text-xs text-zinc-300">{t.assignee?.fullName || 'Unassigned'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
