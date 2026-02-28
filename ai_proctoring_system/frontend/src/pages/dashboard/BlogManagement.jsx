import {
    PenTool,
    BookOpen,
    ChevronLeft,
    Info,
    Sparkles,
    CheckCircle2,
    PlusCircle,
    LayoutList,
    Edit3,
    Trash2,
    ArrowRight,
    MessageSquare,
    Image as ImageIcon,
    Type
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const BlogManagement = () => {
    const navigate = useNavigate()

    const bestPractices = [
        "Create compiling titles that captures attention and clearly convey the topic",
        "Use engaging visuals and images to complement your written content",
        "Write in a clear personal tone that resonate with students"
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/teacher/dashboard" className="p-3 bg-white/5 rounded-2xl text-emerald-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2 font-bold text-emerald-600 uppercase tracking-widest text-xs">
                        <span className="h-1 w-8 bg-emerald-600 rounded-full"></span>
                        Content Creator
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Blog Management</h1>
                    <p className="text-sm font-medium text-gray-400 lowercase tracking-wider leading-relaxed">
                        great engaging blog posts to share knowledge and insights with your students
                    </p>
                </header>

                {/* Engagement Notice Bar */}
                <div className="bg-[#1A1612] p-8 rounded-[32px] border border-white/5 shadow-2xl mb-10 relative overflow-hidden group animate-slide-up">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                            <MessageSquare className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white mb-1">Knowledge Sharing Hub</p>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                share educational articles tips and updates through your blog engage students with valuable content beyond the classroom
                            </p>
                        </div>
                    </div>
                </div>

                {/* Blog Writing Best Practices */}
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-orange-100 shadow-xl mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight lowercase flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                                blog writing best practices
                            </h2>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">Quality Guidelines</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {bestPractices.map((text, i) => (
                            <div key={i} className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-50 hover:border-emerald-200 transition-all flex flex-col gap-4">
                                <div className="h-10 w-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                                    <div className="text-emerald-600 font-black text-lg">{i + 1}</div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-tight">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {/* Create Box */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[32px] shadow-xl shadow-emerald-950/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all duration-700"></div>

                        <div className="h-12 w-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                            <PlusCircle className="h-6 w-6" />
                        </div>

                        <h2 className="text-2xl font-black mb-1 tracking-tight">Create Blog Post</h2>
                        <p className="text-xs font-bold text-emerald-50 uppercase tracking-widest mb-6 leading-relaxed opacity-90">
                            Share educational articles and tips
                        </p>

                        <button
                            onClick={() => navigate('/teacher/create-blog')}
                            className="w-full py-4 bg-white dark:bg-gray-900 text-emerald-700 font-black rounded-xl shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 group/btn"
                        >
                            Create Blog Post
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* View/Access Box */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] shadow-xl shadow-indigo-950/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden text-white">
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>

                        <div className="h-12 w-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                            <LayoutList className="h-6 w-6" />
                        </div>

                        <h2 className="text-2xl font-black mb-1 tracking-tight">View All Posts</h2>
                        <p className="text-xs font-bold text-indigo-50 uppercase tracking-widest mb-6 leading-relaxed opacity-90">
                            Manage and update published blogs
                        </p>

                        <button
                            onClick={() => navigate('/teacher/manage-blogs')}
                            className="w-full py-4 bg-white dark:bg-gray-900 text-indigo-700 font-black rounded-xl shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
                        >
                            View All Blog Posts
                            <LayoutList className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BlogManagement
