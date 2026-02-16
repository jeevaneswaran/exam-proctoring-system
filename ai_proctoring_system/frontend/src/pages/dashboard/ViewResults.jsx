import { useEffect, useState, useMemo } from 'react'
import {
    ChevronLeft,
    Search,
    Loader2,
    Users,
    FileText,
    Calendar,
    Trophy,
    ArrowUpRight,
    BarChart3,
    TrendingUp,
    PieChart as PieIcon,
    X
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    PieChart,
    Pie
} from 'recharts'

const ViewResults = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudent, setSelectedStudent] = useState(null)

    useEffect(() => {
        if (user) {
            fetchResults()
        }
    }, [user])

    const fetchResults = async () => {
        try {
            const { data, error } = await supabase
                .from('results')
                .select(`
                    *,
                    exams!inner (
                        title,
                        created_by
                    ),
                    profiles:student_id (
                        email,
                        id
                    )
                `)
                .eq('exams.created_by', user.id)
                .order('submitted_at', { ascending: false })

            if (error) throw error
            setResults(data || [])
        } catch (error) {
            console.error('Error fetching results:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredResults = useMemo(() => {
        return results.filter(r =>
            r.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.exams.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [results, searchTerm])

    // Analytics Calculation
    const chartData = useMemo(() => {
        if (results.length === 0) return []

        // Distribution Data
        const distribution = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        }

        results.forEach(r => {
            const score = r.score
            if (score <= 20) distribution['0-20']++
            else if (score <= 40) distribution['21-40']++
            else if (score <= 60) distribution['41-60']++
            else if (score <= 80) distribution['61-80']++
            else distribution['81-100']++
        })

        return Object.keys(distribution).map(key => ({
            range: key,
            count: distribution[key]
        }))
    }, [results])

    const trendingData = useMemo(() => {
        const sorted = [...results].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
        return sorted.slice(-10).map(r => ({
            date: new Date(r.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: r.score
        }))
    }, [results])

    const stats = useMemo(() => ({
        totalSubmissions: results.length,
        avgScore: results.length > 0
            ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)
            : 0,
        highScore: results.length > 0
            ? Math.max(...results.map(r => r.score))
            : 0
    }), [results])

    const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899']

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex">
            {/* Sidebar */}
            <aside className="w-24 bg-[#1A1612] flex flex-col items-center py-10 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/teacher/dashboard" className="p-4 bg-white/5 rounded-3xl text-amber-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="flex flex-col gap-8">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <header className="bg-white border-b border-gray-100 px-12 py-8 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2 font-black text-amber-600 uppercase tracking-widest text-[10px]">
                                <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                                Performance Hub
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Success Center</h1>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students or exams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-amber-500 rounded-[24px] outline-none transition-all font-bold text-gray-700"
                            />
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-12 space-y-12 pb-32">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Submissions', val: stats.totalSubmissions, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Avg Achievement', val: stats.avgScore + '%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Peak Result', val: stats.highScore + '%', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Engagement', val: '94%', icon: PieIcon, color: 'text-rose-600', bg: 'bg-rose-50' }
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} p-6 rounded-[32px] border border-white shadow-sm hover:-translate-y-1 transition-all group`}>
                                <div className={`h-12 w-12 rounded-2xl ${s.bg.replace('50', '100')} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <s.icon className={`h-6 w-6 ${s.color}`} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Score Distribution */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-amber-500" />
                                Score Distribution
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                            cursor={{ fill: '#F9FAFB' }}
                                        />
                                        <Bar dataKey="count" radius={[10, 10, 10, 10]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Performance Trend */}
                        <div className="bg-[#1A1612] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32"></div>
                            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2 relative z-10">
                                <TrendingUp className="h-5 w-5 text-amber-500" />
                                Recent Submission Trends
                            </h3>
                            <div className="h-[300px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendingData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#F59E0B' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={4} dot={{ r: 6, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900">Rankings & Transcripts</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-10 py-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredResults.map((r) => (
                                        <tr key={r.id} className="group hover:bg-gray-50/80 transition-all">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-sm">
                                                        {r.profiles.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 leading-tight">{r.profiles.email.split('@')[0]}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{r.profiles.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3 w-3 text-amber-500" />
                                                    <span className="font-bold text-gray-700 text-sm">{r.exams.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex justify-center">
                                                    <div className={`
                                                        px-4 py-1.5 rounded-full font-black text-xs border
                                                        ${r.score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            r.score >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-rose-50 text-rose-600 border-rose-100'}
                                                    `}>
                                                        {r.score}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-sm font-bold text-gray-500">
                                                {new Date(r.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedStudent(r)}
                                                    className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-amber-600 hover:border-amber-200 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A1612]/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl relative animate-slide-up">
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="absolute top-8 right-8 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all z-10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-12">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="h-24 w-24 rounded-[32px] bg-amber-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-amber-500/20">
                                    {selectedStudent.profiles.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedStudent.profiles.email.split('@')[0]}</h2>
                                    <p className="font-bold text-amber-600 uppercase tracking-widest text-xs">Academic Transcript</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Exam Particulars</p>
                                    <h4 className="text-xl font-black text-gray-900 mb-2">{selectedStudent.exams.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                                        <Calendar className="h-4 w-4" />
                                        Completed on {new Date(selectedStudent.submitted_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="p-8 bg-amber-500 text-white rounded-[40px] shadow-xl shadow-amber-500/20">
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Validated Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black">{selectedStudent.score}</span>
                                        <span className="text-2xl font-black opacity-60">%</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 font-bold text-sm">
                                        <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white" style={{ width: `${selectedStudent.score}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-5 bg-[#1A1612] text-white font-black rounded-[24px] hover:bg-black transition-all">Download Report</button>
                                <button onClick={() => setSelectedStudent(null)} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-[24px] hover:bg-gray-200 transition-all">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewResults
