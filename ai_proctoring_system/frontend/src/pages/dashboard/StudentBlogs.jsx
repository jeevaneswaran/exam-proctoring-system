import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    Sparkles,
    Search,
    Calendar,
    User,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const StudentBlogs = () => {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select(`
                    *,
                    profiles:author_id (first_name, last_name)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBlogs(data || [])
        } catch (error) {
            console.error('Error fetching blogs:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col student-theme">
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/student/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Blog Repository</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Explore insights and knowledge shared by your teachers</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles, topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Fetching latest insights...</p>
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <Link to={`/student/blogs/${blog.id}`} key={blog.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden shrink-0">
                                    {blog.image_url ? (
                                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Sparkles className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-600 shadow-sm">
                                            Article
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4 shrink-0">
                                        <span className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-orange-500" />
                                            {blog.profiles ? `${blog.profiles.first_name || ''} ${blog.profiles.last_name || ''}` : 'Teacher'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 font-medium leading-relaxed">
                                        {blog.content}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-black text-orange-600 group-hover:gap-4 transition-all uppercase tracking-widest mt-auto shrink-0">
                                        Read More
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="h-20 w-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-200">
                            <Sparkles className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No blogs found</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Try searching for something else or check back later.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentBlogs
