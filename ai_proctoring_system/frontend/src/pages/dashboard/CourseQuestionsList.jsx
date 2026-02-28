import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    ChevronLeft,
    Trash2,
    Plus,
    Database,
    CheckCircle2,
    XCircle,
    Zap,
    Hash
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const CourseQuestionsList = () => {
    const { courseId } = useParams()
    const [course, setCourse] = useState(null)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState(null)

    useEffect(() => {
        fetchData()

        // Realtime subscription — auto-updates the list without refresh
        const channel = supabase
            .channel(`questions-realtime-${courseId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'questions', filter: `exam_id=eq.${courseId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setQuestions(prev => {
                            if (prev.find(q => q.id === payload.new.id)) return prev
                            return [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        })
                    } else if (payload.eventType === 'DELETE') {
                        setQuestions(prev => prev.filter(q => q.id !== payload.old.id))
                    } else if (payload.eventType === 'UPDATE') {
                        setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q))
                    }
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [courseId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: courseData } = await supabase
                .from('exams').select('*').eq('id', courseId).single()
            setCourse(courseData)

            // Fetch questions — NO ordering to avoid errors if created_at column absent
            const { data: qData, error } = await supabase
                .from('questions')
                .select('*')
                .eq('exam_id', courseId)

            if (error) {
                console.error('Error fetching questions:', error)
                setFetchError(error.message)
            } else {
                setQuestions(qData || [])
                setFetchError(null)
            }
        } catch (error) {
            console.error('Error in fetchData:', error)
            setFetchError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteQuestion = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return
        try {
            const { error } = await supabase.from('questions').delete().eq('id', id)
            if (error) throw error
            // Realtime will auto-update, but manual update as fallback
            setQuestions(questions.filter(q => q.id !== id))
        } catch (error) {
            alert('Error deleting question: ' + error.message)
        }
    }

    // Helper: normalize whatever options shape is stored
    const getOptions = (q) => {
        if (Array.isArray(q.options)) return q.options
        if (q.options && typeof q.options === 'object') {
            return [q.options[1], q.options[2], q.options[3], q.options[4]].filter(Boolean)
        }
        return []
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/question-management" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1 font-black text-purple-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-6 bg-purple-600 rounded-full"></span>
                            Question Bank
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {course?.title || 'Course'} Questions
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live Sync Active
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                &bull; {questions.length} Question{questions.length !== 1 ? 's' : ''} in Bank
                            </span>
                        </div>
                    </div>
                </div>
                <Link
                    to="/admin/create-question"
                    className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2 self-start"
                >
                    <Plus className="h-5 w-5" />
                    Add More Questions
                </Link>
            </header>

            {/* Stats Bar */}
            {!loading && questions.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Questions</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{questions.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">With Answers</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {questions.filter(q => q.correct_option).length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[140px]">{course?.title}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Question Bank...</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                        <Database className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white mb-2">No Questions Yet</p>
                        <p className="text-gray-400 font-medium mb-8">This question bank is empty. Add questions to get started.</p>
                        <Link
                            to="/admin/create-question"
                            className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 inline-flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Add First Question
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, idx) => {
                        const opts = getOptions(q)
                        return (
                            <div
                                key={q.id}
                                className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                {/* Question Header */}
                                <div className="p-8 pb-6 flex items-start justify-between gap-6">
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                                            <Hash className="h-4 w-4 inline" />{idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-black text-gray-900 dark:text-white leading-snug">
                                                {q.question_text || q.text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {q.marks || 5} Marks
                                                </span>
                                                {q.correct_option && (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Answer Set
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteQuestion(q.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shrink-0"
                                        title="Delete Question"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="mx-8 h-px bg-gray-50 dark:bg-gray-800"></div>

                                {/* Options Grid */}
                                <div className="p-8 pt-6">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Answer Choices</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {opts.map((opt, i) => {
                                            const isCorrect = opt === q.correct_option
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all ${isCorrect
                                                        ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-600'
                                                        : 'bg-gray-50 dark:bg-gray-950 border-transparent'
                                                        }`}
                                                >
                                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isCorrect
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                                                        }`}>
                                                        {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : OPTION_LABELS[i]}
                                                    </div>
                                                    <span className={`font-bold text-sm ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'
                                                        }`}>
                                                        {opt}
                                                    </span>
                                                    {isCorrect && (
                                                        <span className="ml-auto text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-lg">
                                                            Correct
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* No options fallback */}
                                    {opts.length === 0 && (
                                        <div className="flex items-center gap-3 p-5 rounded-[24px] bg-orange-50 border-2 border-orange-100">
                                            <XCircle className="h-5 w-5 text-orange-400 shrink-0" />
                                            <p className="text-sm font-bold text-orange-600">Options not yet configured for this question.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Correct Answer Summary Banner */}
                                {q.correct_option && (
                                    <div className="mx-8 mb-8 p-5 rounded-[24px] bg-green-600 text-white flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-6 w-6 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Correct Answer</p>
                                                <p className="font-black text-base">{q.correct_option}</p>
                                            </div>
                                        </div>
                                        <span className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">
                                            Key
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CourseQuestionsList
