import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAdminProblem, useCreateProblem, useUpdateProblem } from '../../hooks/useAdmin';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Code2,
    Sparkles,
    Loader2,
} from 'lucide-react';

export const AdminProblemEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const { data: problem, isLoading: isLoadingProblem } = useAdminProblem(id);
    const createMutation = useCreateProblem();
    const updateMutation = useUpdateProblem();

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [entryFunctionName, setEntryFunctionName] = useState('');
    const [description, setDescription] = useState('');

    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    const [constraints, setConstraints] = useState<string[]>(['']);
    const [hints, setHints] = useState<string[]>(['']);

    const [examples, setExamples] = useState<Array<{ input: string; output: string; explanation?: string }>>([
        { input: '', output: '', explanation: '' },
    ]);

    const [activeLang, setActiveLang] = useState<'javascript' | 'python'>('javascript');
    const [starterCode, setStarterCode] = useState<Record<string, string>>({
        javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write your code here\n}`,
        python: `class Solution:\n    def solution(self, input):\n        pass`,
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Prepopulate form if in edit mode
    useEffect(() => {
        if (problem) {
            setTitle(problem.title || '');
            setSlug(problem.slug || '');
            setDifficulty(problem.difficulty || 'easy');
            setEntryFunctionName(problem.entryFunctionName || '');
            setDescription(problem.description || '');
            setTags(problem.tags || []);
            setConstraints(problem.constraints && problem.constraints.length > 0 ? problem.constraints : ['']);
            setHints(problem.hints && problem.hints.length > 0 ? problem.hints : ['']);
            setExamples(
                problem.examples && problem.examples.length > 0
                    ? problem.examples
                    : [{ input: '', output: '', explanation: '' }]
            );

            if (problem.starterCode) {
                setStarterCode({
                    javascript: problem.starterCode.javascript || starterCode.javascript,
                    python: problem.starterCode.python || starterCode.python,
                });
            }
        }
    }, [problem]);

    // Auto-generate slug from title
    const handleGenerateSlug = () => {
        const generated = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        setSlug(generated);
    };

    // Tag handlers
    const handleAddTag = () => {
        const trimmed = newTag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    // Constraint handlers
    const handleAddConstraint = () => setConstraints([...constraints, '']);
    const handleConstraintChange = (idx: number, val: string) => {
        const updated = [...constraints];
        updated[idx] = val;
        setConstraints(updated);
    };
    const handleRemoveConstraint = (idx: number) => {
        setConstraints(constraints.filter((_, i) => i !== idx));
    };

    // Hint handlers
    const handleAddHint = () => setHints([...hints, '']);
    const handleHintChange = (idx: number, val: string) => {
        const updated = [...hints];
        updated[idx] = val;
        setHints(updated);
    };
    const handleRemoveHint = (idx: number) => {
        setHints(hints.filter((_, i) => i !== idx));
    };

    // Example handlers
    const handleAddExample = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
    const handleExampleChange = (idx: number, field: 'input' | 'output' | 'explanation', val: string) => {
        const updated = [...examples];
        updated[idx] = { ...updated[idx], [field]: val };
        setExamples(updated);
    };
    const handleRemoveExample = (idx: number) => {
        setExamples(examples.filter((_, i) => i !== idx));
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // Filter empty items
        const cleanConstraints = constraints.map((c) => c.trim()).filter(Boolean);
        const cleanHints = hints.map((h) => h.trim()).filter(Boolean);
        const cleanExamples = examples
            .map((ex) => ({
                input: ex.input.trim(),
                output: ex.output.trim(),
                explanation: ex.explanation?.trim() || undefined,
            }))
            .filter((ex) => ex.input && ex.output);

        const payload = {
            title: title.trim(),
            slug: slug.trim(),
            difficulty,
            description: description.trim(),
            entryFunctionName: entryFunctionName.trim() || undefined,
            tags,
            constraints: cleanConstraints,
            hints: cleanHints,
            examples: cleanExamples,
            starterCode,
        };

        try {
            if (isEditMode && id) {
                await updateMutation.mutateAsync({ id, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            navigate('/admin/problems');
        } catch (err: any) {
            console.error('Save problem error:', err);
            setErrorMsg(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Failed to save problem'
            );
        }
    };

    if (isEditMode && isLoadingProblem) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] font-mono text-xs text-chai-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-chai-accent" />
                <span>Loading problem details...</span>
            </div>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text pb-24">
            {/* Top Navigation Bar */}
            <div className="border-b border-chai-border bg-chai-card/50 sticky top-[53px] z-40 backdrop-blur-xs">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/problems"
                            className="p-1.5 rounded-lg border border-chai-border bg-chai-bg hover:bg-chai-card-hover text-chai-muted hover:text-chai-text transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base font-bold tracking-tight">
                                {isEditMode ? `Edit Problem: ${title || '...'}` : 'Create New Problem'}
                            </h1>
                            <span className="text-[11px] text-chai-muted font-mono">
                                {isEditMode ? `ID: ${id}` : 'Draft Mode'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/problems"
                            className="px-3.5 py-1.5 text-xs text-chai-muted hover:text-chai-text transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            <span>{isEditMode ? 'Save Changes' : 'Create Problem'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8 space-y-8 text-xs">
                {errorMsg && (
                    <div className="p-4 bg-red-950/30 border border-red-800 text-red-400 rounded-xl text-xs">
                        <strong>Error saving problem:</strong> {errorMsg}
                    </div>
                )}

                {/* 1. Basic Information */}
                <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-5">
                    <h2 className="text-sm font-bold text-chai-text tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-chai-accent" />
                        <span>Basic Information</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div>
                            <label className="block text-chai-muted font-medium mb-1.5">Problem Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Merge Two Sorted Lists"
                                className="w-full bg-chai-bg border border-chai-border rounded-xl px-3 py-2 text-chai-text placeholder:text-chai-muted focus:outline-none focus:border-chai-accent font-sans"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-chai-muted font-medium">URL Slug *</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateSlug}
                                    className="text-[10px] text-chai-accent hover:underline font-mono"
                                >
                                    Auto-generate from Title
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g. merge-two-sorted-lists"
                                className="w-full bg-chai-bg border border-chai-border rounded-xl px-3 py-2 text-chai-text placeholder:text-chai-muted focus:outline-none focus:border-chai-accent font-mono text-[11px]"
                            />
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-chai-muted font-medium mb-1.5">Difficulty *</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value as any)}
                                className="w-full bg-chai-bg border border-chai-border rounded-xl px-3 py-2 text-chai-text focus:outline-none focus:border-chai-accent capitalize font-mono text-xs"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Entry Function Name */}
                        <div>
                            <label className="block text-chai-muted font-medium mb-1.5">
                                Entry Function Name <span className="text-chai-muted/60">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={entryFunctionName}
                                onChange={(e) => setEntryFunctionName(e.target.value)}
                                placeholder="e.g. mergeTwoLists (used by test harness)"
                                className="w-full bg-chai-bg border border-chai-border rounded-xl px-3 py-2 text-chai-text placeholder:text-chai-muted focus:outline-none focus:border-chai-accent font-mono text-[11px]"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-chai-muted font-medium mb-1.5">Tags & Topics</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-chai-bg border border-chai-border text-chai-text px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-chai-muted hover:text-red-400"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2 max-w-sm">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="Add tag (e.g. dynamic-programming)"
                                className="bg-chai-bg border border-chai-border rounded-xl px-3 py-1.5 text-chai-text placeholder:text-chai-muted focus:outline-none focus:border-chai-accent font-mono text-xs flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="bg-chai-bg border border-chai-border hover:bg-chai-card-hover px-3 py-1.5 rounded-xl font-medium transition"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Problem Description */}
                <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-chai-text tracking-tight">
                            Problem Description (Markdown) *
                        </label>
                        <span className="text-[11px] text-chai-muted font-mono">Supports standard markdown</span>
                    </div>

                    <textarea
                        required
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                        className="w-full bg-chai-bg border border-chai-border rounded-xl p-3 text-chai-text placeholder:text-chai-muted focus:outline-none focus:border-chai-accent font-mono text-xs leading-relaxed"
                    />
                </div>

                {/* 3. Examples */}
                <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-chai-text tracking-tight">Examples</h2>
                        <button
                            type="button"
                            onClick={handleAddExample}
                            className="text-xs text-chai-accent hover:underline flex items-center gap-1 font-medium"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Example</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {examples.map((ex, idx) => (
                            <div
                                key={idx}
                                className="border border-chai-border rounded-xl p-4 bg-chai-bg/50 space-y-3 relative group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-chai-accent font-mono text-[11px]">
                                        Example {idx + 1}
                                    </span>
                                    {examples.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExample(idx)}
                                            className="text-chai-muted hover:text-red-400 p-1"
                                            title="Delete Example"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[10px] text-chai-muted uppercase font-mono block mb-1">
                                            Input (stdin)
                                        </span>
                                        <textarea
                                            rows={2}
                                            value={ex.input}
                                            onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                                            placeholder='[2,7,11,15]\n9'
                                            className="w-full bg-chai-bg border border-chai-border rounded-lg p-2 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-chai-muted uppercase font-mono block mb-1">
                                            Expected Output
                                        </span>
                                        <textarea
                                            rows={2}
                                            value={ex.output}
                                            onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                                            placeholder='[0,1]'
                                            className="w-full bg-chai-bg border border-chai-border rounded-lg p-2 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] text-chai-muted uppercase font-mono block mb-1">
                                        Explanation (Optional)
                                    </span>
                                    <input
                                        type="text"
                                        value={ex.explanation || ''}
                                        onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                                        placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                        className="w-full bg-chai-bg border border-chai-border rounded-lg px-2.5 py-1.5 text-chai-text font-sans text-xs focus:outline-none focus:border-chai-accent"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Constraints & Hints Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Constraints */}
                    <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-chai-text tracking-tight">Constraints</h2>
                            <button
                                type="button"
                                onClick={handleAddConstraint}
                                className="text-xs text-chai-accent hover:underline flex items-center gap-1 font-medium"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {constraints.map((c, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={c}
                                        onChange={(e) => handleConstraintChange(idx, e.target.value)}
                                        placeholder="e.g. 2 <= nums.length <= 10^4"
                                        className="flex-1 bg-chai-bg border border-chai-border rounded-xl px-3 py-1.5 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                    />
                                    {constraints.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveConstraint(idx)}
                                            className="text-chai-muted hover:text-red-400 p-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hints */}
                    <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-chai-text tracking-tight">Hints</h2>
                            <button
                                type="button"
                                onClick={handleAddHint}
                                className="text-xs text-chai-accent hover:underline flex items-center gap-1 font-medium"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {hints.map((h, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => handleHintChange(idx, e.target.value)}
                                        placeholder={`Hint ${idx + 1}`}
                                        className="flex-1 bg-chai-bg border border-chai-border rounded-xl px-3 py-1.5 text-chai-text font-sans text-xs focus:outline-none focus:border-chai-accent"
                                    />
                                    {hints.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveHint(idx)}
                                            className="text-chai-muted hover:text-red-400 p-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Starter Code Templates */}
                <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-chai-border pb-3">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-chai-accent" />
                            <h2 className="text-sm font-bold text-chai-text tracking-tight">Starter Code Templates</h2>
                        </div>

                        {/* Language Tab Switcher */}
                        <div className="flex gap-2">
                            {(['javascript', 'python'] as const).map((lang) => (
                                <button
                                    type="button"
                                    key={lang}
                                    onClick={() => setActiveLang(lang)}
                                    className={`px-3 py-1 rounded-lg text-xs capitalize font-mono transition ${
                                        activeLang === lang
                                            ? 'bg-chai-accent text-black font-semibold'
                                            : 'bg-chai-bg border border-chai-border text-chai-muted hover:text-chai-text'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border border-chai-border rounded-xl overflow-hidden bg-[#1e1e1e] h-64">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={activeLang === 'python' ? 'python' : 'javascript'}
                            value={starterCode[activeLang] || ''}
                            onChange={(val) =>
                                setStarterCode({ ...starterCode, [activeLang]: val || '' })
                            }
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                tabSize: 2,
                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                            }}
                        />
                    </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-chai-border">
                    <Link
                        to="/admin/problems"
                        className="px-4 py-2 text-xs text-chai-muted hover:text-chai-text transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-6 py-2 rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEditMode ? 'Update Problem' : 'Create Problem'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
