import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Trophy,
    AlertCircle,
    PlayCircle,
    BarChart2,
    Lightbulb,
    Bell,
    HelpCircle,
    Sparkles,
    X,
    MessageSquare,
    Send,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const StudentDashboard = () => {
    const { user } = useAuth()
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [supportForm, setSupportForm] = useState({ subject: '', category: 'Technical', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [notices, setNotices] = useState([])
    const [loadingNotices, setLoadingNotices] = useState(true)

    useEffect(() => {
        fetchNotices()
    }, [])

    const fetchNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            setNotices(data || [])
        } catch (error) {
            console.error('Error fetching notices:', error.message)
        } finally {
            setLoadingNotices(false)
        }
    }

    const handleSupportSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert([{
                    student_id: user.id,
                    subject: supportForm.subject,
                    category: supportForm.category,
                    message: supportForm.message,
                    status: 'pending'
                }])

            if (error) throw error
            setSubmitSuccess(true)
            setSupportForm({ subject: '', category: 'Technical', message: '' })
            setTimeout(() => {
                setSubmitSuccess(false)
                setIsSupportModalOpen(false)
            }, 2000)
        } catch (error) {
            console.error('Error sending support ticket:', error.message)
            alert('Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Mock data for display
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-orange-100">
            {/* 1. Left Hand Side Dashboard (Sidebar) */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</h2>
                    <nav className="space-y-2">
                        <Link to="/student/dashboard" className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-900/20">
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link to="/student/exams" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
                            <FileText className="h-5 w-5" />
                            My Examinations
                        </Link>
                        <Link to="/student/materials" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
                            <BookOpen className="h-5 w-5" />
                            View Study Material
                        </Link>
                        <Link to="/student/results" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
                            <Trophy className="h-5 w-5" />
                            My Rankings & Marks
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-800">
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{userName}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                {/* 2. Top Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, <span className="text-orange-600 capitalize">{userName}</span>!</h1>
                    <p className="text-gray-500 text-sm">
                        Ready to continue your learning journey? Let's achieve great things today.
                    </p>
                </header>

                {/* 3. Stats Row (Animation separate boxes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Available Exam', value: '03', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Total Questions', value: '150', icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Progress', value: '85%', icon: BarChart2, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Achieve Batches', value: '02', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Weak Areas', value: 'Algebra', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                                <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* 4. Optimized Quick Actions Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: 'Take Exam', icon: PlayCircle, link: '/student/exams', bg: 'bg-white', iconBg: 'bg-gray-900', text: 'text-gray-900' },
                        { title: 'View Marks', icon: BarChart2, link: '/student/results', bg: 'bg-white', iconBg: 'bg-orange-500', text: 'text-orange-900' },
                        { title: 'Study Blogs', icon: Sparkles, link: '/student/blogs', bg: 'bg-white', iconBg: 'bg-emerald-500', text: 'text-emerald-900' },
                        { title: 'Library', icon: BookOpen, link: '/student/materials', bg: 'bg-white', iconBg: 'bg-blue-500', text: 'text-blue-900' },
                    ].map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={i}
                                to={action.link}
                                className={`group flex items-center p-4 ${action.bg} rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
                            >
                                <div className={`h-12 w-12 rounded-xl ${action.iconBg} flex items-center justify-center mr-4 shadow-lg group-hover:rotate-12 transition-transform shrink-0`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className={`text-sm font-black ${action.text} truncate`}>{action.title}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Access Now &rarr;</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* 5. Bottom Content Blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Study Tips */}
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-bold text-indigo-900">Study Tips</h3>
                        </div>
                        <ul className="space-y-3">
                            {['Break complex topics into smaller chunks.', 'Practice active recall after reading.', 'Take regular breaks using Pomodoro.'].map((tip, i) => (
                                <li key={i} className="flex gap-2 text-sm text-indigo-800">
                                    <span className="font-bold">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-amber-600" />
                            <h3 className="font-bold text-amber-900">Important Notice</h3>
                        </div>
                        <div className="space-y-3">
                            {loadingNotices ? (
                                <div className="animate-pulse flex items-center gap-2 p-3 bg-white/30 rounded-lg">
                                    <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                                    <div className="h-2 flex-1 bg-amber-200 rounded"></div>
                                </div>
                            ) : notices.length > 0 ? (
                                notices.map((notice) => (
                                    <div key={notice.id} className={`p-3 rounded-lg text-sm mb-2 shadow-sm ${notice.importance === 'urgent' ? 'bg-red-100 text-red-900 border border-red-200' : 'bg-white/50 text-amber-800'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-[10px] uppercase opacity-75">
                                                {new Date(notice.created_at).toLocaleDateString()}
                                            </span>
                                            {notice.importance === 'urgent' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                                        </div>
                                        <p className="font-medium leading-relaxed">{notice.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-amber-700/60 font-bold uppercase tracking-widest">No New Announcements</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Need Help? Box */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="h-5 w-5 text-brand-red" />
                            <h3 className="font-bold text-gray-900">Need Help?</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Facing issues with the exam portal or need academic support? Send a message to the admin.
                        </p>
                        <button
                            onClick={() => setIsSupportModalOpen(true)}
                            className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all text-sm border border-red-100 flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Contact Support
                        </button>
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-center text-gray-400">
                            v1.0.2 • Student Portal
                        </div>
                    </div>
                </div>

                {/* Contact Support Modal */}
                {isSupportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative animate-slide-up">
                            <button
                                onClick={() => setIsSupportModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Admin Support</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Send a direct message</p>
                                    </div>
                                </div>

                                {submitSuccess ? (
                                    <div className="py-12 text-center animate-bounce-in">
                                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                            <CheckCircle2 className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                                        <p className="text-gray-400 font-medium">Admin will be notified of your issue.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSupportSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Issue Category</label>
                                            <select
                                                value={supportForm.category}
                                                onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none"
                                            >
                                                <option>Technical</option>
                                                <option>Academic</option>
                                                <option>Exam Conflict</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Briefly describe the topic..."
                                                value={supportForm.subject}
                                                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Your Message</label>
                                            <textarea
                                                required
                                                rows="4"
                                                placeholder="Tell us more about the issue you are facing..."
                                                value={supportForm.message}
                                                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700 resize-none"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                            Submit Ticket
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentDashboard
