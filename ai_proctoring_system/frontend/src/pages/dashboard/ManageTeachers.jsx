import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    GraduationCap,
    ChevronLeft,
    Search,
    UserCheck,
    Trash2,
    Phone,
    Mail,
    Loader2,
    MapPin,
    Users
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const [fetchError, setFetchError] = useState(null)

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            setLoading(true)
            setFetchError(null)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'teacher')

            if (error) throw error

            const normalized = (data || []).map(t => ({
                ...t,
                first_name: t.first_name || t.user_metadata?.first_name || '',
                last_name: t.last_name || t.user_metadata?.last_name || '',
                contact_number: t.contact_number || t.user_metadata?.contact_number || '',
                address: t.address || t.user_metadata?.address || ''
            }))

            setTeachers(normalized)
        } catch (error) {
            console.error('Error fetching teachers:', error)
            setFetchError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently remove this teacher? This cannot be undone.')) return
        setDeletingId(id)
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id)

            if (error) throw new Error(`Delete failed: ${error.message}`)

            // Verify it's actually gone (check for RLS silent block)
            const { data: checkData } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', id)
                .single()

            if (checkData) {
                throw new Error('Delete was blocked by database policy. Please grant DELETE permission on the profiles table in Supabase.')
            }

            setTeachers(prev => prev.filter(t => t.id !== id))
            alert('Teacher removed successfully.')
        } catch (error) {
            console.error('Delete error:', error)
            alert('⚠️ ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredTeachers = teachers.filter(t => {
        const term = searchTerm.toLowerCase()
        return !term ||
            (t.email || '').toLowerCase().includes(term) ||
            (t.first_name || '').toLowerCase().includes(term) ||
            (t.last_name || '').toLowerCase().includes(term) ||
            (t.contact_number || '').includes(term)
    })

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex font-sans">
            {/* Sidebar */}
            <aside className="w-24 bg-[#0F172A] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/dashboard" className="p-4 bg-white/5 rounded-3xl text-orange-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                    <GraduationCap className="h-6 w-6" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {/* Header */}
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-purple-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-purple-600 rounded-full"></span>
                            Teacher Management
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Staff Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 italic">
                            All teachers registered via the Teacher Module — fetched in real-time.
                        </p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-purple-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 dark:text-gray-300 shadow-sm min-w-[320px]"
                        />
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Users className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Teachers</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{teachers.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <UserCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {teachers.filter(t => t.is_approved).length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Phone className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">With Contact</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {teachers.filter(t => t.contact_number).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-6 w-6 text-purple-600" />
                            Teacher Registry
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
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <Loader2 className="animate-spin h-8 w-8 text-purple-600 mx-auto" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Loading Teacher Registry...</p>
                                        </td>
                                    </tr>
                                ) : fetchError ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <p className="text-red-500 font-bold">Error: {fetchError}</p>
                                            <button onClick={fetchTeachers} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all">
                                                Retry
                                            </button>
                                        </td>
                                    </tr>
                                ) : filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <GraduationCap className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest">No teachers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((teacher, idx) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-950/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-500/20">
                                                        {(teacher.email?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                                                        {teacher.email || 'No email'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 font-black text-gray-800 dark:text-gray-200">
                                                    <Phone className="h-4 w-4 text-purple-400 shrink-0" />
                                                    {teacher.contact_number
                                                        ? <span>{teacher.contact_number}</span>
                                                        : <span className="text-gray-300 font-medium italic">Not provided</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 shrink-0 text-gray-300" />
                                                    <span className="truncate max-w-[160px]">{teacher.address || <span className="italic text-gray-300">Not provided</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {teacher.is_approved ? (
                                                    <span className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 w-fit mx-auto">
                                                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 w-fit mx-auto">
                                                        <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                    </span>
                                                )}
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
                                                        onClick={() => handleDelete(teacher.id)}
                                                        disabled={deletingId === teacher.id}
                                                        className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {deletingId === teacher.id
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

                    {/* Footer */}
                    {!loading && filteredTeachers.length > 0 && (
                        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-purple-50/30 dark:bg-gray-900/50 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Showing {filteredTeachers.length} of {teachers.length} registered teachers
                            </p>
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                Data synced from Teacher Module
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ManageTeachers
