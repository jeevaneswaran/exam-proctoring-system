import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    BookOpen,
    ChevronLeft,
    Plus,
    Layers,
    HelpCircle,
    Info,
    Edit,
    Trash2,
    ArrowRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const CourseManagement = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('exams') // Storing courses as 'exams' in the schema based on previous code
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

    const deleteCourse = async (id) => {
        if (!confirm('Are you sure you want to delete this course and all its questions?')) return
        try {
            const { error } = await supabase.from('exams').delete().eq('id', id)
            if (error) throw error
            setCourses(courses.filter(c => c.id !== id))
            alert('Course deleted successfully')
        } catch (error) {
            alert('Error deleting course: ' + error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            <header className="mb-10 flex items-center gap-4">
                <Link to="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-all">
                    <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Course Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Add new courses and manage existing ones in the system</p>
                </div>
            </header>

            {/* Quick Access Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                        <Plus className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Add New Courses</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Create new curriculum structures with specific marking schemes.</p>
                    <Link
                        to="/admin/create-course"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                    >
                        Get Started
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-16 w-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                        <Layers className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">View All Courses</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Browse the complete library of courses currently available in the system.</p>
                    <a
                        href="#course-list"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                    >
                        View Courses
                        <ArrowRight className="h-5 w-5" />
                    </a>
                </div>
            </div>

            {/* Management Guide */}
            <div className="bg-[#111827] text-white p-10 rounded-[40px] mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Info className="h-8 w-8 text-orange-500" />
                        <h2 className="text-2xl font-black">Course Management Guide</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                <Plus className="h-6 w-6 text-orange-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed pt-1">
                                <span className="text-white font-bold block mb-1">Add Courses</span>
                                Create courses with specific question counts and total marks allocation.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                <Edit className="h-6 w-6 text-orange-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed pt-1">
                                <span className="text-white font-bold block mb-1">Edit Existing</span>
                                Update course details, titles, and modify update marking schemes as needed.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                <Trash2 className="h-6 w-6 text-orange-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed pt-1">
                                <span className="text-white font-bold block mb-1">Delete Courses</span>
                                Remove obsolete courses that are no longer needed for examinations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course List / Management Table */}
            <div id="course-list" className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Available Courses</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Total: {courses.length} courses</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Course Name</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total Qns</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total Marks</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : courses.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No courses found</td></tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-900 dark:text-white">{course.title}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-sm">
                                                {course.total_questions} Questions
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-black text-sm">
                                                100 Marks
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCourse(course.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default CourseManagement
