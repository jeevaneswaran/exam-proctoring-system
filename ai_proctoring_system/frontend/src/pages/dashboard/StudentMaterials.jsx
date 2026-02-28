import {
    BookOpen,
    Download,
    FileText,
    Search,
    ChevronLeft,
    Filter,
    Clock,
    User,
    ArrowRight,
    Loader,
    AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const StudentMaterials = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMaterials()
    }, [])

    const fetchMaterials = async () => {
        try {
            setLoading(true)
            // Fetch materials with teacher details
            const { data, error } = await supabase
                .from('study_materials')
                .select(`
                    *,
                    profiles:teacher_id (
                        first_name,
                        last_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMaterials(data || [])
        } catch (err) {
            console.error('Fetch Error:', err)
            setError('Failed to load study materials')
        } finally {
            setLoading(false)
        }
    }

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.profiles?.first_name + ' ' + m.profiles?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex student-theme">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/student/dashboard" className="p-3 bg-white/5 rounded-2xl text-orange-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                <header className="mb-12 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 font-bold text-orange-600 uppercase tracking-widest text-xs">
                            <span className="h-1 w-8 bg-orange-600 rounded-full"></span>
                            Learning Library
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Your Study Materials</h1>
                        <p className="text-sm font-medium text-gray-400 lowercase tracking-wider mt-2">
                            access and download resources shared by your teachers
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search materials or teachers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all w-80 font-medium"
                            />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader className="h-10 w-10 animate-spin text-orange-500" />
                        <p className="font-bold uppercase tracking-widest text-xs tracking-[0.2em]">Syncing Library...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 bg-white dark:bg-gray-900 rounded-[40px] border border-orange-100 text-center shadow-xl">
                        <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{error}</h3>
                        <button onClick={fetchMaterials} className="mt-4 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all">
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMaterials.map((material, i) => (
                            <div
                                key={material.id}
                                className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-orange-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-6 -mt-6"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                            <FileText className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                                        {material.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed italic">
                                        {material.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-auto space-y-4 pt-6 border-t border-orange-50">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-orange-500" />
                                                {material.profiles ? `${material.profiles.first_name} ${material.profiles.last_name}` : 'Unknown Teacher'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {new Date(material.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <a
                                            href={material.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between px-6 py-4 bg-orange-50 text-orange-900 font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all duration-300 group/btn"
                                        >
                                            <span className="flex items-center gap-2 text-xs">
                                                <Download className="h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform" />
                                                Access Resource
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {filteredMaterials.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white/50 rounded-[40px] border-2 border-dashed border-orange-200">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No materials found</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Try searching with a different keyword or teacher name.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentMaterials
