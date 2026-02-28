import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    PlusCircle,
    Search,
    Trash2,
    Loader2,
    Sparkles,
    HelpCircle,
    BookOpen,
    Target
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ViewAllQuestions = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) {
            fetchMyQuestions()
        }
    }, [user])

    const fetchMyQuestions = async () => {
        try {
            // Fetch questions from exams created by this teacher
            const { data, error } = await supabase
                .from('questions')
                .select(`
                    *,
                    exams!inner (
                        title,
                        created_by
                    )
                `)
                .eq('exams.created_by', user.id)

            if (error) throw error
            setQuestions(data || [])
        } catch (error) {
            console.error('Error fetching questions:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return

        try {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', id)

            if (error) throw error
            setQuestions(questions.filter(q => q.id !== id))
        } catch (error) {
            console.error('Error deleting question:', error.message)
            alert('Failed to delete question.')
        }
    }

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.exams.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col">
            <header className="bg-white dark:bg-gray-900 border-b border-orange-100 px-8 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/teacher/manage-questions" className="p-2 hover:bg-orange-50 rounded-full transition-colors font-bold">
                            <ChevronLeft className="h-6 w-6 text-amber-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Question Repository</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Browse and manage all your assessment questions</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                            <input
                                type="text"
                                placeholder="Search questions or courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-amber-50/20 border border-orange-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/teacher/create-question')}
                            className="px-6 py-3 bg-[#1A1612] text-white font-black rounded-2xl shadow-lg shadow-orange-950/20 hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            <PlusCircle className="h-5 w-5 text-amber-500" />
                            New Question
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 font-sans">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Scanning question bank...</p>
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredQuestions.map((q) => (
                            <div key={q.id} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100 flex items-center gap-2">
                                                <BookOpen className="h-3 w-3" />
                                                {q.exams.title}
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 flex items-center gap-2">
                                                <Target className="h-3 w-3" />
                                                {q.marks} Points
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 leading-tight group-hover:text-amber-600 transition-colors">
                                            {q.text}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {q.options.map((opt, idx) => {
                                                const label = String.fromCharCode(65 + idx)
                                                const isCorrect = opt === q.correct_option
                                                return (
                                                    <div key={idx} className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-3 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300'}`}>
                                                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                            {label}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3">
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete Question"
                                        >
                                            <Trash2 className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-200">
                            <Sparkles className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No questions found</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Your question bank is empty. Start building your repository!</p>
                        <button
                            onClick={() => navigate('/teacher/create-question')}
                            className="px-8 py-3 bg-[#1A1612] text-white font-black rounded-2xl shadow-lg shadow-orange-950/20 hover:bg-black transition-all"
                        >
                            Create Your First Question
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ViewAllQuestions
