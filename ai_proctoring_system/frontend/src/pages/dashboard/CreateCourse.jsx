import { useState } from 'react'
import {
    PlusCircle,
    ArrowRight,
    XCircle,
    Book,
    Layers,
    Target,
    ChevronLeft
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const CreateCourse = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [courseName, setCourseName] = useState('')
    const [totalQuestions, setTotalQuestions] = useState('')
    const [totalMarks, setTotalMarks] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase
                .from('exams')
                .insert([{
                    title: courseName,
                    duration_minutes: 60, // Default duration
                    created_by: user?.id,
                    description: `Course: ${courseName}. Targeted for ${totalQuestions} questions and ${totalMarks} marks.`
                }])

            if (error) throw error
            alert('Course information saved successfully!')
            navigate('/admin/course-management')
        } catch (error) {
            console.error('Error creating course:', error)
            alert('Failed to save course. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex student-theme">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#111827] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl">
                <Link to="/admin/course-management" className="p-3 bg-white/5 rounded-2xl text-orange-500 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-5xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full mb-4 font-black">
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest text-[10px]">Administrative Action</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Add New Course</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 lowercase tracking-widest leading-relaxed">
                        Configure a new examination track with specific marking criteria
                    </p>
                </header>

                {/* Form Section */}
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl relative animate-slide-up">
                    <div className="mb-12 border-b border-gray-50 pb-8">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Course Information</h3>
                        <p className="text-sm font-bold text-gray-400 lowercase tracking-tight italic">
                            Fill in all parameters below to initialize the course in the system bank
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 gap-10">
                            {/* Course Name */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest ml-1">Course Name</label>
                                <div className="group relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-orange-500">
                                        <Book className="h-6 w-6" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        placeholder="Course title (e.g. Fundamental Physics)"
                                        className="block w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-950 border-2 border-transparent rounded-[24px] text-gray-900 dark:text-white font-black placeholder:text-gray-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Total Questions */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest ml-1">Total Questions</label>
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-orange-500">
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={totalQuestions}
                                            onChange={(e) => setTotalQuestions(e.target.value)}
                                            placeholder="Enter numbers (e.g. 25)"
                                            className="block w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-950 border-2 border-transparent rounded-[24px] text-gray-900 dark:text-white font-black placeholder:text-gray-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Total Marks */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest ml-1">Total Marks</label>
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-orange-500">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={totalMarks}
                                            onChange={(e) => setTotalMarks(e.target.value)}
                                            placeholder="Enter numbers (e.g. 100)"
                                            className="block w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-950 border-2 border-transparent rounded-[24px] text-gray-900 dark:text-white font-black placeholder:text-gray-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-10 flex flex-col sm:flex-row gap-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-6 bg-gray-900 text-white font-black rounded-[24px] shadow-2xl shadow-gray-900/20 hover:bg-orange-600 hover:shadow-orange-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <PlusCircle className="h-6 w-6" />
                                        Add New Course
                                        <ArrowRight className="h-6 w-6" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/admin/course-management')}
                                className="px-10 py-6 bg-red-50 text-red-600 font-black rounded-[24px] hover:bg-red-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <XCircle className="h-6 w-6" />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default CreateCourse
