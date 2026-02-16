import {
    Search,
    Plus,
    PlusCircle,
    ChevronLeft,
    BookOpen,
    HelpCircle,
    FileText,
    Layers,
    ArrowRight,
    ClipboardCheck,
    Target,
    Zap,
    AlertCircle,
    BarChart3,
    Trash2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ManageQuestions = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl">
                <Link to="/teacher/dashboard" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2 font-bold text-amber-600 uppercase tracking-widest text-xs">
                        <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                        Management Portal
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Question Bank Management</h1>
                    <p className="text-sm font-medium text-gray-400 lowercase tracking-wider leading-relaxed">
                        create, organize, and manage question banks for comprehensive course assessments
                    </p>
                </header>

                {/* Important Notice Box */}
                <div className="bg-[#1A1612] p-8 rounded-[32px] border border-white/5 shadow-2xl mb-10 relative overflow-hidden group animate-slide-up">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                            <Zap className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white mb-1">Central Repository Control</p>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                Easily manage your question repository—add, edit, and assign questions to courses while customizing marks for each assessment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Best Practices Section */}
                <div className="bg-white p-10 rounded-[40px] border border-orange-100 shadow-xl mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight lowercase">question credential best practices</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <Target className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                                Design clear and unambiguous questions aligned with specific learning objectives.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <Layers className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                                Include realistic distractors in multiple-choice options to accurately assess true understanding.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                                Use varied difficulty levels to distinguish learner performance, and regularly review questions to maintain accuracy and relevance.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <ClipboardCheck className="h-4 w-4" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-tight">
                                Maintain a diverse set of questions across different modules to ensure comprehensive assessment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {/* Add New Questions Box */}
                    <div className="bg-white p-10 rounded-[40px] border border-orange-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12 shadow-sm">
                            <PlusCircle className="h-8 w-8" />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Add New Questions</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 leading-relaxed">
                            Add new questions below create new exam with multiple choice option and assign them to specific courses
                        </p>

                        <button
                            onClick={() => navigate('/teacher/create-question')}
                            className="w-full py-5 bg-[#1A1612] text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 hover:bg-black hover:shadow-2xl transition-all flex items-center justify-center gap-3 group/btn"
                        >
                            Create Question
                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* View All Box */}
                    <div className="bg-[#1A1612] p-10 rounded-[40px] shadow-2xl shadow-black/40 text-white hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border border-white/5">
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl group-hover:bg-amber-600/30 transition-all duration-700"></div>

                        <div className="h-16 w-16 rounded-2xl bg-white/10 text-amber-500 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 group-hover:-rotate-12 shadow-xl shadow-black/20">
                            <Search className="h-8 w-8" />
                        </div>

                        <h2 className="text-3xl font-black mb-2 tracking-tight text-white">View All Questions</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10 leading-relaxed">
                            Browse, edit and manage your quest according to the course. search question by details, remove outdated questions, and view questions statistics.
                        </p>

                        <button
                            onClick={() => navigate('/teacher/view-all-questions')}
                            className="w-full py-5 bg-white text-black font-black rounded-2xl shadow-xl hover:bg-amber-50 transition-all flex items-center justify-center gap-3 shadow-orange-950/10"
                        >
                            Browse Questions
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ManageQuestions
