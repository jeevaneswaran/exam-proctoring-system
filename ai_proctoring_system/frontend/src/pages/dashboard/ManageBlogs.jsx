import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    PlusCircle,
    Search,
    Calendar,
    User,
    Trash2,
    ExternalLink,
    Loader2,
    Sparkles,
    FileText
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ManageBlogs = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) {
            fetchMyBlogs()
        }
    }, [user])

    const fetchMyBlogs = async () => {
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBlogs(data || [])
        } catch (error) {
            console.error('Error fetching blogs:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return

        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id)

            if (error) throw error
            setBlogs(blogs.filter(blog => blog.id !== id))
        } catch (error) {
            console.error('Error deleting blog:', error.message)
            alert('Failed to delete blog post.')
        }
    }

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/teacher/blog-management" className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold">
                            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Your Published Blogs</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage and monitor all your blog posts</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/teacher/create-blog')}
                            className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Write New Post
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Loading your articles...</p>
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Blog Detail</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Publish Date</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBlogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                                                    {blog.image_url ? (
                                                        <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">{blog.title}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        {blog.content.substring(0, 50)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                                                <Calendar className="h-4 w-4 text-emerald-500" />
                                                {new Date(blog.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    to="/student/blogs"
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="View Publicly"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Delete Post"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-200">
                            <Sparkles className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No blogs uploaded yet</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Start sharing your insights with your students today!</p>
                        <button
                            onClick={() => navigate('/teacher/create-blog')}
                            className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all font-bold"
                        >
                            Create Your First Blog Post
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ManageBlogs
