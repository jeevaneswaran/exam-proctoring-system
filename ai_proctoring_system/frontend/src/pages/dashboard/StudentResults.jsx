import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    Trophy,
    FileText,
    Calendar,
    TrendingUp,
    Award,
    Clock,
    Search
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const StudentResults = () => {
    const { user } = useAuth()
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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
                    exams (
                        title,
                        duration_minutes
                    )
                `)
                .eq('student_id', user.id)
                .order('submitted_at', { ascending: false })

            if (error) throw error
            setResults(data || [])
        } catch (error) {
            console.error('Error fetching results:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredResults = results.filter(r =>
        r.exams?.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        avgScore: results.length > 0
            ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)
            : 0,
        totalExams: results.length,
        bestPerformance: results.length > 0
            ? Math.max(...results.map(r => r.score))
            : 0
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex">
            {/* Sidebar Navigation */}
            <aside className="w-24 bg-[#111827] flex flex-col items-center py-10 sticky top-0 h-screen border-r border-gray-800 shadow-2xl shrink-0">
                <Link to="/student/dashboard" className="p-4 bg-white/5 rounded-3xl text-orange-500 hover:text-white transition-all shadow-xl mb-12">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                    <Trophy className="h-6 w-6" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 font-black text-orange-600 uppercase tracking-widest text-[10px]">
                            <span className="h-1 w-8 bg-orange-600 rounded-full"></span>
                            My Academic Record
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Examination Results</h1>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 focus:border-orange-500 rounded-[24px] outline-none transition-all font-bold text-gray-700 shadow-sm"
                        />
                    </div>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Cumulative Average', value: stats.avgScore + '%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Exams Completed', value: stats.totalExams, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Highest Achievement', value: stats.bestPerformance + '%', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className={`${s.bg} p-8 rounded-[40px] border border-white shadow-sm hover:shadow-md transition-all group`}>
                                <div className={`h-12 w-12 rounded-2xl ${s.bg.replace('50', '200')} ${s.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</h4>
                                <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Retrieving Transcripts...</p>
                    </div>
                ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredResults.map((r) => (
                            <div key={r.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">{r.exams?.title}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.submitted_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.exams?.duration_minutes} min</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#111827] p-8 rounded-[32px] flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Final Score</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-orange-500">{r.score}</span>
                                                <span className="text-xl font-black text-gray-600">%</span>
                                            </div>
                                        </div>
                                        <div className="h-20 w-20 rounded-full border-4 border-gray-800 flex items-center justify-center relative">
                                            <svg className="h-full w-full -rotate-90 absolute">
                                                <circle
                                                    cx="40" cy="40" r="34"
                                                    fill="transparent"
                                                    stroke="#1F2937"
                                                    strokeWidth="6"
                                                    transform="translate(0,0)"
                                                />
                                                <circle
                                                    cx="40" cy="40" r="34"
                                                    fill="transparent"
                                                    stroke="#F97316"
                                                    strokeWidth="6"
                                                    strokeDasharray={`${2 * Math.PI * 34}`}
                                                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - r.score / 100)}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <Trophy className="h-6 w-6 text-orange-500" />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${r.score >= 40 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{r.score >= 40 ? 'Passed' : 'Needs Review'}</span>
                                        </div>
                                        <button className="px-6 py-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-bold rounded-xl transition-all text-xs border border-transparent hover:border-orange-100">
                                            Download Transcript
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="h-24 w-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8 text-gray-200">
                            <Trophy className="h-12 w-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Records Yet</h3>
                        <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">Complete your scheduled examinations to see your performance results here.</p>
                        <Link to="/student/exams" className="mt-10 px-10 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20">
                            Browse Exams
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentResults
