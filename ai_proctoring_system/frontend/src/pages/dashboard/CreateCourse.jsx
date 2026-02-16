import { useState } from 'react'
import {
    PlusCircle,
    ArrowRight,
    XCircle,
    Info,
    Book,
    Layers,
    Target,
    ClipboardCheck,
    ChevronLeft
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const CreateCourse = () => {
    const navigate = useNavigate()
    const [courseName, setCourseName] = useState('')
    const [totalQuestions, setTotalQuestions] = useState('')
    const [totalMarks, setTotalMarks] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission logic here
        console.log({ courseName, totalQuestions, totalMarks })
        alert('Course configuration saved!')
        navigate('/teacher/manage-courses')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar for context */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl">
                <Link to="/teacher/manage-courses" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-5xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full mb-4 font-black">
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Create New Course</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Create New Course on Laptop</h1>
                    <p className="text-sm font-medium text-gray-500 lowercase tracking-widest leading-relaxed">
                        set up a new course with the exam configuration and parameters
                    </p>
                </header>

                {/* Sub-header Context Box */}
                <div className="bg-white p-8 rounded-[32px] border border-orange-100 shadow-xl mb-10 relative overflow-hidden group animate-slide-up">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 via-orange-500 to-yellow-500"></div>
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                            <PlusCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed lowercase">
                                filling the course details below to create a new examination course make sure all information is accurate before submitting
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guidelines Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Course Creation Guidelines</h2>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-orange-200 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Book, text: "Choose a clear and descriptive course name that students can easily understand" },
                            { icon: Layers, text: "Set a total number of questions that will be included in the exam" },
                            { icon: Target, text: "Define the total marks that aligns with your grading scheme" },
                            { icon: ClipboardCheck, text: "Review all details carefully before submission you can edit them later" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-orange-100/50 hover:border-amber-200 hover:shadow-md transition-all group">
                                <div className="mt-1 h-8 w-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 lowercase leading-relaxed">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Course Information</h3>
                        <p className="text-xs font-bold text-gray-400 lowercase tracking-widest mb-8">
                            enter the basic details of your new examination course
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            {/* Course Name */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Course Name</label>
                                <div className="group relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Book className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        placeholder="e.g. Advanced Mathematics 101"
                                        className="block w-full pl-12 pr-4 py-5 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Total Questions */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Total Questions</label>
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Layers className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={totalQuestions}
                                            onChange={(e) => setTotalQuestions(e.target.value)}
                                            placeholder="e.g. 50"
                                            className="block w-full pl-12 pr-4 py-5 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Total Marks */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Total Marks</label>
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Target className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={totalMarks}
                                            onChange={(e) => setTotalMarks(e.target.value)}
                                            placeholder="e.g. 100"
                                            className="block w-full pl-12 pr-4 py-5 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                className="flex-1 py-5 bg-[#1A1612] text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                <PlusCircle className="h-5 w-5 text-amber-500" />
                                Create New Course
                                <ArrowRight className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/teacher/manage-courses')}
                                className="px-8 py-5 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                            >
                                <XCircle className="h-5 w-5" />
                                Cancel Exam
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default CreateCourse
