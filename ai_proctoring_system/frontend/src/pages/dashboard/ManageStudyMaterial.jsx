import {
    UploadCloud,
    BookOpen,
    ChevronLeft,
    FileText,
    ShieldCheck,
    Layers,
    Clock,
    Trash2,
    ArrowRight,
    Search,
    Loader,
    ExternalLink,
    AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ManageStudyMaterial = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchMaterials()
        }
    }, [user])

    const fetchMaterials = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('study_materials')
                .select('*')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMaterials(data || [])
        } catch (err) {
            console.error('Fetch Error:', err)
            setError('Failed to load materials')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, fileUrl) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return

        try {
            // 1. Delete from Storage (extract path from URL)
            const path = fileUrl.split('/public/materials/')[1]
            if (path) {
                await supabase.storage.from('materials').remove([path])
            }

            // 2. Delete from DB
            const { error } = await supabase
                .from('study_materials')
                .delete()
                .eq('id', id)

            if (error) throw error

            setMaterials(materials.filter(m => m.id !== id))
        } catch (err) {
            console.error('Delete Error:', err)
            alert('Failed to delete material')
        }
    }

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const guidelines = [
        { icon: FileText, text: "Use clear descriptive titles for easy identification by students." },
        { icon: Layers, text: "Organize material by topic or modules for better accessibility." },
        { icon: Clock, text: "Ensure all uploaded content is accurate and up to date." }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/teacher/dashboard" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2 font-bold text-amber-600 uppercase tracking-widest text-xs">
                            <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                            Resource portal
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Study Material Management</h1>
                        <p className="text-sm font-medium text-gray-400 lowercase tracking-wider leading-relaxed">
                            organized educational resources for your students
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/teacher/upload-material')}
                        className="px-6 py-3 bg-[#1A1612] text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2"
                    >
                        <UploadCloud className="h-4 w-4 text-amber-500" />
                        Quick Upload
                    </button>
                </header>

                {/* Search Bar */}
                <div className="mb-8 relative max-w-md animate-slide-up">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-orange-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    />
                </div>

                {/* Materials List Section */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Your Uploaded Materials</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">
                            {filteredMaterials.length} total
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Loader className="h-10 w-10 animate-spin text-amber-500" />
                            <p className="font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-center">
                            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
                            <p className="text-rose-900 font-bold">{error}</p>
                            <button onClick={fetchMaterials} className="mt-4 text-rose-600 text-sm font-black uppercase hover:underline">Try Again</button>
                        </div>
                    ) : filteredMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {filteredMaterials.map((material) => (
                                <div key={material.id} className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm hover:shadow-xl transition-all group flex gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-gray-900 mb-1 truncate">{material.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed italic">
                                            {material.description || 'No description provided.'}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <a
                                                href={material.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View Document
                                            </a>
                                            <button
                                                onClick={() => handleDelete(material.id, material.file_url)}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                                            {new Date(material.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white/50 rounded-[40px] border-2 border-dashed border-orange-200">
                            <UploadCloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No materials uploaded yet</h3>
                            <p className="text-gray-500 font-medium mb-8">Start by uploading your first study material to share with students.</p>
                            <button
                                onClick={() => navigate('/teacher/upload-material')}
                                className="px-8 py-4 bg-[#1A1612] text-white font-black rounded-2xl hover:bg-black transition-all inline-flex items-center gap-3 shadow-xl shadow-orange-950/20"
                            >
                                <UploadCloud className="h-5 w-5 text-amber-500" />
                                Go to Upload
                            </button>
                        </div>
                    )}
                </div>

                {/* MODIS Bar (Notice Bar) */}
                <div className="bg-[#1A1612] p-8 rounded-[32px] border border-white/5 shadow-2xl mt-12 mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                            <BookOpen className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white mb-1">Knowledge Sharing Hub</p>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                upload PDF document and other educational content to enhance the learning. share valuables study materials lecture notes and resources with your students.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ManageStudyMaterial
