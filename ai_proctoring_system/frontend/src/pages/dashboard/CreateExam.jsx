import { useState } from 'react'
import {
    PlusCircle,
    ArrowRight,
    XCircle,
    Book,
    Clock,
    Target,
    Shield,
    Eye,
    MonitorOff,
    Camera,
    Info,
    ChevronLeft,
    Sparkles
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const CreateExam = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState('')
    const [proctoringOptions, setProctoringOptions] = useState({
        faceDetection: true,
        tabTracking: true,
        gazeTracking: false,
        roomScanning: false
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('exams')
                .insert([
                    {
                        title,
                        description,
                        duration_minutes: parseInt(duration),
                        created_by: user.id,
                        // For now we store proctoring options in a JSONB or just assume default
                        // In a real app we'd add columns to the 'exams' table for these
                    }
                ])
                .select()

            if (error) throw error

            alert('Examination created and scheduled successfully! 🚀')
            navigate('/teacher/dashboard')
        } catch (error) {
            console.error('Error creating exam:', error.message)
            alert('Failed to create examination: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleProctoring = (option) => {
        setProctoringOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2x shrink-0">
                <Link to="/teacher/dashboard" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-12 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Exam Architect</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Create AI Exam</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 lowercase tracking-widest">
                        Configure your examination parameters and advanced proctoring settings
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-up">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info Card */}
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                                    <Book className="h-6 w-6 text-amber-500" />
                                    Examination Details
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exam Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Mid-term Assessment: Neural Networks"
                                            className="w-full px-6 py-4 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 dark:text-white font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    required
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    placeholder="60"
                                                    className="w-full pl-12 pr-4 py-4 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 dark:text-white font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject/Category</label>
                                            <select className="w-full px-6 py-4 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 dark:text-white font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition-all">
                                                <option>Computer Science</option>
                                                <option>Mathematics</option>
                                                <option>Information Security</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions for Students</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="4"
                                            placeholder="Ensure your camera is working..."
                                            className="w-full px-6 py-4 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 dark:text-white font-bold focus:outline-none focus:border-amber-600 focus:bg-white transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* AI Proctoring Options */}
                            <div className="bg-[#1A1612] p-10 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600/5 rounded-tl-full -mr-32 -mb-32"></div>

                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                                    <Shield className="h-6 w-6 text-amber-500" />
                                    AI Proctoring Settings
                                </h3>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-10 italic">
                                    select features to enable during this exam session
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(proctoringOptions).map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => toggleProctoring(key)}
                                            className={`p-6 rounded-3xl border transition-all flex items-center justify-between group/opt ${proctoringOptions[key]
                                                    ? 'bg-amber-600/10 border-amber-500/50 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${proctoringOptions[key] ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {key === 'faceDetection' && <Camera className="h-6 w-6" />}
                                                    {key === 'tabTracking' && <MonitorOff className="h-6 w-6" />}
                                                    {key === 'gazeTracking' && <Eye className="h-6 w-6" />}
                                                    {key === 'roomScanning' && <Sparkles className="h-6 w-6" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black tracking-tight capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">
                                                        {proctoringOptions[key] ? 'Enabled' : 'Disabled'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${proctoringOptions[key] ? 'border-amber-500 bg-amber-500' : 'border-white/10'
                                                }`}>
                                                {proctoringOptions[key] && <div className="h-2 w-2 rounded-full bg-white dark:bg-gray-900 animate-pulse"></div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black rounded-3xl shadow-2xl shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}
                                >
                                    {loading ? (
                                        <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <PlusCircle className="h-6 w-6" />
                                    )}
                                    {loading ? 'Scheduling...' : 'Launch Examination'}
                                    {!loading && <ArrowRight className="h-6 w-6" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/teacher/dashboard')}
                                    className="px-10 py-5 bg-rose-50 text-rose-600 font-black rounded-3xl hover:bg-rose-100 transition-all"
                                >
                                    Discard Draft
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Preview Side */}
                    <div className="hidden lg:block space-y-8 animate-fade-in translate-y-4">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-orange-100 shadow-xl sticky top-24">
                            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Student View Preview
                            </h4>

                            <div className="p-8 bg-gradient-to-br from-[#1A1612] to-black rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full"></div>
                                <div className="relative z-10">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center mb-6">
                                        <PlusCircle className="h-6 w-6" />
                                    </div>
                                    <h5 className="text-2xl font-black mb-2 tracking-tight line-clamp-2">
                                        {title || 'Exam Title Placeholder'}
                                    </h5>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                                        Duration: {duration || '0'} Min
                                    </p>

                                    <div className="space-y-3 mb-10">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-amber-500/50">
                                            <Shield className="h-3 w-3" />
                                            Active Protections
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {proctoringOptions.faceDetection && <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold border border-white/10 uppercase">Face AI</span>}
                                            {proctoringOptions.tabTracking && <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold border border-white/10 uppercase">Anti-Leak</span>}
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-white dark:bg-gray-900 text-black dark:text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                                        Start Examination
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100/50">
                                <h5 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Did you know?
                                </h5>
                                <p className="text-[11px] font-bold text-amber-800/60 leading-relaxed uppercase italic">
                                    Enabling gaze tracking increases proctoring accuracy by 45% in remote sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CreateExam
