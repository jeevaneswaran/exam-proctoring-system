import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { SupabaseService } from '../../services/SupabaseService'
import { useAuth } from '../../contexts/AuthContext'
import WebcamProctor from '../../components/exam/WebcamProctor'
import { Timer, AlertTriangle, Sparkles } from 'lucide-react'

const ExamPage = () => {
    const { examId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [exam, setExam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [violationCount, setViolationCount] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({}) // { questionId: selectedOptionText }
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await SupabaseService.getExamDetails(examId)
                if (data) {
                    setExam(data)
                    setTimeLeft((data.duration_minutes || 60) * 60)
                }
            } catch (error) {
                console.error('Error fetching exam:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchExam()
    }, [examId])

    useEffect(() => {
        if (timeLeft <= 0 || loading) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, loading])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleAnswerSelect = (questionId, optionText) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionText
        }))
    }

    const handleSubmit = async () => {
        if (submitting) return

        // Confirmation if manually triggered (time left > 0)
        if (timeLeft > 0 && !window.confirm('Are you sure you want to submit your exam?')) {
            return
        }

        setSubmitting(true)
        try {
            // Calculate Score
            let totalScore = 0
            exam.questions.forEach(q => {
                // Compare selected text with correct text, trimming any accidental whitespace
                const playerAnswer = (selectedAnswers[q.id] || '').trim()
                const correctAnswer = (q.correct_option || '').trim()

                if (playerAnswer === correctAnswer && correctAnswer !== '') {
                    totalScore += (q.marks || 1)
                }
            })

            // Save to Results table
            const { error } = await supabase
                .from('results')
                .insert([
                    {
                        exam_id: examId,
                        student_id: user.id,
                        score: totalScore,
                        submitted_at: new Date().toISOString()
                    }
                ])

            if (error) throw error

            alert(`Exam submitted successfully! Your score: ${totalScore}`)
            navigate('/student/dashboard')
        } catch (error) {
            console.error('Error submitting exam:', error.message)
            alert('Failed to submit exam. Please contact your instructor.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleViolation = async (type) => {
        setViolationCount(prev => prev + 1)
        if (user) {
            await SupabaseService.logViolation(user.id, examId, type)
        }

        if (violationCount >= 4) {
            alert('Security Breach: Multiple violations detected. System is terminating the session.')
            handleSubmit() // Auto-submit on breach
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Environment...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
            {/* Professional Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl">E</div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-none mb-1">{exam?.title}</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Session Live: {user?.email}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-amber-50 border-amber-100'}`}>
                        <Timer className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-600' : 'text-amber-600'}`} />
                        <span className={`font-mono text-xl font-black ${timeLeft < 300 ? 'text-red-700' : 'text-amber-900'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-black/20 disabled:opacity-50"
                    >
                        {submitting ? 'Processing...' : 'Finish Examination'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex p-8 gap-8 overflow-hidden max-w-[1600px] mx-auto w-full">
                {/* Scrollable Questions Area */}
                <div className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 p-12 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-3xl mx-auto space-y-16">
                        {exam?.questions && exam.questions.length > 0 ? (
                            exam.questions.map((q, idx) => (
                                <div key={q.id} className="relative group">
                                    <div className="absolute -left-16 top-0 text-4xl font-black text-gray-100 group-hover:text-amber-100 transition-colors">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 mb-8 leading-snug">
                                        {q.text}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        {q.options?.map((opt, i) => {
                                            const label = String.fromCharCode(65 + i)
                                            const isSelected = selectedAnswers[q.id] === opt
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswerSelect(q.id, opt)}
                                                    className={`flex items-center gap-6 p-6 rounded-3xl border-2 text-left transition-all group/opt ${isSelected
                                                        ? 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-500/10'
                                                        : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${isSelected ? 'bg-amber-600 text-white rotate-12' : 'bg-gray-100 text-gray-400 group-hover/opt:bg-amber-100 group-hover/opt:text-amber-600'
                                                        }`}>
                                                        {label}
                                                    </div>
                                                    <span className={`font-bold transition-colors ${isSelected ? 'text-amber-900' : 'text-gray-600 group-hover/opt:text-gray-900'}`}>
                                                        {opt}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertTriangle className="h-16 w-16 text-amber-500 mb-6 opacity-20" />
                                <h3 className="text-2xl font-black text-gray-900 mb-4">No Questions Found</h3>
                                <p className="text-gray-500 font-medium max-w-sm">
                                    This examination currently has no questions assigned to it. Please contact your instructor.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed AI Proctoring Sidebar */}
                <div className="w-96 flex flex-col gap-6 shrink-0">
                    <div className="bg-[#1A1612] rounded-[40px] p-2 overflow-hidden shadow-2xl">
                        <WebcamProctor onViolation={handleViolation} />
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Monitoring Log
                            </h3>
                            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                AI Active
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Risk Level</p>
                                <div className="flex items-end justify-between">
                                    <span className={`text-4xl font-black ${violationCount === 0 ? 'text-green-500' : violationCount < 3 ? 'text-orange-500' : 'text-red-600'}`}>
                                        {violationCount === 0 ? 'Normal' : violationCount < 3 ? 'Elevated' : 'Critical'}
                                    </span>
                                    <span className="text-gray-300 font-black text-2xl">{violationCount}/4</span>
                                </div>
                                <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${violationCount < 3 ? 'bg-amber-500' : 'bg-red-600'}`}
                                        style={{ width: `${(violationCount / 4) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4">
                                <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-4 w-4 text-amber-600" />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase italic">
                                    System is tracking face movement, eye gaze, and tab switching behavior.
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter">
                                DO NOT REFRESH OR SWITCH TABS
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExamPage
