import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    PlusCircle,
    Book,
    CheckCircle2,
    Save,
    FileText,
    Target,
    HelpCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const CreateQuestion = () => {
    const navigate = useNavigate()
    const PERSISTENCE_KEY = 'bulk_create_question_form_state'

    // Helper to get initial state from localStorage
    const getInitialState = () => {
        const persisted = localStorage.getItem(PERSISTENCE_KEY)
        if (persisted) {
            try {
                return JSON.parse(persisted)
            } catch (e) {
                console.error('Error parsing persisted state', e)
            }
        }
        return {}
    }

    const initialState = getInitialState()

    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(initialState.selectedCourse || '')
    const [questions, setQuestions] = useState(initialState.questions || [])
    const [loading, setLoading] = useState(false)
    const [targetCount, setTargetCount] = useState(0)

    useEffect(() => {
        fetchCourses()
    }, [])

    // Sync state to localStorage on any change
    useEffect(() => {
        const stateToPersist = {
            selectedCourse,
            questions
        }
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(stateToPersist))
    }, [selectedCourse, questions])

    // Update questions array when course changes or count is detected
    useEffect(() => {
        if (selectedCourse) {
            const course = courses.find(c => c.id === selectedCourse)
            if (course && course.description) {
                const match = course.description.match(/Targeted for (\d+) questions/)
                const count = match ? parseInt(match[1]) : 1
                setTargetCount(count)

                // Only reset/initialize if the current questions array length doesn't match or is empty
                if (questions.length !== count) {
                    // Try to preserve existing data if switching back to a course with same count (unlikely but safe)
                    // Here we just initialize a fresh array if it's empty or mismatch
                    const newQuestions = Array.from({ length: count }, (_, i) => ({
                        id: Date.now() + i,
                        text: '',
                        marks: 5,
                        options: { 1: '', 2: '', 3: '', 4: '' },
                        correctAnswer: null
                    }))
                    setQuestions(newQuestions)
                }
            }
        }
    }, [selectedCourse, courses])

    const fetchCourses = async () => {
        const { data } = await supabase.from('exams').select('id, title, description')
        setCourses(data || [])
    }

    const handleFieldChange = (index, field, value) => {
        const updatedQuestions = [...questions]
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
        setQuestions(updatedQuestions)
    }

    const handleOptionChange = (qIndex, optNum, val) => {
        const updatedQuestions = [...questions]
        updatedQuestions[qIndex].options = { ...updatedQuestions[qIndex].options, [optNum]: val }
        setQuestions(updatedQuestions)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        const isValid = questions.every(q =>
            q.text.trim() &&
            q.correctAnswer &&
            Object.values(q.options).every(opt => opt.trim())
        )

        if (!selectedCourse || !isValid) {
            alert('Please complete all questions and select a correct answer for each.')
            return
        }

        setLoading(true)
        try {
            const payload = questions.map(q => ({
                exam_id: selectedCourse,
                text: q.text,
                options: [q.options[1], q.options[2], q.options[3], q.options[4]],
                correct_option: q.options[q.correctAnswer],
                marks: parseInt(q.marks)
            }))

            const { error } = await supabase.from('questions').insert(payload)

            if (error) throw error

            // Clear persistence on success
            localStorage.removeItem(PERSISTENCE_KEY)

            alert(`${questions.length} questions added successfully!`)
            navigate('/admin/question-management')
        } catch (error) {
            alert('Error saving questions: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex student-theme">
            {/* Sidebar */}
            <div className="w-20 bg-[#111827] flex flex-col items-center py-10 gap-8 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/question-management" className="p-3 bg-white/5 rounded-2xl text-orange-500 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            <main className="flex-1 p-8 lg:p-12 max-w-5xl mx-auto overflow-y-auto">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full mb-4 font-black shadow-lg shadow-purple-500/20">
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-widest leading-none">Bulk Injection Mode</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Bulk Question Entry</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 italic">Automatically detected: {targetCount} required questions for this course</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Course Selection */}
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1 mb-4 block underline decoration-indigo-200 underline-offset-4">Course Context</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                {courses.map(course => (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourse(course.id)}
                                        className={`p-6 rounded-[24px] border-2 transition-all text-left ${selectedCourse === course.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                                            : 'bg-gray-50 dark:bg-gray-950 border-transparent text-gray-600 dark:text-gray-300 hover:border-indigo-100 hover:bg-white'
                                            }`}
                                    >
                                        <Book className={`h-6 w-6 mb-3 ${selectedCourse === course.id ? 'text-white' : 'text-indigo-400'}`} />
                                        <p className="font-extrabold text-sm leading-tight uppercase">{course.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sequential Question Blocks */}
                    {questions.map((q, index) => (
                        <div key={q.id} className="space-y-8 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border-l-8 border-l-purple-600 border border-gray-100 dark:border-gray-800 shadow-2xl">
                                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-2xl shadow-inner">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight text-lowercase">Question Node</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry Identifier: {q.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 px-6 py-3 rounded-2xl border border-gray-100">
                                        <Target className="h-4 w-4 text-orange-500" />
                                        <input
                                            type="number"
                                            value={q.marks}
                                            onChange={(e) => handleFieldChange(index, 'marks', e.target.value)}
                                            className="w-12 bg-transparent text-center font-black text-gray-900 dark:text-white focus:outline-none"
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">pts</span>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {/* Statement */}
                                    <div className="relative group">
                                        <textarea
                                            required
                                            value={q.text}
                                            onChange={(e) => handleFieldChange(index, 'text', e.target.value)}
                                            placeholder={`Type question #${index + 1} here...`}
                                            className="w-full p-8 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-[32px] text-lg font-black text-gray-900 dark:text-white transition-all outline-none resize-none min-h-[140px] shadow-inner placeholder:italic placeholder:font-normal"
                                        />
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <HelpCircle className="h-5 w-5 text-purple-200" />
                                        </div>
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                        {[1, 2, 3, 4].map(num => (
                                            <div key={num} className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    value={q.options[num]}
                                                    onChange={(e) => handleOptionChange(index, num, e.target.value)}
                                                    placeholder={`Option ${num} value`}
                                                    className={`w-full pl-12 pr-6 py-5 bg-gray-50 dark:bg-gray-950 border-2 rounded-[24px] font-bold text-gray-900 dark:text-white transition-all shadow-inner border-transparent focus:bg-white ${q.correctAnswer === num ? 'border-green-500/30' : 'focus:border-indigo-400'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldChange(index, 'correctAnswer', num)}
                                                    className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full transition-all border-2 flex items-center justify-center ${q.correctAnswer === num
                                                            ? 'bg-green-500 border-green-500 scale-110'
                                                            : 'border-gray-300 hover:border-indigo-400 bg-white dark:bg-gray-800'
                                                        }`}
                                                >
                                                    {q.correctAnswer === num && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explicit Correct Answer Display */}
                                    <div className={`mt-8 p-6 rounded-[24px] border-2 transition-all flex items-center justify-between ${q.correctAnswer
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-gray-50 border-dashed border-gray-200 text-gray-400'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${q.correctAnswer ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none mb-1">Current Validation Status</span>
                                                <p className="font-bold text-sm">
                                                    {q.correctAnswer
                                                        ? `CORRECT ANSWER: ${q.options[q.correctAnswer] || `Option ${q.correctAnswer} (Empty)`}`
                                                        : 'No correct answer selected yet'}
                                                </p>
                                            </div>
                                        </div>
                                        {q.correctAnswer && (
                                            <span className="px-4 py-1.5 bg-green-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Bulk Actions */}
                    {questions.length > 0 && (
                        <div className="pt-10 sticky bottom-8 z-50 animate-bounce-slow">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-10 bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-950 text-white font-black rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.01] hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Syncing Assessment Node...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-8 w-8 text-green-400 group-hover:rotate-12 transition-transform" />
                                        <div className="text-left">
                                            <span className="block text-2xl tracking-tighter uppercase">Commit All Questions</span>
                                            <span className="block text-[10px] opacity-70 font-bold uppercase tracking-widest leading-none">Total: {questions.length} Nodes Directed to Supabase</span>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    )
}

export default CreateQuestion
