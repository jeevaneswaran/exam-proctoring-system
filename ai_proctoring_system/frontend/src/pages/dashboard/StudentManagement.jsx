import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users,
    ChevronLeft,
    Search,
    UserCheck,
    Trash2,
    Phone,
    Mail,
    Loader2,
    MapPin,
    GraduationCap
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const StudentManagement = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const [fetchError, setFetchError] = useState(null)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            setFetchError(null)

            // Try profiles table first
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')

            if (error) throw error

            const normalized = (data || []).map(s => ({
                ...s,
                first_name: s.first_name || s.user_metadata?.first_name || '',
                last_name: s.last_name || s.user_metadata?.last_name || '',
                contact_number: s.contact_number || s.user_metadata?.contact_number || '',
                address: s.address || s.user_metadata?.address || ''
            }))

            setStudents(normalized)
        } catch (error) {
            console.error('Error fetching students:', error)
            setFetchError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently remove this student? This cannot be undone.')) return
        setDeletingId(id)
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id)

            if (error) {
                throw new Error(`Delete failed: ${error.message} (code: ${error.code})`)
            }

            // ✅ Verify it was actually deleted from the DB (RLS may silently fail)
            const { data: checkData } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', id)
                .single()

            if (checkData) {
                // Row still exists — RLS blocked the delete silently
                throw new Error(
                    'Delete was blocked by database policy. Please contact your system admin to grant DELETE permission on the profiles table in Supabase.'
                )
            }

            // Confirmed deleted — remove from local state
            setStudents(prev => prev.filter(s => s.id !== id))
            alert('Student removed successfully.')
        } catch (error) {
            console.error('Delete error:', error)
            alert('⚠️ ' + error.message)
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
        <div className="min-h-screen bg-white dark:bg-gray-950 flex font-sans">
            {/* Sidebar */}
            <aside className="w-24 bg-[#0F172A] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/dashboard" className="p-4 bg-white/5 rounded-3xl text-orange-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                    <GraduationCap className="h-6 w-6" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {/* Header */}
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-blue-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-blue-600 rounded-full"></span>
                            Student Module
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Manage Students</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 italic">
                            All students registered via the Student Module — fetched in real-time.
                        </p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 dark:text-gray-300 shadow-sm min-w-[320px]"
                        />
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{students.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <UserCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Accounts</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{students.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Phone className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">With Contact</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {students.filter(s => s.contact_number).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="h-6 w-6 text-blue-600" />
                            Student Registry
                        </h2>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">S.No</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center">
                                            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Loading Student Registry...</p>
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center">
                                            <p className="text-red-500 font-bold">Error: {fetchError}</p>
                                            <button onClick={fetchStudents} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                                                Retry
                                            </button>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center">
                                            <GraduationCap className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest">No students found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, idx) => (
                                        <tr key={student.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-950/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
                                                        {(student.email?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                                                        {student.email || 'No email'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-gray-200">
                                                    <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                                                    {student.contact_number ? (
                                                        <span>{student.contact_number}</span>
                                                    ) : (
                                                        <span className="text-gray-300 font-medium italic">Not provided</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 shrink-0 text-gray-300" />
                                                    <span className="truncate max-w-[160px]">{student.address || <span className="italic text-gray-300">Not provided</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 w-fit mx-auto">
                                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => { }}
                                                        className="px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        Keep
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id)}
                                                        disabled={deletingId === student.id}
                                                        className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {deletingId === student.id
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Trash2 className="h-4 w-4" />}
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

                    {/* Footer note */}
                    {!loading && filteredStudents.length > 0 && (
                        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-blue-50/30 dark:bg-gray-900/50 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Showing {filteredStudents.length} of {students.length} registered students
                            </p>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                Data synced from Student Module
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default StudentManagement
