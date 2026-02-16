import {
    PlusCircle,
    ChevronLeft,
    BookOpen,
    ArrowRight,
    Save,
    Trash2,
    HelpCircle,
    FileText,
    Target,
    Layout,
    CheckCircle2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const CreateQuestion = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [step, setStep] = useState('setup') // 'setup' or 'construction'
    const [questionCount, setQuestionCount] = useState(1)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

    useEffect(() => {
        if (user) {
            fetchCourses()
        }
    }, [user])

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('id, title')
                .eq('created_by', user.id)

            if (error) throw error
            setCourses(data || [])
        } catch (error) {
            console.error('Error fetching courses:', error.message)
        }
    }

    const startConstruction = () => {
        if (!selectedCourse) {
            alert('Please select a course first.')
            return
        }
        const count = parseInt(questionCount)
        if (isNaN(count) || count < 1 || count > 50) {
            alert('Please enter a valid number of questions (1-50).')
            return
        }

        const initialQuestions = Array.from({ length: count }, (_, i) => ({
            id: i,
            text: '',
            marks: 1,
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: ''
        }))
        setQuestions(initialQuestions)
        setStep('construction')
    }

    const handleQuestionUpdate = (index, field, value) => {
        const updatedQuestions = [...questions]
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
        setQuestions(updatedQuestions)
    }

    const handleOptionUpdate = (qIndex, opt, value) => {
        const updatedQuestions = [...questions]
        updatedQuestions[qIndex].options = { ...updatedQuestions[qIndex].options, [opt]: value }
        setQuestions(updatedQuestions)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        const isValid = questions.every(q =>
            q.text.trim() !== '' &&
            q.correctAnswer !== '' &&
            Object.values(q.options).every(opt => opt.trim() !== '')
        )

        if (!isValid) {
            alert('Please fill in all fields and select correct answers for all questions.')
            return
        }

        setLoading(true)
        try {
            const bulkData = questions.map(q => ({
                exam_id: selectedCourse,
                text: q.text,
                options: [q.options.A, q.options.B, q.options.C, q.options.D],
                correct_option: q.options[q.correctAnswer],
                marks: parseInt(q.marks) || 1
            }))

            const { error } = await supabase
                .from('questions')
                .insert(bulkData)

            if (error) throw error
            alert(`${questions.length} questions created successfully!`)
            navigate('/teacher/manage-questions')
        } catch (error) {
            console.error('Error saving questions:', error.message)
            alert('Failed to save questions. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-orange-100 p-10 text-center animate-slide-up">
                    <div className="h-20 w-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-amber-500/20">
                        <PlusCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Question Batcher</h1>
                    <p className="text-gray-400 font-medium mb-10">How many questions would you like to assign today?</p>

                    <div className="space-y-6 text-left">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 block ml-2">Target Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-6 py-4 bg-amber-50/50 border-2 border-orange-50 rounded-2xl font-bold focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                            >
                                <option value="" disabled>Select a course...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 block ml-2">Question Count</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(e.target.value)}
                                className="w-full px-6 py-4 bg-amber-50/50 border-2 border-orange-50 rounded-2xl text-4xl font-black text-center focus:outline-none focus:border-amber-500 transition-all"
                            />
                            <p className="text-[10px] text-center text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">Recommended: 10 - 20 slots per batch</p>
                        </div>

                        <button
                            onClick={startConstruction}
                            className="w-full py-5 bg-[#1A1612] text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 group"
                        >
                            Start Construction
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex">
            {/* Index Sidebar */}
            <aside className="w-24 bg-[#1A1612] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl overflow-y-auto no-scrollbar">
                <button
                    onClick={() => setStep('setup')}
                    className="p-3 bg-white/5 rounded-2xl text-amber-500 hover:text-white transition-all mb-10"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="flex flex-col gap-4 w-full px-4">
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveQuestionIndex(i)}
                            className={`h-12 w-12 rounded-2xl font-black transition-all flex items-center justify-center text-xs shrink-0 ${activeQuestionIndex === i
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110'
                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {(i + 1).toString().padStart(2, '0')}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Construction Area */}
            <main className="flex-1 p-12 max-w-6xl mx-auto w-full">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2 font-black text-amber-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                            Question {activeQuestionIndex + 1} of {questions.length}
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bulk Construction</h1>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-10 py-5 bg-[#1A1612] text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 text-amber-500" />}
                        {loading ? 'Finalizing...' : 'Save All Questions'}
                    </button>
                </header>

                <div className="space-y-12 animate-fade-in" key={activeQuestionIndex}>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${((activeQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    {/* Question Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 block">Question Text</label>
                            <textarea
                                value={questions[activeQuestionIndex].text}
                                onChange={(e) => handleQuestionUpdate(activeQuestionIndex, 'text', e.target.value)}
                                placeholder="State your question clearly here..."
                                className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-[32px] text-xl font-black text-gray-900 min-h-[220px] transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="bg-[#1A1612] p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full"></div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 block">Marks Allotted</label>
                            <div className="h-full flex flex-col justify-center items-center gap-4">
                                <input
                                    type="number"
                                    value={questions[activeQuestionIndex].marks}
                                    onChange={(e) => handleQuestionUpdate(activeQuestionIndex, 'marks', e.target.value)}
                                    className="bg-transparent text-8xl font-black text-white text-center w-full focus:outline-none"
                                />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Points</span>
                                <div className="flex gap-4 mt-4">
                                    {[1, 2, 5].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleQuestionUpdate(activeQuestionIndex, 'marks', v)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                                        >
                                            +{v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options Grid */}
                    <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-10 block text-center">Configure Multiple Choices</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {['A', 'B', 'C', 'D'].map((opt) => (
                                <div key={opt} className="relative group/field">
                                    <div className={`absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center font-black text-xl transition-all rounded-l-[24px] ${questions[activeQuestionIndex].correctAnswer === opt ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-300'
                                        }`}>
                                        {opt}
                                    </div>
                                    <input
                                        type="text"
                                        value={questions[activeQuestionIndex].options[opt]}
                                        onChange={(e) => handleOptionUpdate(activeQuestionIndex, opt, e.target.value)}
                                        placeholder={`Value for choice ${opt}`}
                                        className="w-full pl-24 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-[24px] text-gray-900 font-bold transition-all outline-none"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Dedicated Selector below choices */}
                        <div className="pt-10 border-t border-gray-100">
                            <label className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 block italic">
                                SELECT THE CORRECT ANSWER TO ACTIVATE AUTOMATIC SCORING
                            </label>

                            <div className="flex justify-center gap-6 sm:gap-12">
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleQuestionUpdate(activeQuestionIndex, 'correctAnswer', opt)}
                                        className={`
                                            h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 border-2
                                            ${questions[activeQuestionIndex].correctAnswer === opt
                                                ? 'bg-amber-600 border-amber-500 text-white shadow-xl shadow-orange-500/20 translate-y--2 scale-110'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200 hover:text-amber-600'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl font-black">{opt}</span>
                                        {questions[activeQuestionIndex].correctAnswer === opt && (
                                            <CheckCircle2 className="h-4 w-4 mt-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between gap-6">
                            <button
                                type="button"
                                onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                                disabled={activeQuestionIndex === 0}
                                className="px-8 py-4 bg-gray-100 border border-gray-200 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-30"
                            >
                                Previous
                            </button>

                            {activeQuestionIndex < questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                                    className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    Next Question
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 text-amber-600 font-black uppercase text-[10px]">
                                    Complete! <CheckCircle2 className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

const Loader2 = ({ className }) => <span className={`border-2 border-amber-500 border-t-transparent rounded-full ${className}`}></span>

export default CreateQuestion
