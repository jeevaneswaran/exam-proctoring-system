import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    Bell,
    Send,
    Trash2,
    AlertTriangle,
    Info,
    Loader2,
    Calendar,
    MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ManageNotices = () => {
    const { user } = useAuth()
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState('')
    const [importance, setImportance] = useState('info')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user) {
            fetchNotices()
        }
    }, [user])

    const fetchNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotices(data || [])
        } catch (error) {
            console.error('Error fetching notices:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('notices')
                .insert([{
                    teacher_id: user.id,
                    content: content.trim(),
                    importance
                }])

            if (error) throw error
            setContent('')
            fetchNotices()
        } catch (error) {
            console.error('Error posting notice:', error.message)
            alert('Failed to post notice')
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteNotice = async (id) => {
        try {
            const { error } = await supabase
                .from('notices')
                .delete()
                .eq('id', id)

            if (error) throw error
            setNotices(notices.filter(n => n.id !== id))
        } catch (error) {
            console.error('Error deleting notice:', error.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar */}
            <aside className="w-24 bg-[#1A1612] flex flex-col items-center py-10 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/teacher/dashboard" className="p-4 bg-white/5 rounded-3xl text-amber-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="flex flex-col gap-8">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                        <Bell className="h-6 w-6" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-3 font-black text-amber-600 uppercase tracking-widest text-[10px]">
                        <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                        Broadcast System
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Global Announcements</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Compose Notice */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm sticky top-12">
                            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                Post New Notice
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Notice Content</label>
                                    <textarea
                                        required
                                        rows="5"
                                        placeholder="e.g., Final Mathematics exam is scheduled for Friday at 10 AM..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-amber-500 rounded-[30px] outline-none transition-all font-bold text-gray-700 resize-none shadow-inner"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Importance Level</label>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'info', label: 'General Info', icon: Info, color: 'blue' },
                                            { id: 'urgent', label: 'Critical Alert', icon: AlertTriangle, color: 'red' }
                                        ].map((level) => {
                                            const Icon = level.icon;
                                            return (
                                                <button
                                                    key={level.id}
                                                    type="button"
                                                    onClick={() => setImportance(level.id)}
                                                    className={`flex-1 py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 ${importance === level.id
                                                        ? (level.id === 'urgent' ? 'bg-red-600 text-white border-transparent shadow-lg' : 'bg-blue-600 text-white border-transparent shadow-lg')
                                                        : `bg-white text-gray-400 border-gray-100 hover:border-${level.color}-200`}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {level.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[#1A1612] text-white font-black rounded-[24px] hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    Broadcast to Students
                                </button>
                            </form>
                        </div>

                        {/* Live Preview Section */}
                        <div className="mt-8 bg-amber-50 p-8 rounded-[40px] border border-amber-100 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="px-3 py-1 bg-amber-200/50 rounded-full text-[8px] font-black uppercase text-amber-600 tracking-tighter">Live Student Preview</div>
                            </div>
                            <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Important Notice
                            </h3>
                            <div className={`p-5 rounded-2xl shadow-sm border ${importance === 'urgent' ? 'bg-red-100 text-red-900 border-red-200' : 'bg-white text-amber-800 border-white'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-black text-[9px] uppercase tracking-widest opacity-60">{new Date().toLocaleDateString()}</span>
                                    {importance === 'urgent' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                                </div>
                                <p className="text-sm font-bold leading-relaxed min-h-[3rem]">
                                    {content || "Your message will appear here precisely as students will see it..."}
                                </p>
                            </div>
                            <p className="mt-4 text-[9px] text-amber-600/60 font-medium text-center italic">
                                * This preview updates in real-time as you type.
                            </p>
                        </div>
                    </div>

                    {/* Notice List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-gray-900">Live Announcements Feed</h2>
                            <span className="px-5 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                {notices.length} Active Notice{notices.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing with feed...</p>
                            </div>
                        ) : notices.length > 0 ? (
                            <div className="space-y-6">
                                {notices.map((notice) => (
                                    <div key={notice.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                        {notice.importance === 'urgent' && (
                                            <div className="absolute top-0 right-0 h-24 w-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 flex items-center justify-center pt-8 pl-8">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${notice.importance === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {notice.importance}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(notice.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-gray-800 leading-relaxed">
                                                    {notice.content}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteNotice(notice.id)}
                                                className="p-4 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border border-gray-100 border-dashed">
                                <Bell className="h-16 w-16 text-gray-100 mb-6" />
                                <h3 className="text-2xl font-black text-gray-300 mb-2">Feed is Empty</h3>
                                <p className="text-gray-400 font-medium max-w-sm text-center">Post a notice above to share important updates with your students instantly.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ManageNotices
