import React, { useState, useEffect } from 'react';
import { taskApi, aiApi } from '../services/apiServices';
import { Task, TaskStatus, TaskPriority, Label, User, AIExplanation } from '../types';
import { StatusBadge, PriorityBadge, UserAvatar } from '../components/Badges';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  X,
  Calendar,
  User as UserIcon,
  Tag,
  MessageSquare,
  Sparkles,
  Trash2,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  taskId: string;
  projectId: string;
  projectMembers: Array<{ user: User }>;
  projectLabels: Label[];
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  projectId,
  projectMembers,
  projectLabels,
  onClose,
  onTaskUpdated,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('BACKLOG');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  // Comments state
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // AI Explanation state
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Delete modal state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      const data = await taskApi.getTask(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status);
      setPriority(data.priority);
      setAssigneeId(data.assigneeId || null);
      setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '');
      setSelectedLabelIds(data.labels.map((l) => l.id));
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleUpdateTaskField = async (updates: Partial<Task> & { labelIds?: string[] }) => {
    try {
      const updated = await taskApi.updateTask(taskId, updates);
      setTask(updated);
      onTaskUpdated();
      toast.success('Task updated');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await taskApi.addComment(taskId, newComment);
      setNewComment('');
      fetchTaskDetails();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskApi.deleteComment(commentId);
      toast.success('Comment deleted');
      fetchTaskDetails();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await taskApi.deleteTask(taskId);
      toast.success('Task deleted');
      onTaskUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleExplainTask = async () => {
    setIsExplaining(true);
    try {
      const result = await aiApi.explainTask({ taskId, title, description });
      setExplanation(result);
      toast.success('AI technical explanation ready');
    } catch (err: any) {
      toast.error('Failed to generate AI explanation');
    } finally {
      setIsExplaining(false);
    }
  };

  if (isLoading || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#121215] p-8 shadow-2xl flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              {task.projectName}
            </span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExplainTask}
              disabled={isExplaining}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              {isExplaining ? 'Analyzing...' : 'Explain with AI'}
            </button>

            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Editing (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inline Title Edit */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleUpdateTaskField({ title })}
                className="w-full rounded-lg border border-transparent hover:border-zinc-800 bg-transparent px-2 py-1 text-xl font-bold text-zinc-100 focus:border-cyan-500 focus:bg-zinc-900 focus:outline-none transition-all"
              />
            </div>

            {/* AI Explanation Accordion Box */}
            {explanation && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span>AI Developer Explanation</span>
                </div>
                <p className="text-xs text-zinc-300 font-medium">{explanation.summary}</p>
                <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/80">
                  {explanation.overview}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Objectives:</p>
                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                    {explanation.keyObjectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Description Edit */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Description & Implementation Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleUpdateTaskField({ description })}
                rows={5}
                placeholder="Add problem statement, stack traces, or technical requirements..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                Comments & Discussion ({task.comments?.length || 0})
              </h4>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment or note..."
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </button>
              </form>

              {/* Comments Timeline */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {task.comments?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No comments yet. Start the conversation!</p>
                ) : (
                  task.comments?.map((c) => (
                    <div key={c.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={c.author} size="sm" />
                          <span className="text-xs font-semibold text-zinc-200">{c.author.fullName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-zinc-500 hover:text-rose-400 text-xs"
                          title="Delete Comment"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 pl-8">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Properties sidebar (1 col) */}
          <div className="space-y-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 h-fit">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
              Task Attributes
            </h4>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] text-zinc-400">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as TaskStatus;
                  setStatus(val);
                  handleUpdateTaskField({ status: val });
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CODE_REVIEW">Code Review</option>
                <option value="TESTING">Testing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] text-zinc-400">Priority</label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as TaskPriority;
                  setPriority(val);
                  handleUpdateTaskField({ priority: val });
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee Picker */}
            <div className="space-y-1">
              <label className="block text-[11px] text-zinc-400">Assignee</label>
              <select
                value={assigneeId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setAssigneeId(val);
                  handleUpdateTaskField({ assigneeId: val });
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.fullName} (@{m.user.username})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <label className="block text-[11px] text-zinc-400">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setDueDate(val);
                  handleUpdateTaskField({ dueDate: val || null });
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Labels Manager */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="block text-[11px] text-zinc-400">Task Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {projectLabels.map((lbl) => {
                  const isSelected = selectedLabelIds.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => {
                        const newIds = isSelected
                          ? selectedLabelIds.filter((id) => id !== lbl.id)
                          : [...selectedLabelIds, lbl.id];
                        setSelectedLabelIds(newIds);
                        handleUpdateTaskField({ labelIds: newIds });
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'ring-2 ring-cyan-500 text-white'
                          : 'opacity-50 hover:opacity-100 text-zinc-400'
                      }`}
                      style={{ backgroundColor: `${lbl.color}25`, color: lbl.color }}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isDestructive={true}
        onConfirm={handleDeleteTask}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
