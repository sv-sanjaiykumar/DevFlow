import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, taskApi } from '../services/apiServices';
import { Project, Task, TaskStatus, TaskPriority, Label, ProjectMember, ProjectRole } from '../types';
import { StatusBadge, PriorityBadge, UserAvatar } from '../components/Badges';
import { TaskDetailModal } from './TaskDetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  Filter,
  Users,
  Sparkles,
  Calendar,
  MessageSquare,
  AlertCircle,
  X,
  UserPlus,
  Trash2,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const KANBAN_COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-zinc-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-500' },
  { id: 'CODE_REVIEW', title: 'Code Review', color: 'border-purple-500' },
  { id: 'TESTING', title: 'Testing', color: 'border-amber-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500' },
];

/* Sortable Task Card Item */
const TaskCardItem: React.FC<{
  task: Task;
  onOpenDetail: (taskId: string) => void;
}> = ({ task, onOpenDetail }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenDetail(task.id)}
      className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#121215] p-3.5 shadow-sm hover:border-zinc-700/80 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing space-y-3"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {isOverdue && (
          <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Overdue
          </span>
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-relaxed">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((lbl) => (
            <span
              key={lbl.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${lbl.color}20`, color: lbl.color }}
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Assignee & Comments */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-zinc-400 text-[11px]">
        <div className="flex items-center gap-1.5">
          <UserAvatar user={task.assignee} size="sm" />
          <span className="truncate max-w-[90px] font-medium text-zinc-300">
            {task.assignee?.fullName?.split(' ')[0] || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-500'}`}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task._count?.comments !== undefined && task._count.comments > 0 && (
            <span className="flex items-center gap-1 text-zinc-400 font-mono">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* Droppable Column Wrapper */
const KanbanColumnDroppable: React.FC<{
  col: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  onOpenCreateModal: (status: TaskStatus) => void;
  onOpenDetail: (taskId: string) => void;
}> = ({ col, tasks, onOpenCreateModal, onOpenDetail }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border ${col.color} bg-[#0c0c0e]/80 p-3.5 space-y-3 min-h-[500px] transition-colors ${
        isOver ? 'bg-zinc-900/60 ring-1 ring-cyan-500/50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">{col.title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 font-mono">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onOpenCreateModal(col.id)}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          title="Add Task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Sortable Tasks List */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
          {tasks.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-500">No tasks in {col.title}</span>
            </div>
          ) : (
            tasks.map((t) => <TaskCardItem key={t.id} task={t} onOpenDetail={onOpenDetail} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterLabel, setFilterLabel] = useState<string>('');

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('BACKLOG');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Create Task Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newAssigneeId, setNewAssigneeId] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newSelectedLabels, setNewSelectedLabels] = useState<string[]>([]);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Invite Member Form fields
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  // Active DnD item
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    if (!id) return;
    try {
      const [projData, taskData] = await Promise.all([
        projectApi.getProject(id),
        taskApi.getTasks({ projectId: id }),
      ]);
      setProject(projData);
      setTasks(taskData);
    } catch (err: any) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterAssignee && t.assigneeId !== filterAssignee) {
        return false;
      }
      if (filterPriority && t.priority !== filterPriority) {
        return false;
      }
      if (filterLabel && !t.labels.some((l) => l.id === filterLabel)) {
        return false;
      }
      return true;
    });
  }, [tasks, search, filterAssignee, filterPriority, filterLabel]);

  // Group tasks by column status
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      IN_PROGRESS: [],
      CODE_REVIEW: [],
      TESTING: [],
      COMPLETED: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  /* Drag & Drop Handlers */
  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceTask = tasks.find((t) => t.id === activeId);
    if (!sourceTask) return;

    // Determine target column and target position
    let targetStatus: TaskStatus;
    let targetIndex = 0;

    // Is over a column droppable directly or another task card?
    const isOverColumn = KANBAN_COLUMNS.some((col) => col.id === overId);

    if (isOverColumn) {
      targetStatus = overId as TaskStatus;
      targetIndex = tasksByColumn[targetStatus].length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetIndex = tasksByColumn[targetStatus].findIndex((t) => t.id === overId);
    }

    // Skip if status and index didn't change
    if (sourceTask.status === targetStatus && sourceTask.position === targetIndex) {
      return;
    }

    // Optimistic UI state update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeId) {
          return { ...t, status: targetStatus, position: targetIndex };
        }
        return t;
      })
    );

    // Persist immediately to PostgreSQL API
    try {
      await taskApi.updateTaskStatus(activeId, targetStatus, targetIndex);
      toast.success(`Task moved to ${targetStatus.replace('_', ' ')}`);
    } catch (err) {
      // Rollback optimistic update on error
      setTasks(previousTasks);
      toast.error('Failed to update task status on backend');
    }
  };

  // Task creation handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !id) return;

    setIsSubmittingTask(true);
    try {
      await taskApi.createTask({
        projectId: id,
        title: newTitle,
        description: newDescription,
        status: createStatus,
        priority: newPriority,
        assigneeId: newAssigneeId || null,
        dueDate: newDueDate || null,
        labelIds: newSelectedLabels,
      });
      toast.success('Task created successfully');
      setIsCreateTaskOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchData();
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Invite member handler
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !id) return;

    setIsInviting(true);
    try {
      await projectApi.addMember(id, inviteUsername, inviteRole);
      toast.success(`Member @${inviteUsername} added to project`);
      setInviteUsername('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    try {
      await projectApi.removeMember(id, memberId);
      toast.success('Member removed');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to remove member');
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors mb-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Workspaces
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">{project.name}</h2>
            <span className="rounded bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/20">
              {project.currentUserRole}
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">{project.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Members Button */}
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121215] px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
          >
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Team ({project.members?.length || 1})</span>
          </button>

          {/* AI Task Generator Link */}
          <button
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Generate</span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={() => {
              setCreateStatus('BACKLOG');
              setIsCreateTaskOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121215] p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1.5 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Assignees</option>
            {project.members?.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.fullName}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Label Filter */}
          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-2.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Labels</option>
            {project.labels?.map((lbl) => (
              <option key={lbl.id} value={lbl.id}>
                {lbl.name}
              </option>
            ))}
          </select>

          {(search || filterAssignee || filterPriority || filterLabel) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterAssignee('');
                setFilterPriority('');
                setFilterLabel('');
              }}
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 5-Column Kanban Drag-and-Drop Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumnDroppable
              key={col.id}
              col={col}
              tasks={tasksByColumn[col.id] || []}
              onOpenCreateModal={(status) => {
                setCreateStatus(status);
                setIsCreateTaskOpen(true);
              }}
              onOpenDetail={(taskId) => setSelectedTaskId(taskId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rounded-xl border border-cyan-500 bg-[#18181b] p-3.5 shadow-2xl space-y-2 opacity-95">
              <PriorityBadge priority={activeTask.priority} />
              <h4 className="text-xs font-bold text-white">{activeTask.title}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal */}
      {selectedTaskId && id && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={id}
          projectMembers={project.members || []}
          projectLabels={project.labels || []}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={fetchData}
        />
      )}

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100">Create Task in {createStatus.replace('_', ' ')}</h3>
              <button onClick={() => setIsCreateTaskOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Task context, stack trace, or AC list..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-cyan-500"
                >
                  {isSubmittingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Management Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Team Members & Access
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInviteMember} className="flex gap-2">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Username or email (e.g. marcus_qa)"
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-2 text-xs text-zinc-200"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isInviting || !inviteUsername.trim()}
                className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 flex items-center gap-1 disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" /> Invite
              </button>
            </form>

            {/* Current Members List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {project.members?.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar user={m.user} size="md" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{m.user.fullName}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">@{m.user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                      {m.role}
                    </span>
                    {m.role !== 'OWNER' && (project.currentUserRole === 'OWNER' || project.currentUserRole === 'ADMIN') && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
