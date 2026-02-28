import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    UserCircle,
    BarChart3,
    ArrowRight,
    Trophy
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const StudentPerformance = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false })

            if (data) setStudents(data)
            if (error) throw error
        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            <header className="mb-10 flex items-center gap-4">
                <Link to="/admin/student-management" className="p-2 hover:bg-gray-200 rounded-full transition-all">
                    <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Student Performance Records</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium italic lowercase tracking-wider mt-1">
                        View exam marks and performance all the registered students
                    </p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-orange-500" />
                        Academic Performance Overview
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Profile Photo</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">No data available</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-gray-900 dark:text-white font-black">{student.first_name} {student.last_name}</p>
                                            <p className="text-xs text-gray-400 font-medium tracking-tight">{student.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {student.profile_picture ? (
                                                <img
                                                    src={student.profile_picture}
                                                    alt={student.first_name}
                                                    className="h-10 w-10 rounded-xl object-cover shadow-sm ring-2 ring-orange-50"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <UserCircle className="h-6 w-6" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <Link
                                                to={`/admin/student-exam-results/${student.id}`}
                                                className="inline-flex items-center gap-2 px-6 py-2 bg-[#111827] text-white font-bold rounded-xl hover:bg-orange-600 transition-all text-xs group shadow-lg shadow-gray-900/10 hover:shadow-orange-600/20"
                                            >
                                                View Marks
                                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                            </Link>
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

export default StudentPerformance
