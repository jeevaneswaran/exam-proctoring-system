import { useState } from 'react'
import {
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    ChevronLeft,
    BookOpen,
    Filter
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ViewCourses = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    // Mock data for demonstration
    const [courses] = useState([
        { id: 1, name: 'Advanced Mathematics 101', questions: 50, marks: 100 },
        { id: 2, name: 'Physics Midterm 2024', questions: 40, marks: 80 },
        { id: 3, name: 'Computer Science Basics', questions: 30, marks: 60 },
        { id: 4, name: 'World History Overview', questions: 45, marks: 90 },
        { id: 5, name: 'Business Ethics Final', questions: 25, marks: 50 },
    ])

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl">
                <Link to="/teacher/manage-courses" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 font-bold text-amber-600 uppercase tracking-widest text-xs">
                            <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                            Course Manage
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Examination Management</h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 lowercase tracking-widest leading-relaxed">
                            view and manage all your examinations courses
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 px-8 py-5 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="text-center border-r border-orange-100 pr-6">
                            <p className="text-3xl font-black text-amber-600">{courses.length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Courses Available</p>
                        </div>
                        <div className="pl-2">
                            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Toolbar Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 animate-slide-up">
                    <div className="relative w-full md:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="search for finding the course..."
                            className="block w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-2 border-orange-50 rounded-[24px] text-gray-900 dark:text-white font-bold placeholder:text-gray-300 focus:outline-none focus:border-amber-600 transition-all shadow-sm group-hover:shadow-md"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm">
                            <Filter className="h-5 w-5" />
                            Filters
                        </button>
                        <button
                            onClick={() => navigate('/teacher/create-course')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-amber-700 hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Add New Courses
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">S.No</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Course Name</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Total Question</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Total Marks</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCourses.map((course, index) => (
                                    <tr key={course.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-400 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all font-black border border-transparent group-hover:border-indigo-100 shadow-sm">
                                                    {course.name.charAt(0)}
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-bold text-base tracking-tight">{course.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-black">
                                                {course.questions} Qs
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-gray-900 dark:text-white font-black text-base">{course.marks}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-amber-100 shadow-sm" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-emerald-100 shadow-sm" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-rose-100 shadow-sm" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="p-20 text-center bg-gray-50/30">
                            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 text-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No courses found</h3>
                            <p className="text-gray-400 font-medium lowercase">try searching with a different keyword</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ViewCourses
