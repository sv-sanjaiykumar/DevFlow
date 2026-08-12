import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, aiApi } from '../services/apiServices';
import { Project, AIGeneratedTask, TaskPriority, Task } from '../types';
import { PriorityBadge } from '../components/Badges';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  ListTodo,
  Layers,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { toast } from 'sonner';

export const AIAssistantPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generated Result state
  const [aiResult, setAiResult] = useState<AIGeneratedTask | null>(null);

  // Editable Form fields for confirmation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Created Task result link
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectApi.getProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        toast.error('Failed to load projects');
      }
    };
    loadProjects();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedProjectId) {
      toast.error('Please select a project and enter a prompt');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setAiResult(null);
    setCreatedTask(null);

    try {
      const result = await aiApi.generateTask(prompt, selectedProjectId);
      setAiResult(result);
      setTitle(result.title);
      setDescription(result.description);
      setPriority(result.priority);
      setSuggestedLabels(result.suggestedLabels);
      toast.success('AI task breakdown generated!');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to generate task. Please try rephrasing prompt.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmTask = async () => {
    if (!selectedProjectId || !title.trim()) return;

    setIsConfirming(true);
    try {
      const task = await aiApi.confirmTask({
        projectId: selectedProjectId,
        title,
        description,
        priority,
        suggestedLabels,
      });

      setCreatedTask(task);
      toast.success(`Task "${task.title}" created on Kanban board!`);
    } catch (err: any) {
      toast.error('Failed to confirm task creation');
    } finally {
      setIsConfirming(false);
    }
  };

  const presetPrompts = [
    'The login API returns 401 even when the password is correct after token refresh',
    'Add drag and drop reordering persistence to the frontend Kanban board',
    'Database queries on task status are running slowly during high concurrency',
    'Implement user profile avatar upload with image size validation',
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-zinc-800/80 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">AI Task & Spec Generator</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Transform unstructured developer bug reports, crash stack traces, or feature ideas into actionable Kanban tasks.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121215] p-6 shadow-xl space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Target Project Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Target Project Workspace
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Describe Problem, Requirement, or Log Output
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. The login endpoint returns 401 unauthorized when two requests fire at the exact same millisecond..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Preset Prompts Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Example Prompts:</span>
            <div className="flex flex-wrap gap-2">
              {presetPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(preset)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors text-left"
                >
                  "{preset.substring(0, 45)}..."
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing Task Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Structured Spec</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state with retry */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Interactive AI Result Preview Card */}
      {aiResult && (
        <div className="rounded-2xl border border-cyan-500/30 bg-[#121215] p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
              <CheckCircle2 className="h-5 w-5" />
              <span>AI Spec Generated — Preview & Edit</span>
            </div>
            <PriorityBadge priority={priority} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                  Suggested Labels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-mono text-cyan-300"
                    >
                      #{lbl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis Insight */}
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              {/* Possible Causes */}
              {aiResult.possibleCauses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4" /> Technical Considerations
                  </h4>
                  <ul className="space-y-1">
                    {aiResult.possibleCauses.map((cause, idx) => (
                      <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Next Steps */}
              {aiResult.nextSteps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" /> Recommended Implementation Steps
                  </h4>
                  <ul className="space-y-1">
                    {aiResult.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            {createdTask ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Created in Backlog
                </span>
                <button
                  onClick={() => navigate(`/projects/${selectedProjectId}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <FolderKanban className="h-4 w-4" /> View on Kanban Board
                </button>
              </div>
            ) : (
              <div className="flex justify-end w-full">
                <button
                  onClick={handleConfirmTask}
                  disabled={isConfirming}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
                >
                  {isConfirming ? (
                    'Writing to Database...'
                  ) : (
                    <>
                      <span>Confirm & Create Kanban Task</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
