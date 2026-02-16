import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    MessageSquare,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const AdminSupport = () => {
    const { user } = useAuth()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('pending')

    useEffect(() => {
        fetchTickets()
    }, [filter])

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    profiles:student_id (
                        email,
                        user_metadata
                    )
                `)
                .eq('status', filter)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTickets(data || [])
        } catch (error) {
            console.error('Error fetching tickets:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const resolveTicket = async (id) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'resolved' })
                .eq('id', id)

            if (error) throw error
            setTickets(tickets.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error resolving ticket:', error.message)
        }
    }

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar */}
            <aside className="w-24 bg-[#0F172A] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/admin/dashboard" className="p-4 bg-white/5 rounded-3xl text-blue-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                    <MessageSquare className="h-6 w-6" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-blue-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-blue-600 rounded-full"></span>
                            Helpdesk Management
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Support Tickets</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by student or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-14 pr-6 py-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 shadow-sm min-w-[300px]"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-gray-200/50 p-1.5 rounded-[24px] gap-1">
                            {['pending', 'resolved'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-8 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Ticket List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Compiling Tickets...</p>
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <div className="space-y-6">
                        {filteredTickets.map((t) => (
                            <div key={t.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group group-hover:-translate-y-1">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.category === 'Technical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {t.category}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase">
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Date(t.created_at).toLocaleString()}
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">
                                            {t.subject}
                                        </h3>
                                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                            {t.message}
                                        </p>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl w-fit">
                                            <div className="h-10 w-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-bold">
                                                {t.profiles?.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900">{t.profiles?.email}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Reporter</p>
                                            </div>
                                        </div>
                                    </div>

                                    {filter === 'pending' && (
                                        <button
                                            onClick={() => resolveTicket(t.id)}
                                            className="h-fit py-5 px-10 bg-emerald-600 text-white font-black rounded-[24px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 shrink-0"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            Resolve Issue
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="h-24 w-24 bg-gray-100 rounded-[40px] flex items-center justify-center mb-8 text-gray-200">
                            {filter === 'pending' ? <CheckCircle2 className="h-12 w-12" /> : <AlertCircle className="h-12 w-12" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            {filter === 'pending' ? 'All Clear!' : 'No History'}
                        </h3>
                        <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">
                            {filter === 'pending' ? 'No pending support tickets found.' : 'You haven\'t resolved any tickets yet.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AdminSupport
