import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
    Users,
    GraduationCap,
    BookOpen,
    HelpCircle,
    BarChart3,
    LayoutDashboard,
    PlusCircle,
    UserPlus,
    FilePlus,
    ArrowRight,
    Settings,
    Shield
} from 'lucide-react'

const AdminDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        pendingTeachers: 0,
        courses: 0,
        questions: 0
    })
    const [loading, setLoading] = useState(true)

    const adminName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Administrator'

    useEffect(() => {
        fetchSystemStats()

        // Refresh stats when the window is focused (e.g., coming back from approval page)
        window.addEventListener('focus', fetchSystemStats)
        return () => window.removeEventListener('focus', fetchSystemStats)
    }, [])

    const fetchSystemStats = async () => {
        try {
            setLoading(true)
            const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
            const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('is_approved', true)
            const { count: pendingCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('is_approved', false)
            const { count: courseCount } = await supabase.from('exams').select('*', { count: 'exact', head: true })
            const { count: questionCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })

            setStats({
                students: studentCount || 0,
                teachers: teacherCount || 0,
                pendingTeachers: pendingCount || 0,
                courses: courseCount || 0,
                questions: questionCount || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex student-theme">
            {/* Sidebar (Implicitly handled by Navbar usually, but building requested section) */}
            <aside className="w-64 bg-[#111827] text-white hidden lg:flex flex-col sticky top-0 h-screen border-r border-white/5">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <Shield className="h-6 w-6" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic">ADMIN PANEL</span>
                    </div>

                    <nav className="space-y-2">
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-bold transition-all border border-white/10">
                            <LayoutDashboard className="h-5 w-5 text-orange-500" />
                            Dashboard
                        </Link>
                        <Link to="/admin/student-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">
                            <Users className="h-5 w-5" />
                            Manage Students
                        </Link>
                        <Link to="/admin/course-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">
                            <BookOpen className="h-5 w-5" />
                            Manage Courses
                        </Link>
                        <Link to="/admin/question-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">
                            <HelpCircle className="h-5 w-5" />
                            Question Bank
                        </Link>
                    </nav>

                    <div className="mt-12">
                        <Link to="/admin/teacher-approvals" className="flex items-center justify-between px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all group">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5" />
                                {stats.pendingTeachers > 0 ? 'Waitlist' : 'Pending'}
                            </div>
                            {stats.pendingTeachers > 0 && (
                                <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] rounded-full animate-pulse">
                                    {stats.pendingTeachers}
                                </span>
                            )}
                        </Link>
                        <Link to="/admin/teacher-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">
                            <GraduationCap className="h-5 w-5" />
                            Manage Teachers
                        </Link>
                        <Link to="/admin/support" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">
                            <HelpCircle className="h-5 w-5" />
                            Helpdesk
                        </Link>
                    </div>
                </div>

                <div className="mt-auto p-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center font-black">
                            {adminName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-black truncate">{adminName}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Admin Access</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2 font-black text-orange-600 uppercase tracking-widest text-[10px]">
                        <span className="h-1 w-8 bg-orange-600 rounded-full"></span>
                        Admin Dashboard
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">System Overview</h1>
                </header>

                {/* 1. Overview Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Registered Students */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Students</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.students}</p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">TOTAL</span>
                            </div>
                            <Link to="/admin/registered-students" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                View List <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    <div className={`p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all group overflow-hidden relative border ${stats.pendingTeachers > 0 ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${stats.pendingTeachers > 0 ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stats.pendingTeachers > 0 ? 'text-white/70' : 'text-gray-400'}`}>Pending</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <p className="text-3xl font-black leading-none">{stats.pendingTeachers}</p>
                                <span className={`text-[10px] font-bold uppercase tracking-widest pb-1 ${stats.pendingTeachers > 0 ? 'text-white/60' : 'text-gray-400'}`}>Waitlist</span>
                            </div>
                            <Link to="/admin/teacher-approvals" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all ${stats.pendingTeachers > 0 ? 'text-white hover:text-white/80' : 'text-orange-600'}`}>
                                Manage Requests <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Total Teachers (Shown smaller or secondary if pending exists) */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teachers</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.teachers}</p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">STAFF</span>
                            </div>
                            <Link to="/admin/teacher-management" className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                Manage Pool <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Total Courses */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Courses</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.courses}</p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">LIVE</span>
                            </div>
                            <Link to="/admin/course-management" className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                View Gallery <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Available Questions */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Questions</h3>
                            <div className="flex items-end gap-2 mb-4">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.questions}</p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">BANK</span>
                            </div>
                            <Link to="/admin/question-management" className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                View Gallery <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Actions Row - Small, Horizontal Line */}
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Quick Operations</h2>
                <div className="flex flex-wrap lg:flex-nowrap gap-4 mb-16">
                    <Link to="/admin/registered-students" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Manage Students</span>
                    </Link>

                    <Link to="/admin/student-performance" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Performance Tracking</span>
                    </Link>

                    <Link to="/admin/teacher-management" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-600/20 group-hover:rotate-12 transition-transform">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Staff Directory</span>
                    </Link>

                    <Link to="/admin/teacher-approvals" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Pending Requests</span>
                        {stats.pendingTeachers > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </Link>

                    <Link to="/admin/support" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-600/20 group-hover:rotate-12 transition-transform">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Helpdesk</span>
                    </Link>

                    <Link to="/admin/create-course" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-green-600/20 group-hover:rotate-12 transition-transform">
                            <PlusCircle className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Add Courses</span>
                    </Link>

                    <Link to="/admin/question-management" className="flex-1 min-w-[160px] flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider text-center">Add Questions</span>
                    </Link>
                </div>

                {/* Footer Dashboard Shortcut Section */}
                <footer className="bg-[#111827] text-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px] -mr-48 -mb-48"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <Users className="h-6 w-6 text-orange-500" />
                                Student Section
                            </h3>
                            <p className="text-gray-400 font-medium text-sm mb-6">Centralized control for student enrollment and academic performance tracking.</p>
                            <div className="grid grid-cols-1 gap-4">
                                <Link to="/admin/course-management" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
                                    <span className="font-bold">Manage Courses</span>
                                    <ArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/admin/question-management" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
                                    <span className="font-bold">Question Bank</span>
                                    <ArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <GraduationCap className="h-6 w-6 text-indigo-400" />
                                Teacher Section
                            </h3>
                            <p className="text-gray-400 font-medium text-sm mb-6">Administer teacher accounts, approval requests, and instructional material logs.</p>
                            <div className="grid grid-cols-1 gap-4">
                                <Link to="/admin/teacher-management" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">Staff Directory</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Manage Teachers</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <Link to="/admin/teacher-approvals" className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col text-white">
                                        <span className="font-bold">Authorization Hub</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">New Registration Requests</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {stats.pendingTeachers > 0 && (
                                            <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black rounded-lg">
                                                {stats.pendingTeachers} PENDING
                                            </span>
                                        )}
                                        <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default AdminDashboard
