import { useEffect, useState, useCallback } from 'react'
import {
    ChevronLeft,
    MessageSquare,
    Clock,
    CheckCircle2,
    GraduationCap,
    Users,
    Search,
    Loader2,
    AlertCircle,
    Inbox
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TABS = ['pending', 'resolved']

const TicketCard = ({ ticket, onResolve, showResolve }) => {
    const [resolving, setResolving] = useState(false)

    const handle = async () => {
        setResolving(true)
        await onResolve(ticket.id)
        setResolving(false)
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-400 p-7 flex flex-col gap-5">
            {/* Top Meta */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ticket.category === 'Technical'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : ticket.category === 'Academic'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                    {ticket.category || 'General'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                    <Clock className="h-3 w-3" />
                    {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </span>
                {ticket.status === 'resolved' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px] font-black uppercase tracking-widest ml-auto">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                    </span>
                )}
            </div>

            {/* Subject & Message */}
            <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-snug">{ticket.subject}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-3">{ticket.message}</p>
            </div>

            {/* Sender Badge */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl w-fit">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm">
                    {(ticket.profiles?.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                    <p className="text-xs font-black text-gray-800 dark:text-white leading-none mb-0.5">
                        {ticket.profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {ticket.profiles?.role === 'teacher' ? '🎓 Teacher' : '🎒 Student'}
                    </p>
                </div>
            </div>

            {/* Resolve Button */}
            {showResolve && (
                <button
                    onClick={handle}
                    disabled={resolving}
                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-60"
                >
                    {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
            )}
        </div>
    )
}

const AdminSupport = () => {
    const [allTickets, setAllTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [searchTerm, setSearchTerm] = useState('')

    const fetchTickets = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    profiles:student_id (
                        email,
                        user_metadata,
                        role
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAllTickets(data || [])
        } catch (err) {
            console.error('Error fetching tickets:', err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTickets()

        // Realtime: auto-refresh on new ticket insert
        const channel = supabase
            .channel('support_tickets_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchTickets()
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [fetchTickets])

    const resolveTicket = async (id) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'resolved' })
                .eq('id', id)
            if (error) throw error
            setAllTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
        } catch (err) {
            alert('Error resolving ticket: ' + err.message)
        }
    }

    // Filter by tab status
    const tabTickets = allTickets.filter(t => t.status === activeTab)

    // Search
    const searched = tabTickets.filter(t =>
        !searchTerm ||
        (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Split by role
    const studentTickets = searched.filter(t => t.profiles?.role === 'student' || !t.profiles?.role)
    const teacherTickets = searched.filter(t => t.profiles?.role === 'teacher')

    const pendingCount = allTickets.filter(t => t.status === 'pending').length

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex font-sans">
            {/* Sidebar */}
            <aside className="w-24 bg-[#0F172A] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/dashboard" className="p-4 bg-white/5 rounded-3xl text-blue-400 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                    <MessageSquare className="h-6 w-6" />
                </div>
                {pendingCount > 0 && (
                    <div className="mt-3 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                        {pendingCount}
                    </div>
                )}
            </aside>

            {/* Main */}
            <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
                {/* Header */}
                <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-blue-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-blue-600 rounded-full"></span>
                            Helpdesk Management
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Support Tickets</h1>
                        <p className="text-gray-400 font-medium mt-2">
                            Tickets from students and teachers appear here in real-time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 shadow-sm min-w-[260px]"
                            />
                        </div>

                        {/* Status Tab */}
                        <div className="flex bg-gray-200/50 p-1.5 rounded-[24px] gap-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-8 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab
                                            ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-lg'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {tab}
                                    {tab === 'pending' && pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[8px] text-white font-black flex items-center justify-center">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Loading tickets...</p>
                    </div>
                ) : tabTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                        <div className="h-24 w-24 bg-gray-100 rounded-[40px] flex items-center justify-center text-gray-200">
                            {activeTab === 'pending' ? <Inbox className="h-12 w-12" /> : <CheckCircle2 className="h-12 w-12" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">
                            {activeTab === 'pending' ? '🎉 All Clear!' : 'No Resolved Tickets'}
                        </h3>
                        <p className="text-gray-400 font-medium max-w-sm">
                            {activeTab === 'pending' ? 'No pending support tickets at this time.' : 'No tickets have been resolved yet.'}
                        </p>
                    </div>
                ) : (
                    /* Two-Panel Layout */
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Student Tickets Panel */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 p-6 bg-blue-600 rounded-[28px] text-white shadow-xl shadow-blue-600/20">
                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Submitted by</p>
                                    <h2 className="text-xl font-black">Students</h2>
                                </div>
                                <span className="ml-auto px-4 py-2 bg-white/20 rounded-xl font-black text-lg">
                                    {studentTickets.length}
                                </span>
                            </div>

                            {studentTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                                    <AlertCircle className="h-10 w-10 text-gray-200 mb-3" />
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No student tickets</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {studentTickets.map(ticket => (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onResolve={resolveTicket}
                                            showResolve={activeTab === 'pending'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Teacher Tickets Panel */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 p-6 bg-purple-600 rounded-[28px] text-white shadow-xl shadow-purple-600/20">
                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Submitted by</p>
                                    <h2 className="text-xl font-black">Teachers</h2>
                                </div>
                                <span className="ml-auto px-4 py-2 bg-white/20 rounded-xl font-black text-lg">
                                    {teacherTickets.length}
                                </span>
                            </div>

                            {teacherTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                                    <AlertCircle className="h-10 w-10 text-gray-200 mb-3" />
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No teacher tickets</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {teacherTickets.map(ticket => (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onResolve={resolveTicket}
                                            showResolve={activeTab === 'pending'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AdminSupport
