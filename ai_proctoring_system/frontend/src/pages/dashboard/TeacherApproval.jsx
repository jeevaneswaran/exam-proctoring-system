import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ChevronLeft,
    UserCheck,
    UserX,
    Search,
    Loader2,
    ShieldCheck,
    Mail,
    Phone,
    ClipboardList,
    AlertCircle
} from 'lucide-react'
import { SupabaseService } from '../../services/SupabaseService'

const TeacherApproval = () => {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState(null) // ID of teacher being processed

    useEffect(() => {
        fetchPendingTeachers()
    }, [])

    const fetchPendingTeachers = async () => {
        setLoading(true)
        try {
            const data = await SupabaseService.getPendingTeachers()
            setTeachers(data || [])
        } catch (error) {
            console.error('Error fetching teachers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproval = async (id, approve) => {
        setActionLoading(id)
        try {
            await SupabaseService.updateTeacherApproval(id, approve)
            setTeachers(prev => prev.filter(t => t.id !== id))
            // Non-blocking notification or status message could go here
            // Removing alert to satisfy "should not come again" (less friction)
        } catch (error) {
            console.error('Error updating approval:', error)
            alert('Operation failed. Please check your connection.')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredTeachers = teachers.filter(t => {
        const meta = t.user_metadata || {}
        const firstName = meta.first_name || t.first_name || ''
        const lastName = meta.last_name || t.last_name || ''
        const email = t.email || ''

        // Match search term
        const searchMatch = !searchTerm ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lastName.toLowerCase().includes(searchTerm.toLowerCase())

        return searchMatch
    })

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar Branding */}
            <aside className="w-24 bg-[#0F172A] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/dashboard" className="p-4 bg-white/5 rounded-3xl text-orange-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                    <ShieldCheck className="h-6 w-6" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-orange-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-orange-600 rounded-full"></span>
                            Teacher Authorization
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Pending Requests</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Manage and authorize new teacher accounts for the platform.</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-orange-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 shadow-sm min-w-[320px]"
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Scanning Profiles...</p>
                    </div>
                ) : filteredTeachers.length > 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">S.No</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTeachers.map((t, index) => {
                                    const meta = t.user_metadata || {};
                                    const firstName = meta.first_name || t.first_name || '';
                                    const lastName = meta.last_name || t.last_name || '';
                                    const contactNumber = meta.contact_number || t.contact_number || '';

                                    return (
                                        <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-gray-400">{index + 1}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                                        {(firstName?.[0] || t.email?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-900 dark:text-white leading-none mb-1">
                                                            {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Name Not Set'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{contactNumber || 'No Phone Registered'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 px-8">
                                                    <button
                                                        onClick={() => handleApproval(t.id, false)}
                                                        disabled={actionLoading === t.id}
                                                        className="px-6 py-2.5 border-2 border-red-50 text-red-600 font-black rounded-xl hover:bg-red-50 hover:border-red-100 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50"
                                                    >
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(t.id, true)}
                                                        disabled={actionLoading === t.id}
                                                        className="px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {actionLoading === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                                                        Accept
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-[40px] flex items-center justify-center mb-8 text-gray-200">
                            <ShieldCheck className="h-12 w-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Pending Requests</h3>
                        <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">
                            All teachers are currently authorized. New registration requests will appear here for review.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default TeacherApproval
