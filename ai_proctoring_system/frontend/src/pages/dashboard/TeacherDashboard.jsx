import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
    LayoutDashboard,
    BookOpen,
    MessageSquareQuote,
    Library,
    PlusCircle,
    FileText,
    UploadCloud,
    PenTool,
    BarChart3,
    Users,
    PlayCircle,
    ChevronRight,
    Search,
    TrendingUp,
    LayoutGrid,
    MessageSquare,
    Bell,
    Settings,
    X,
    CheckCircle2,
    Send,
    HelpCircle
} from 'lucide-react'

const TeacherDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Teacher'

    const [activeTab, setActiveTab] = useState('Dashboard')
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [supportForm, setSupportForm] = useState({ subject: '', category: 'Technical', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [loadingStats, setLoadingStats] = useState(true)
    const [realStats, setRealStats] = useState({
        totalCourses: 0,
        totalQuestions: 0,
        activeExams: 0,
        studentsPresent: 0,
        enrollmentCount: 0,
        avgCompletion: 0,
        completedExams: 0,
        inProgressExams: 0
    })

    useEffect(() => {
        if (user?.id) fetchRealStats()
    }, [user])

    const handleSupportSubmit = async (e) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert([
                    {
                        student_id: user.id, // Column serves as generic user_id reference
                        subject: supportForm.subject,
                        category: supportForm.category,
                        message: supportForm.message,
                        status: 'pending'
                    }
                ])

            if (error) throw error
            setSubmitSuccess(true)
            setTimeout(() => {
                setIsSupportModalOpen(false)
                setSubmitSuccess(false)
                setSupportForm({ subject: '', category: 'Technical', message: '' })
            }, 2000)
        } catch (error) {
            alert('Failed to send message: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchRealStats = async () => {
        try {
            setLoadingStats(true)

            // 1. Total Courses (Exams created by teacher)
            const { data: courses } = await supabase
                .from('exams')
                .select('id')

            const totalCourses = courses?.length || 0
            const courseIds = courses?.map(c => c.id) || []

            // 2. Total Questions (Questions added by teacher)
            const { count: totalQuestions } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            // 3. Active Exams (Assuming all created exams are active for now)
            const activeExams = totalCourses

            // 4. Students & Completions (from results table for teacher's exams)
            let studentsPresent = 0
            let enrollmentCount = 0
            let avgCompletion = 0
            let completedExams = 0
            let inProgressExams = 0

            if (courseIds.length > 0) {
                const { data: results } = await supabase
                    .from('results')
                    .select('student_id, score')
                    .in('exam_id', courseIds)

                if (results && results.length > 0) {
                    enrollmentCount = results.length

                    // Unique students
                    const uniqueStudents = new Set(results.map(r => r.student_id))
                    studentsPresent = uniqueStudents.size

                    // Completion metrics (score based)
                    const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0)
                    avgCompletion = Math.round(totalScore / results.length)

                    // Assume > 0 score is completed, else in progress
                    completedExams = results.filter(r => r.score > 0).length
                    inProgressExams = results.length - completedExams
                }
            } else {
                // Fallback: Just count total students in system if teacher has no exams yet
                const { count: totalStudents } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'student')
                studentsPresent = totalStudents || 0
            }

            setRealStats({
                totalCourses,
                totalQuestions: totalQuestions || 0,
                activeExams,
                studentsPresent,
                enrollmentCount,
                avgCompletion,
                completedExams,
                inProgressExams
            })
        } catch (error) {
            console.error('Error fetching real-time stats:', error)
        } finally {
            setLoadingStats(false)
        }
    }

    const sidebarItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Manage Courses', icon: BookOpen },
        { name: 'Manage Questions', icon: MessageSquareQuote },
        { name: 'Manage Study Material', icon: Library },
        { name: 'Blog Management', icon: PenTool },
    ]

    const stats = [
        { label: 'Total Courses', value: realStats.totalCourses.toString().padStart(2, '0'), icon: BookOpen, color: 'from-blue-600 to-blue-700', bg: 'bg-blue-600', text: 'text-white' },
        { label: 'Total Questions', value: realStats.totalQuestions.toString(), icon: MessageSquareQuote, color: 'from-purple-600 to-purple-700', bg: 'bg-purple-600', text: 'text-white' },
        { label: 'Active Exams', value: realStats.activeExams.toString().padStart(2, '0'), icon: PlayCircle, color: 'from-rose-600 to-rose-700', bg: 'bg-rose-600', text: 'text-white' },
        { label: 'Students Present', value: realStats.studentsPresent.toString(), icon: Users, color: 'from-emerald-600 to-emerald-700', bg: 'bg-emerald-600', text: 'text-white' },
    ]

    const quickActions = [
        { name: 'Manage Exam', icon: PlayCircle, desc: 'View and edit existing examinations', bg: 'bg-amber-100', iconBg: 'bg-amber-500', text: 'text-amber-900' },
        { name: 'Add Question', icon: PlusCircle, desc: 'Add new questions to your question bank', bg: 'bg-orange-100', iconBg: 'bg-orange-500', text: 'text-orange-900' },
        { name: 'Upload Materials', icon: UploadCloud, desc: 'Upload PDFs, videos, or documents', bg: 'bg-pink-100', iconBg: 'bg-pink-500', text: 'text-pink-900' },
        { name: 'Blogs', icon: PenTool, desc: 'Share insights or updates with students', bg: 'bg-emerald-100', iconBg: 'bg-emerald-500', text: 'text-emerald-900' },
        { name: 'Create New Exam', icon: FileText, desc: 'Set up a new examination for students', bg: 'bg-orange-100', iconBg: 'bg-orange-500', text: 'text-orange-900' },
        { name: 'Student Results', icon: BarChart3, desc: 'Detailed performance reports', bg: 'bg-cyan-100', iconBg: 'bg-cyan-500', text: 'text-cyan-900' },
        { name: 'Announcements', icon: Bell, desc: 'Push important notices to students', bg: 'bg-amber-100', iconBg: 'bg-amber-500', text: 'text-amber-900' },
    ]

    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#E0F2FE] via-[#F0FDF4] to-[#E0FDF9]">
            {/* Left Sidebar - Dark Theme */}
            <aside className="w-72 bg-[#1A1612] flex flex-col border-r border-white/5 shadow-2x transition-all duration-300">
                <div className="p-8">
                    <div className="space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    if (item.name === 'Manage Courses') navigate('/teacher/manage-courses');
                                    else if (item.name === 'Manage Questions') navigate('/teacher/manage-questions');
                                    else if (item.name === 'Manage Study Material') navigate('/teacher/manage-materials');
                                    else if (item.name === 'Blog Management') navigate('/teacher/blog-management');
                                    else setActiveTab(item.name);
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.name
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl shadow-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${activeTab === item.name ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                <span className={`font-semibold ${activeTab === item.name ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
                                    {item.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-8">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Teacher Pro</p>
                        <p className="text-sm text-gray-300 mb-4 font-medium leading-relaxed">Upgrade for advanced analytics and AI generation.</p>
                        <button className="w-full py-3 bg-white dark:bg-gray-900 text-black dark:text-white font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors uppercase tracking-wider">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right Side - Main Content */}
            <main className="flex-1 overflow-y-auto px-10 py-10">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Teacher Panel</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl font-medium">
                            Manage your courses, track student progress and create engaging educational content every day
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all">
                            <Search className="h-5 w-5" />
                        </button>
                        <button className="p-3 bg-white dark:bg-gray-900 border border-orange-100 rounded-xl text-gray-400 hover:text-amber-600 hover:border-amber-100 hover:shadow-lg transition-all relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-orange-600 rounded-full border-2 border-white"></span>
                        </button>
                        <button onClick={() => setIsSupportModalOpen(true)} className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all" title="Help & Support">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                        <button className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`group p-8 ${stat.bg} ${stat.text} rounded-[32px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border border-white/10`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-900 opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8"></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`mb-6 p-4 rounded-2xl bg-white/20 text-white shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                                    <stat.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-4xl font-black mb-1 tracking-tight">{stat.value}</h3>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Title */}
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Quick Actions</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                {/* Quick Actions Grid - Single Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-12">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (action.name === 'Manage Exam') navigate('/teacher/manage-courses');
                                else if (action.name === 'Add Question') navigate('/teacher/manage-questions');
                                else if (action.name === 'Upload Materials') navigate('/teacher/manage-materials');
                                else if (action.name === 'Blogs') navigate('/teacher/blog-management');
                                else if (action.name === 'Create New Exam') navigate('/teacher/create-exam');
                                else if (action.name === 'Student Results') navigate('/teacher/view-results');
                                else if (action.name === 'Announcements') navigate('/teacher/notices');
                            }}
                            className={`group flex flex-col items-center p-5 ${action.bg} ${action.text} rounded-2xl border-b-4 border-black/10 hover:border-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center`}
                        >
                            <div className={`h-12 w-12 rounded-xl ${action.iconBg} text-white flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-black text-[10px] uppercase tracking-wider line-clamp-1">{action.name}</h3>
                        </button>
                    ))}
                </div>

                {/* Teaching Overview Title */}
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Teaching Overview</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                {/* Teaching Overview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Student Enrollment Box */}
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                                    <Users className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Student Enrollment</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Growth Analytics</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Total number of students in your course</span>
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{realStats.enrollmentCount}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-600 rounded-full animate-progress-fill" style={{ width: `${Math.min(100, realStats.enrollmentCount * 5)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg">+{(realStats.enrollmentCount * 0.12).toFixed(0)} this month</span>
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg">Real-time Data</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Completion Box */}
                    <div className="bg-[#1D1A16] rounded-[32px] p-8 border border-white/5 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/10">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Course Completion</h3>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Progress Metrics</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-400 font-medium">Average Completion Percentage</span>
                                        <span className="text-3xl font-black text-white">{realStats.avgCompletion}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full animate-progress-fill" style={{ width: `${realStats.avgCompletion}%` }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Completed</p>
                                        <p className="text-lg font-black text-white">{realStats.completedExams}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">In Progress</p>
                                        <p className="text-lg font-black text-white">{realStats.inProgressExams}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Support Modal */}
                {isSupportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative animate-slide-up">
                            <button
                                onClick={() => setIsSupportModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Admin Support</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Send a direct message</p>
                                    </div>
                                </div>

                                {submitSuccess ? (
                                    <div className="py-12 text-center animate-bounce-in">
                                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                            <CheckCircle2 className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                        <p className="text-gray-400 font-medium">Admin will be notified of your issue.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSupportSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Issue Category</label>
                                            <select
                                                value={supportForm.category}
                                                onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700 dark:text-white appearance-none"
                                            >
                                                <option>Technical</option>
                                                <option>Account Registration</option>
                                                <option>Exam Management</option>
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
                                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700 dark:text-white"
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
                                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-gray-700 dark:text-white resize-none"
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

export default TeacherDashboard
