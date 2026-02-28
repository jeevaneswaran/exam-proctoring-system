import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { SupabaseService } from '../../services/SupabaseService'
import { useAuth } from '../../contexts/AuthContext'

import { Timer, AlertTriangle, Sparkles, ShieldCheck, Activity, Terminal, Camera } from 'lucide-react'
import EricaChat from '../../components/shared/EricaChat'
import PreExamValidation from '../../components/exam/PreExamValidation'
import WebcamProctor from '../../components/exam/WebcamProctor'
import { useWebcam } from '../../hooks/useWebcam'

const ExamPage = () => {
    const { examId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { videoRef, startCamera, stopCamera } = useWebcam()
    const [exam, setExam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [violationCount, setViolationCount] = useState(0)
    const [riskScore, setRiskScore] = useState(0)
    const [events, setEvents] = useState([])
    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        const saved = localStorage.getItem(`exam_answers_${examId}`)
        return saved ? JSON.parse(saved) : {}
    })
    const [timeLeft, setTimeLeft] = useState(0)
    const [validationComplete, setValidationComplete] = useState(false)
    const [showSecurityOverlay, setShowSecurityOverlay] = useState(false)

    // --- Senior Dev Helper Functions ---
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleAnswerSelect = (questionId, optionText) => {
        setSelectedAnswers(prev => {
            const updated = {
                ...prev,
                [questionId]: optionText
            }
            localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(updated))
            return updated
        })
    }

    const handleSubmit = useCallback(async () => {
        if (submitting) return
        if (timeLeft > 0 && !window.confirm('Are you sure you want to submit your exam?')) return

        setSubmitting(true)
        try {
            stopCamera()
            let totalScore = 0
            if (exam?.questions) {
                exam.questions.forEach(q => {
                    const playerAnswer = (selectedAnswers[q.id] || '').trim()
                    const correctAnswer = (q.correct_option || '').trim()
                    if (playerAnswer === correctAnswer && correctAnswer !== '') {
                        totalScore += (q.marks || 1)
                    }
                })
            }

            const { error } = await supabase
                .from('results')
                .insert([{
                    exam_id: examId,
                    student_id: user?.id,
                    score: totalScore,
                    submitted_at: new Date().toISOString()
                }])

            if (error) throw error

            // Clear all persistence
            localStorage.removeItem(`exam_answers_${examId}`)
            await supabase.from('exam_progress').delete().eq('student_id', user.id).eq('exam_id', examId)

            alert(`Exam submitted successfully! Your score: ${totalScore}`)
            navigate('/student/dashboard')
        } catch (err) {
            console.error('Error submitting exam:', err.message)
            alert('Failed to submit exam. Please contact your instructor.')
        } finally {
            setSubmitting(false)
        }
    }, [submitting, timeLeft, exam, selectedAnswers, examId, user, navigate, stopCamera])

    const handleViolation = useCallback(async (data) => {
        // STOP_EXAM is now treated as a severe warning — exam is NEVER auto-terminated
        if (data?.action === "STOP_EXAM") {
            console.warn(`⚠️ Proctoring warning: ${data.reason} — exam continues.`)
            return  // Just log it, do NOT call handleSubmit
        }

        const isString = typeof data === 'string'
        const alertList = isString ? [data] : (data?.alerts || [])
        if (data?.violation_details?.msg) alertList.push(data.violation_details.msg)
        if (data?.movement_alert) alertList.push("EXCESSIVE BODY MOVEMENT")
        if (data?.warning) alertList.push(data.warning)

        let score = isString ? 50 : (data?.risk_score || (alertList.length > 0 ? 30 : 0))
        if (alertList.length === 0 && !isString) return

        setRiskScore(prev => Math.min(100, isString ? prev + score : score))
        alertList.forEach(alertMsg => {
            setEvents(prev => [{
                id: Date.now() + Math.random(),
                time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                msg: alertMsg.toUpperCase(),
                risk: score
            }, ...prev].slice(0, 10))
        })

        setViolationCount(v => v + alertList.length)

        if (user && alertList.length > 0) {
            await SupabaseService.logViolation(user.id, examId, alertList.join(' | '), score)
        }
    }, [user, examId, handleSubmit])


    // 1. AUTO-LOAD & PERSISTENCE
    useEffect(() => {
        const loadProgress = async () => {
            try {
                // Fetch Exam Details
                const examData = await SupabaseService.getExamDetails(examId)
                if (examData) {
                    setExam(examData)

                    // Check for existing progress
                    const { data: progress, error } = await supabase
                        .from('exam_progress')
                        .select('*')
                        .eq('student_id', user.id)
                        .eq('exam_id', examId)
                        .single()

                    if (progress) {
                        // Merge localStorage (more recent) with Supabase (fallback)
                        setSelectedAnswers(prev => ({
                            ...progress.selected_answers,
                            ...prev
                        }))
                        setTimeLeft(progress.time_left || (examData.duration_minutes * 60))
                        console.log("✅ Progress resumed")
                    } else {
                        setTimeLeft((examData.duration_minutes || 60) * 60)
                    }
                }
            } catch (error) {
                console.error('Error fetching exam:', error)
            } finally {
                setLoading(false)
            }
        }
        if (user && examId) loadProgress()
    }, [examId, user])

    // 2. AUTO-SAVE PROGRESS
    useEffect(() => {
        if (loading || submitting || !user) return

        const saveProgress = async () => {
            await supabase.from('exam_progress').upsert({
                student_id: user.id,
                exam_id: examId,
                selected_answers: selectedAnswers,
                time_left: timeLeft,
                updated_at: new Date().toISOString()
            })
        }

        const interval = setInterval(saveProgress, 5000) // Save every 5s
        return () => clearInterval(interval)
    }, [selectedAnswers, timeLeft, loading, submitting, user, examId])

    // 3. Sync Violations from Supabase in Real-time
    useEffect(() => {
        if (loading || !user) return

        const channel = supabase
            .channel(`v_logs_${examId}_${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'violation_logs',
                filter: `student_id=eq.${user.id}`
            }, payload => {
                handleViolation({ alerts: [payload.new.violation_type], risk_score: payload.new.risk_score })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [loading, user, examId, handleViolation])

    // --- Senior Dev Addition: Unified Camera Lifecycle ---
    useEffect(() => {
        if (!submitting) {
            startCamera()
        }
        return () => stopCamera() // Final failsafe cleanup
    }, [submitting, startCamera, stopCamera])

    useEffect(() => {
        let blurTimer = null

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation({ alerts: ['TAB SWITCH DETECTED'], risk_score: 50 })
                setShowSecurityOverlay(true)
            }
        }

        const handleBlur = () => {
            blurTimer = setTimeout(() => {
                if (!document.hasFocus()) {
                    handleViolation({ alerts: ['WINDOW LEFT EXAM PAGE'], risk_score: 40 })
                    setShowSecurityOverlay(true)
                }
            }, 1000)
        }

        const handleFocus = () => {
            // Cancel the blur timer if focus returns quickly (was a false alarm)
            if (blurTimer) clearTimeout(blurTimer)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
            if (blurTimer) clearTimeout(blurTimer)
        }
    }, [handleViolation])

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
    }, [timeLeft, loading, handleSubmit])


    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing Secure Environment...</p>
        </div>
    )

    if (!validationComplete) return (
        <PreExamValidation
            profilePicUrl={user?.user_metadata?.avatar_url}
            onComplete={() => setValidationComplete(true)}
            videoRef={videoRef}
        />
    )

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans relative overflow-hidden">
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">E</div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{exam?.title}</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Secure Pipeline Live: {user?.email}
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-md px-12">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Integrity</span>
                        <span className={`text-[10px] font-black uppercase ${riskScore > 70 ? 'text-red-600 animate-pulse' : riskScore > 30 ? 'text-orange-500' : 'text-green-500'}`}>
                            {riskScore === 0 ? 'Optimal' : riskScore > 70 ? 'Critical' : 'Compromised'}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-50">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${riskScore > 70 ? 'bg-red-500' : riskScore > 30 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${100 - riskScore}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-orange-50 border-orange-100'}`}>
                        <Timer className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-600' : 'text-orange-600'}`} />
                        <span className={`font-mono text-xl font-black ${timeLeft < 300 ? 'text-red-700' : 'text-orange-900'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-black/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? 'Processing...' : 'FINISH EXAMINATION'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex p-8 gap-8 max-w-[1700px] mx-auto w-full relative">
                {/* Live Security Log & Camera Sidebar (Left) */}
                <div className="w-72 hidden xl:flex flex-col gap-6 animate-fade-in sticky top-8 h-[calc(100vh-140px)]">

                    {/* Real-time Camera Feed Integration */}
                    <div className="space-y-2 shrink-0">
                        <div className="flex items-center gap-2 px-2">
                            <Camera className="h-3 w-3 text-orange-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Secure Visual Pipeline</span>
                        </div>
                        <WebcamProctor onViolation={handleViolation} videoRef={videoRef} />
                    </div>

                    <div className="bg-gray-900 rounded-[32px] p-6 text-white shadow-2xl overflow-hidden relative flex-1 flex flex-col min-h-[250px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Terminal className="h-20 w-20 rotate-12" />
                        </div>
                        <div className="flex items-center gap-2 mb-4 relative z-10 shrink-0">
                            <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Sentinel</h3>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar-dark pr-2">
                            {events.length > 0 ? events.map((ev) => (
                                <div key={ev.id} className="group animate-slide-up">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[8px] font-mono text-gray-500 dark:text-gray-400">[{ev.time}]</span>
                                        <span className={`text-[8px] font-black px-1.5 rounded ${ev.risk > 70 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            RISK: {ev.risk}%
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-300 leading-tight">
                                        {ev.msg}
                                    </p>
                                    <div className="h-px w-full bg-white/5 mt-2 group-last:hidden"></div>
                                </div>
                            )) : (
                                <div className="py-10 text-center">
                                    <ShieldCheck className="h-10 w-10 text-gray-800 dark:text-gray-100 mx-auto mb-3" />
                                    <p className="text-[9px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-relaxed">
                                        Environmental Scan<br />Status: Nominal
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest text-center">Navigation</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {exam?.questions?.map((_, i) => (
                                <button key={i} className={`h-10 w-10 rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all ${selectedAnswers[exam.questions[i].id] ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-400'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Question Area */}
                <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-12 overflow-y-auto custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-16">
                            {exam?.questions && exam.questions.length > 0 ? (
                                exam.questions.map((q, idx) => (
                                    <div key={q.id} className="relative group">
                                        <div className="absolute -left-16 top-0 text-4xl font-black text-gray-100 group-hover:text-orange-100 transition-colors">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 leading-snug">
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
                                                            ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-500/10'
                                                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-orange-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${isSelected ? 'bg-orange-600 text-white rotate-12' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover/opt:bg-orange-100 group-hover/opt:text-orange-600'
                                                            }`}>
                                                            {label}
                                                        </div>
                                                        <span className={`font-bold transition-colors ${isSelected ? 'text-orange-900' : 'text-gray-600 dark:text-gray-300 group-hover/opt:text-gray-900'}`}>
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
                                    <AlertTriangle className="h-16 w-16 text-orange-500 mb-6 opacity-20" />
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">No Questions Found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                                        This examination currently has no questions assigned to it. Please contact your instructor.
                                    </p>
                                </div>
                            )}
                            <div className="h-40"></div>
                        </div>
                    </div>
                </div>


            </div>

            <EricaChat />

            {/* Strict Proctoring Overlay */}
            {showSecurityOverlay && (
                <div className="fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[40px] p-10 text-center shadow-2xl border-4 border-red-500/20">
                        <div className="h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8 animate-bounce">
                            <AlertTriangle className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">SECURITY ALERT</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">
                            Our Proctoring AI detected that you left the examination window. This event has been logged and your instructor has been notified.
                        </p>
                        <button
                            onClick={() => setShowSecurityOverlay(false)}
                            className="w-full py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 group"
                        >
                            RETURN TO EXAMINATION
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExamPage
