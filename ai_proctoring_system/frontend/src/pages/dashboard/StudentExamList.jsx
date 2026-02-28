import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FileText, Clock, HelpCircle, GraduationCap, ArrowRight, Loader, ShieldCheck, AlertCircle, CheckCircle2, X, Camera, Sparkles } from 'lucide-react'

const StudentExamList = () => {
    const navigate = useNavigate()
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedExamId, setSelectedExamId] = useState(null)
    const [showGuidelines, setShowGuidelines] = useState(false)

    useEffect(() => {
        fetchExams()
    }, [])

    const fetchExams = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*, questions(count)')

            if (error) throw error

            const formattedData = data.map(exam => ({
                ...exam,
                total_questions: exam.questions?.[0]?.count || 0
            }))

            setExams(formattedData || [])
        } catch (error) {
            console.error('Error fetching exams:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartClick = (id) => {
        setSelectedExamId(id)
        setShowGuidelines(true)
    }

    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationStep, setVerificationStep] = useState(0) // 0: none, 1: scanning, 2: success

    const proceedToExam = () => {
        const selectedExam = exams.find(e => e.id === selectedExamId)
        navigate(`/student/exam/${selectedExamId}`, { state: { verified: true, exam: selectedExam } })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <Loader className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-orange-50 p-6 md:p-12 student-theme">
            <header className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full mb-4 font-black">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-widest leading-none">Secure Board 2024</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Active Assessments</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                    Select your scheduled examination module. Proceed with caution as proctoring protocol will be established immediately upon entry.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {exams.map((exam, index) => (
                    <div
                        key={exam.id}
                        className="group bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-500 overflow-hidden flex flex-col"
                    >
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                                    Code: {exam.id.slice(0, 8)}
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{exam.title}</h2>
                            </div>
                            <div className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="p-8 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-transparent group-hover:border-orange-100 transition-all">
                                    <HelpCircle className="h-5 w-5 mb-2 text-orange-500" />
                                    <p className="text-xs font-black text-gray-400 uppercase">Weight</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{exam.total_questions} Qs</p>
                                </div>
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-transparent group-hover:border-orange-100 transition-all">
                                    <Clock className="h-5 w-5 mb-2 text-orange-500" />
                                    <p className="text-xs font-black text-gray-400 uppercase">Window</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{exam.duration_minutes}m</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <button
                                onClick={() => handleStartClick(exam.id)}
                                className="w-full flex items-center justify-center py-5 px-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all group/btn shadow-xl shadow-gray-900/10"
                            >
                                START MODULE
                                <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Proctoring Guidelines Modal */}
            {showGuidelines && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative animate-slide-up">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-20 -mt-20 opacity-50"></div>

                        <div className="p-12 relative z-10">
                            {isVerifying ? (
                                <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                                    <div className="relative h-48 w-48 mb-8">
                                        {/* Scanner Pulse */}
                                        <div className={`absolute inset-0 rounded-full border-4 border-orange-500/20 ${verificationStep === 1 ? 'animate-ping' : ''}`}></div>
                                        <div className="relative h-full w-full rounded-full bg-gray-900 overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center">
                                            {verificationStep === 1 ? (
                                                <>
                                                    <Camera className="h-16 w-16 text-gray-500 dark:text-gray-400 animate-pulse" />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/30 to-transparent h-1/2 w-full animate-scan-line"></div>
                                                </>
                                            ) : (
                                                <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce-in" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                        {verificationStep === 1 ? 'Biometric Verification' : 'Identity Confirmed'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                        {verificationStep === 1 ? 'Performing Face-ID Scan...' : 'Secure Session Initializing...'}
                                    </p>

                                    {verificationStep === 1 && (
                                        <div className="mt-8 flex gap-2">
                                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-16 w-16 bg-orange-100 rounded-[24px] flex items-center justify-center text-orange-600 animate-pulse">
                                            <ShieldCheck className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Final Security Protocols</h2>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Accept the terms to unlock the examination</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-10">
                                        {[
                                            { title: 'Camera & Microphone Access', desc: 'System will require persistent access to your webcam for AI monitoring.', icon: Camera },
                                            { title: 'Anti-Cheat AI (YOLOv8)', desc: 'Mobile phones, books, and unauthorized objects will trigger immediate violations.', icon: Sparkles },
                                            { title: 'Tab Lock Protocol', desc: 'Leaving the exam tab more than twice will result in automatic submission.', icon: AlertCircle }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-6 p-6 bg-gray-50 dark:bg-gray-950 rounded-[28px] border border-gray-100 dark:border-gray-800">
                                                <div className="h-12 w-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white shadow-sm shrink-0">
                                                    <item.icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowGuidelines(false)}
                                            className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X className="h-5 w-5" />
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={proceedToExam}
                                            className="flex-[2] py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20"
                                        >
                                            I ACCEPT & START EXAM
                                            <CheckCircle2 className="h-5 w-5 text-orange-400" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentExamList
