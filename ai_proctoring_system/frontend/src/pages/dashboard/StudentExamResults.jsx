import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    ChevronLeft,
    Trophy,
    AlertCircle,
    FileText,
    BarChart3,
    GraduationCap,
    Clock,
    UserCircle,
    Calendar
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const StudentExamResults = () => {
    const { studentId } = useParams()
    const [student, setStudent] = useState(null)
    const [results, setResults] = useState([])
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [studentId])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Fetch student info
            const { data: studentData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', studentId)
                .single()
            setStudent(studentData)

            // Fetch results
            const { data: resultsData } = await supabase
                .from('results')
                .select(`
                    *,
                    exams (title, duration_minutes)
                `)
                .eq('student_id', studentId)
            setResults(resultsData || [])

            // Fetch all available exams
            const { data: examsData } = await supabase
                .from('exams')
                .select('*')
            setExams(examsData || [])

        } catch (error) {
            console.error('Error fetching student data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/student-performance" className="p-2 hover:bg-gray-200 rounded-full transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            {student ? `${student.first_name} ${student.last_name}` : 'Student'} Performance
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Detailed exam marks and academic history</p>
                    </div>
                </div>
            </header>

            {/* Assessment Tip Box */}
            <div className="bg-orange-50 border-2 border-orange-100 p-8 rounded-[32px] mb-10 flex gap-6 items-start">
                <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-orange-900 mb-2">Detailed Assessment View</h3>
                    <p className="text-sm font-bold text-orange-800 uppercase tracking-widest leading-relaxed">
                        HOW TO VIEW MARKS: CLICK "VIEW MARKS" CORRESPONDING TO RELEVANT EXAMS TO SEE DETAILED PERFORMANCE SCORES AND ANALYTICS FOR THAT ASSESSMENT.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
                    {student?.profile_picture ? (
                        <img src={student.profile_picture} alt="Profile" className="h-20 w-20 rounded-3xl object-cover shadow-xl" />
                    ) : (
                        <div className="h-20 w-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl">
                            {student?.first_name?.[0] || 'S'}
                        </div>
                    )}
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Examinations</h4>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none mb-1">{results.length}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{student?.email}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Academic Progress</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                        Tracking total examinations taken and performance metrics across all subjects and courses.
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-orange-600">{results.length > 0 ? (results.reduce((a, b) => a + b.score, 0) / results.length).toFixed(1) : 0}%</span>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Aggregate Score</span>
                    </div>
                </div>
            </div>

            {/* Course List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                        Course Performance Records
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Course Name</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total Marks</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Attempts</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Exam Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : results.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">No exam results recorded</td></tr>
                            ) : (
                                results.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-900 dark:text-white">{res.exams?.title || 'Unknown Exam'}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-black text-sm">
                                                {res.score} / 100
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-600 dark:text-gray-300 italic">1 (Session ID: {res.id.slice(0, 4)})</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(res.submitted_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Available Exams Section */}
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Available Examinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-6 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.duration_minutes}m</span>
                            <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> 100 Marks</span>
                        </div>
                        <button className="w-full py-3 bg-indigo-50 text-indigo-600 font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm uppercase tracking-widest">
                            View Analysis
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StudentExamResults
