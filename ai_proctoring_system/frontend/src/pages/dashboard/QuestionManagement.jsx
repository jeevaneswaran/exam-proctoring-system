import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    HelpCircle,
    ChevronLeft,
    Plus,
    Database,
    Lightbulb,
    ArrowRight,
    FileText,
    Settings
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const QuestionManagement = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('exams')
                .select('*, questions(count)')
                .order('created_at', { ascending: false })

            if (data) {
                const formatted = data.map(c => ({
                    ...c,
                    total_questions: c.questions?.[0]?.count || 0
                }))
                setCourses(formatted)
            }
            if (error) throw error
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            <header className="mb-10 flex items-center gap-4">
                <Link to="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-all">
                    <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">System Question Bank</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Browse and manage question banks categorized by course</p>
                </div>
            </header>

            {/* Quick Access Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-16 w-16 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                        <Plus className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Add New Question</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Inject new multiple-choice questions into specific courses.</p>
                    <Link
                        to="/admin/create-question"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
                    >
                        Get Started
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-16 w-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                        <Database className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Explore Question Bank</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Access the complete repository of questions categorized by course sets.</p>
                    <a
                        href="#question-bank"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20"
                    >
                        Browse Bank
                        <ArrowRight className="h-5 w-5" />
                    </a>
                </div>
            </div>

            {/* Management Tips */}
            <div className="bg-[#111827] text-white p-10 rounded-[40px] mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Lightbulb className="h-8 w-8 text-yellow-400" />
                        <h2 className="text-2xl font-black">Question Management Tips</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-black text-orange-400 mb-2 text-sm uppercase">Categorization</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">Always assign questions to the correct course to ensure student evaluation is accurate.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-black text-orange-400 mb-2 text-sm uppercase">Marking Scheme</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">Define clear marks per question. Standardize marks across similar difficulty levels.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-black text-orange-400 mb-2 text-sm uppercase">Quality Check</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">Regularly review question sets to remove duplicates or outdated curriculum content.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="font-black text-orange-400 mb-2 text-sm uppercase">Proctoring</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">Ensure questions are formatted correctly for the proctoring engine to display properly.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Bank Sector */}
            <div id="question-bank" className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-12">
                <div className="p-10 border-b border-gray-50 bg-purple-50/50">
                    <div className="flex items-center gap-3 mb-2 font-black text-purple-600 uppercase tracking-widest text-[10px]">
                        <span className="h-1 w-8 bg-purple-600 rounded-full"></span>
                        Central Repository
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Active Question Banks</h2>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div></div>
                    ) : courses.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No question banks found</div>
                    ) : (
                        courses.map((course) => (
                            <div key={course.id} className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col">
                                <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <Database className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 font-black">{course.title}</h3>
                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                        <span>Items in Bank</span>
                                        <span className="text-purple-600">{course.total_questions} Questions</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                        <span>Bank Integrity</span>
                                        <span className="text-green-600">Active</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/admin/course-questions/${course.id}`}
                                    className="mt-auto w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-purple-600 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/btn shadow-xl shadow-gray-900/10"
                                >
                                    Give Questions
                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestionManagement
