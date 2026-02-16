import {
    BookOpen,
    PlusCircle,
    Layers,
    CheckSquare,
    ArrowRight,
    Bell,
    Settings,
    Search,
    ChevronLeft
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ManageCourses = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Sidebar (Placeholder or Link back) */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl">
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
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">New Page</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Exam Management</h1>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest leading-relaxed">
                        Create new courses, manage existing exam and organize your educational content effectively
                    </p>
                </header>

                {/* Animated Notification Box */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8 rounded-[32px] text-white shadow-2xl shadow-orange-500/20 mb-12 relative overflow-hidden group animate-slide-up">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-start gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                            <Bell className="h-7 w-7 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-2 tracking-tight">Notification: Course and Exam Management</h3>
                            <p className="text-white/80 font-medium leading-relaxed max-w-3xl">
                                Add new courses to create structured exam view and manage your existing courses to track student progress and update content. These tools are designed to streamline your educational workflow.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Management Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add New Course Box */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                        <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12 shadow-sm">
                            <PlusCircle className="h-8 w-8" />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Add New Course</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                            Create a new course with custom exam parameters and settings for your student
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3 p-4 bg-amber-50/30 rounded-2xl border border-amber-50 text-gray-600 font-bold text-sm">
                                <CheckSquare className="h-5 w-5 text-amber-600" />
                                <span>Set course name and details</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-amber-50/30 rounded-2xl border border-amber-50 text-gray-600 font-bold text-sm">
                                <CheckSquare className="h-5 w-5 text-amber-600" />
                                <span>Define total question</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/teacher/create-course')}
                            className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black hover:shadow-2xl transition-all flex items-center justify-center gap-3 group/btn"
                        >
                            Create a New Course
                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* View All Box */}
                    <div className="bg-[#1A1612] p-10 rounded-[40px] shadow-2xl shadow-black/40 text-white hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border border-white/5">
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl group-hover:bg-amber-600/30 transition-all duration-700"></div>

                        <div className="h-16 w-16 rounded-2xl bg-white/10 text-amber-500 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 group-hover:-rotate-12 shadow-xl shadow-black/20">
                            <Layers className="h-8 w-8" />
                        </div>

                        <h2 className="text-3xl font-black mb-2 tracking-tight">View All Courses</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10 leading-relaxed">
                            Browse, edit and manage all your existing courses and exam configuration in one intelligent dashboard
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Total Exams</p>
                                <p className="text-2xl font-black text-amber-500">24</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Active</p>
                                <p className="text-2xl font-black text-orange-500">08</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/teacher/view-courses')}
                            className="w-full py-5 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                        >
                            View All Sections
                            <ArrowRight className="h-5 w-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ManageCourses
