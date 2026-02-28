import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
    ChevronLeft,
    Calendar,
    User,
    Sparkles,
    Loader2,
    Clock,
    Share2
} from 'lucide-react'

const StudentBlogView = () => {
    const { blogId } = useParams()
    const navigate = useNavigate()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data, error } = await supabase
                    .from('blogs')
                    .select(`
                        *,
                        profiles:author_id (first_name, last_name)
                    `)
                    .eq('id', blogId)
                    .single()

                if (error) throw error
                setBlog(data)
            } catch (error) {
                console.error('Error fetching blog:', error.message)
                navigate('/student/blogs') // Fallback if blog doesn't exist
            } finally {
                setLoading(false)
            }
        }

        if (blogId) {
            fetchBlog()
        }
    }, [blogId, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center flex-col gap-4">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse text-lg">Loading article...</p>
            </div>
        )
    }

    if (!blog) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col student-theme">
            {/* Header/Nav */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/student/blogs')}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 font-bold transition-colors group"
                    >
                        <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded-full group-hover:bg-gray-100 transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </div>
                        Back to Repository
                    </button>

                    <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Read Content Area */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 relative">
                <article className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Hero Image */}
                    {blog.image_url ? (
                        <div className="w-full h-64 md:h-96 relative bg-gray-100 dark:bg-gray-800">
                            <img
                                src={blog.image_url}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <span className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm mb-4 inline-block">
                                    Article
                                </span>
                                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
                                    {blog.title}
                                </h1>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 md:p-12 pb-0">
                            <span className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm mb-6 inline-block">
                                Article
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                                {blog.title}
                            </h1>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="px-8 md:px-12 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-6 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <User className="h-4 w-4" />
                            </div>
                            <span>
                                {blog.profiles ? `${blog.profiles.first_name || ''} ${blog.profiles.last_name || ''}` : 'Teacher'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{Math.ceil(blog.content.length / 1000)} min read</span>
                        </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-lg prose-orange max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed whitespace-pre-wrap font-medium">
                            {blog.content}
                        </div>
                    </div>
                </article>

                {/* Footer Decor */}
                <div className="py-12 flex justify-center text-gray-300">
                    <Sparkles className="h-8 w-8 opacity-50" />
                </div>
            </main>
        </div>
    )
}

export default StudentBlogView
