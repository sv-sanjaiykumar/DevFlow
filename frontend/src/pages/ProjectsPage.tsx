import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/apiServices';
import { Project } from '../types';
import { UserAvatar } from '../components/Badges';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CardSkeleton } from '../components/Skeleton';
import {
  Plus,
  FolderKanban,
  Users,
  CheckCircle2,
  Trash2,
  Search,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (err: any) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProj = await projectApi.createProject({ name, description });
      toast.success(`Project "${newProj.name}" created!`);
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err: any) {
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;

    try {
      await projectApi.deleteProject(deleteTarget.id);
      toast.success(`Project "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Engineering Workspaces</h2>
          <p className="text-sm text-zinc-400">Manage team repositories, project access, and Kanban task boards</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-500 hover:to-blue-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter workspaces by name or description..."
          className="w-full rounded-xl border border-zinc-800 bg-[#121215] py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/60 p-12 text-center space-y-4">
          <Layers className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="text-sm text-zinc-400">No matching projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121215] p-6 shadow-sm hover:border-zinc-700 hover:shadow-xl transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="text-lg font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {proj.name}
                  </h3>
                  <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-700/50">
                    {proj.currentUserRole || 'MEMBER'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Team Members List */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {proj.members?.slice(0, 4).map((m) => (
                      <UserAvatar key={m.id} user={m.user} size="sm" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {proj._count?.members || proj.members?.length || 1} members
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  <FolderKanban className="h-3.5 w-3.5" />
                  {proj._count?.tasks ?? 0} Tasks
                </span>

                <div className="flex items-center gap-2">
                  {proj.currentUserRole === 'OWNER' && (
                    <button
                      onClick={() => setDeleteTarget(proj)}
                      title="Delete Project"
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-cyan-600 hover:text-white transition-colors"
                  >
                    <span>Open Board</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">Create Engineering Workspace</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Auth Microservice, Realtime Analytics Engine"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="High level goals, engineering tech stack, or team notes..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Are you sure you want to delete this workspace? All associated Kanban tasks, labels, and comments will be permanently erased."
        confirmText="Delete Workspace"
        isDestructive={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
