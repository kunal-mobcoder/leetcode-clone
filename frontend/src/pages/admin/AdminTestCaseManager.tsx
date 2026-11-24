import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    useAdminProblem,
    useAdminTestCases,
    useCreateTestCase,
    useUpdateTestCase,
    useDeleteTestCase,
    type AdminTestCaseItem,
} from '../../hooks/useAdmin';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    FlaskConical,
    Loader2,
    X,
    Save,
} from 'lucide-react';

export const AdminTestCaseManager: React.FC = () => {
    const { id: problemId } = useParams<{ id: string }>();

    const { data: problem, isLoading: isLoadingProblem } = useAdminProblem(problemId);
    const { data: testCases = [], isLoading: isLoadingTestCases } = useAdminTestCases(problemId);

    const createMutation = useCreateTestCase();
    const updateMutation = useUpdateTestCase();
    const deleteMutation = useDeleteTestCase();

    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestCase, setEditingTestCase] = useState<AdminTestCaseItem | null>(null);

    const [input, setInput] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [isHidden, setIsHidden] = useState(true);
    const [modalError, setModalError] = useState<string | null>(null);

    const openAddModal = () => {
        setEditingTestCase(null);
        setInput('');
        setExpectedOutput('');
        setIsHidden(true);
        setModalError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (tc: AdminTestCaseItem) => {
        setEditingTestCase(tc);
        setInput(tc.input);
        setExpectedOutput(tc.expectedOutput);
        setIsHidden(tc.isHidden);
        setModalError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTestCase(null);
        setModalError(null);
    };

    const handleSaveTestCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!problemId) return;

        setModalError(null);
        const cleanInput = input.trim();
        const cleanOutput = expectedOutput.trim();

        if (!cleanInput || !cleanOutput) {
            setModalError('Input and Expected Output are both required');
            return;
        }

        try {
            if (editingTestCase) {
                await updateMutation.mutateAsync({
                    problemId,
                    testCaseId: editingTestCase._id,
                    data: {
                        input: cleanInput,
                        expectedOutput: cleanOutput,
                        isHidden,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    problemId,
                    data: {
                        input: cleanInput,
                        expectedOutput: cleanOutput,
                        isHidden,
                    },
                });
            }
            closeModal();
        } catch (err: any) {
            console.error('Save testcase error:', err);
            setModalError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Failed to save testcase'
            );
        }
    };

    const handleDeleteTestCase = async (testCaseId: string) => {
        if (!problemId) return;
        if (!window.confirm('Are you sure you want to delete this test case?')) return;

        try {
            await deleteMutation.mutateAsync({ problemId, testCaseId });
        } catch (err) {
            console.error('Failed to delete testcase:', err);
        }
    };

    if (isLoadingProblem || isLoadingTestCases) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] font-mono text-xs text-chai-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-chai-accent" />
                <span>Loading test cases...</span>
            </div>
        );
    }

    const publicCount = testCases.filter((tc) => !tc.isHidden).length;
    const hiddenCount = testCases.filter((tc) => tc.isHidden).length;
    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text pb-24">
            {/* Header Hero */}
            <div className="border-b border-chai-border bg-chai-card/40">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-chai-accent text-xs font-semibold uppercase tracking-wider font-mono">
                                <FlaskConical className="w-3.5 h-3.5" />
                                <span>Test Case Suite</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {problem?.title || 'Problem Test Cases'}
                            </h1>
                            <p className="text-xs text-chai-muted font-mono">
                                Slug: /{problem?.slug} • Total Cases: {testCases.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/admin/problems"
                                className="bg-chai-bg border border-chai-border hover:bg-chai-card-hover text-chai-muted hover:text-chai-text px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Problems</span>
                            </Link>

                            <button
                                onClick={openAddModal}
                                className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Test Case</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-3 gap-4 mt-6 max-w-xl">
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-chai-muted block text-[10px] uppercase font-mono">Total Cases</span>
                            <span className="text-lg font-bold font-mono text-chai-text">{testCases.length}</span>
                        </div>
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-green-400/80 block text-[10px] uppercase font-mono">Public (Sample)</span>
                            <span className="text-lg font-bold font-mono text-green-400">{publicCount}</span>
                        </div>
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-purple-400/80 block text-[10px] uppercase font-mono">Secret (Judge)</span>
                            <span className="text-lg font-bold font-mono text-purple-400">{hiddenCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Case List */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {testCases.length === 0 ? (
                    <div className="text-chai-muted text-xs py-16 text-center border border-dashed border-chai-border rounded-2xl p-8 space-y-3 bg-chai-card">
                        <FlaskConical className="w-8 h-8 mx-auto text-chai-muted/40" />
                        <div>No test cases registered for this problem yet.</div>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-1.5 text-chai-accent hover:underline font-medium text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add the first test case</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testCases.map((tc, idx) => (
                            <div
                                key={tc._id}
                                className="bg-chai-card border border-chai-border rounded-2xl p-5 space-y-3 text-xs transition hover:border-chai-border-subtle"
                            >
                                <div className="flex items-center justify-between border-b border-chai-border/60 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-chai-accent text-sm">
                                            Case #{idx + 1}
                                        </span>

                                        {tc.isHidden ? (
                                            <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/40 border border-purple-800 px-2 py-0.5 rounded-full font-semibold">
                                                <EyeOff className="w-3 h-3" />
                                                <span>Secret Judge Test</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-950/40 border border-green-800 px-2 py-0.5 rounded-full font-semibold">
                                                <Eye className="w-3 h-3" />
                                                <span>Public Sample Test</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(tc)}
                                            className="p-1.5 text-chai-muted hover:text-chai-text hover:bg-chai-bg rounded-lg border border-transparent hover:border-chai-border transition"
                                            title="Edit Test Case"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTestCase(tc._id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-1.5 text-chai-muted hover:text-red-400 hover:bg-chai-bg rounded-lg border border-transparent hover:border-red-950 transition"
                                            title="Delete Test Case"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-chai-muted uppercase font-mono block mb-1">
                                            Input (stdin)
                                        </span>
                                        <pre className="bg-chai-bg border border-chai-border rounded-xl p-3 text-chai-text font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                                            {tc.input}
                                        </pre>
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-chai-muted uppercase font-mono block mb-1">
                                            Expected Output
                                        </span>
                                        <pre className="bg-chai-bg border border-chai-border rounded-xl p-3 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                                            {tc.expectedOutput}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Test Case Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-xs">
                    <div className="bg-chai-card border border-chai-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-chai-border bg-chai-bg">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="w-4 h-4 text-chai-accent" />
                                <span className="font-bold text-sm">
                                    {editingTestCase ? 'Edit Test Case' : 'Add New Test Case'}
                                </span>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-chai-muted hover:text-chai-text p-1 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTestCase} className="p-6 space-y-4 text-xs">
                            {modalError && (
                                <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-lg">
                                    {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-chai-muted font-medium mb-1.5 font-mono">
                                    Input (passed to stdin / function args) *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder='[2,7,11,15]\n9'
                                    className="w-full bg-chai-bg border border-chai-border rounded-xl p-3 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-chai-muted font-medium mb-1.5 font-mono">
                                    Expected Output *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={expectedOutput}
                                    onChange={(e) => setExpectedOutput(e.target.value)}
                                    placeholder='[0,1]'
                                    className="w-full bg-chai-bg border border-chai-border rounded-xl p-3 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                />
                            </div>

                            {/* Is Hidden Checkbox / Toggle */}
                            <div className="flex items-start gap-3 bg-chai-bg p-3.5 rounded-xl border border-chai-border">
                                <input
                                    type="checkbox"
                                    id="isHidden"
                                    checked={isHidden}
                                    onChange={(e) => setIsHidden(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded text-chai-accent focus:ring-0 border-chai-border bg-chai-card cursor-pointer"
                                />
                                <label htmlFor="isHidden" className="cursor-pointer space-y-0.5">
                                    <span className="font-semibold text-chai-text block">
                                        Secret Judge Test Case
                                    </span>
                                    <span className="text-[11px] text-chai-muted block leading-relaxed">
                                        Hidden from the user's workspace sample runs. Only evaluated during full submission to prevent hardcoded solutions.
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-chai-border">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-chai-muted hover:text-chai-text transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{editingTestCase ? 'Save Changes' : 'Create Test Case'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
