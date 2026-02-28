import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Users,
    ChevronLeft,
    Search,
    UserCircle,
    UserCheck,
    Trash2,
    Phone,
    Mail,
    Loader2,
    MapPin
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const RegisteredStudents = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            // Try fetching from auth.users via admin API; fallback to profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
            // No .order('created_at') — may not exist on all schemas

            if (data) {
                // Normalize — merge user_metadata fields if present
                const normalized = data.map(s => ({
                    ...s,
                    first_name: s.first_name || s.user_metadata?.first_name || '',
                    last_name: s.last_name || s.user_metadata?.last_name || '',
                    contact_number: s.contact_number || s.user_metadata?.contact_number || '',
                    address: s.address || s.user_metadata?.address || ''
                }))
                setStudents(normalized)
            }
            if (error) throw error
        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this student? This cannot be undone.')) return
        setDeletingId(id)
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id)
            if (error) throw error
            setStudents(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            alert('Error deleting student: ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredStudents = students.filter(s => {
        const name = `${s.first_name} ${s.last_name}`.toLowerCase()
        const term = searchTerm.toLowerCase()
        return !term ||
            name.includes(term) ||
            (s.email || '').toLowerCase().includes(term) ||
            (s.contact_number || '').includes(term)
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 student-theme">
            <header className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <Link to="/admin/student-management" className="p-2 hover:bg-gray-200 rounded-full transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Registered Students</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Detailed list of students registered via the Student Module (Email Accounts)</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Students</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">{students.length}</p>
                    </div>
                </div>
            </div>

            {/* Search and List */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Student List</h2>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-950 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">S.No</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contact Number</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Address</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin h-8 w-8 border-t-transparent rounded-full mx-auto text-blue-600" />
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">No students found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-gray-400">{idx + 1}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {student.profile_picture ? (
                                                    <img
                                                        src={student.profile_picture}
                                                        alt={student.first_name}
                                                        className="h-12 w-12 rounded-2xl object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm">
                                                        {(student.first_name?.[0] || student.email?.[0] || '?').toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-black">
                                                        {student.first_name || student.last_name
                                                            ? `${student.first_name} ${student.last_name}`.trim()
                                                            : 'Name Missing'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                                        <Mail className="h-3 w-3" />
                                                        {student.email || 'No email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                                                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>{student.contact_number || 'Not provided'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate max-w-[180px]">{student.address || 'Not provided'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                                                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => navigate(`/admin/student-exam-results/${student.id}`)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    disabled={deletingId === student.id}
                                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    {deletingId === student.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
                                                    Delete
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

            {/* Notification Bar */}
            <div className="mt-8 bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-white font-black text-xs uppercase tracking-widest">Database Synchronization Active</p>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Real-time data fetched from Student Module</p>
                    </div>
                </div>
                <div className="px-6 py-2 bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Originally registered through E-mail
                </div>
            </div>
        </div>
    )
}

export default RegisteredStudents
