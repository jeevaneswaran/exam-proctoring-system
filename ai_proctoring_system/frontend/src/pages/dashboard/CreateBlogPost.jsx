import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    ChevronLeft,
    Sparkles,
    Image as ImageIcon,
    Type,
    FileText,
    Upload,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const CreateBlogPost = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !content) return

        setLoading(true)
        try {
            let imageUrl = null

            // 1. Upload Image (if selected)
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `blog-images/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('materials') // Using the existing 'materials' bucket for simplicity or we could create a new 'blogs' bucket
                    .upload(filePath, imageFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('materials')
                    .getPublicUrl(filePath)

                imageUrl = publicUrl
            }

            // 2. Insert Blog Record
            const { error: insertError } = await supabase
                .from('blogs')
                .insert([
                    {
                        title,
                        content,
                        image_url: imageUrl,
                        author_id: user.id
                    }
                ])

            if (insertError) throw insertError

            navigate('/teacher/blog-management')
        } catch (error) {
            console.error('Error publishing blog:', error.message)
            alert('Failed to publish blog post. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/teacher/blog-management" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Blog Post</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/teacher/blog-management')}
                        className="px-6 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                        className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Public Blog Post
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-8">
                {/* Intro Section */}
                <div className="mb-10 text-center">
                    <p className="text-gray-500 font-medium mb-4">
                        Share your knowledge and insights with students through engaging blog content
                    </p>

                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-left">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                            <Sparkles className="h-5 w-5" />
                            Guidelines
                        </div>
                        <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                            Create compelling content that educates and inspires. Include a captivating title, eye-catching image, and detailed description to engage your readers.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xs font-black text-gray-400 border-b border-gray-100 pb-2 uppercase tracking-widest mb-1">
                            Blog Post Information
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            Fill in the details for your new blog post
                        </p>
                    </div>

                    <form className="space-y-8">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Type className="h-4 w-4 text-emerald-500" />
                                Blog Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a captivating title..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-emerald-500" />
                                Featured Image
                            </label>
                            <div
                                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl transition-all h-60 flex items-center justify-center overflow-hidden
                                    ${imagePreview ? 'border-emerald-500' : 'border-gray-300 hover:border-emerald-400 bg-gray-50'}`}
                                onClick={() => document.getElementById('image-upload').click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-emerald-500 transition-colors">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-500">Click to upload image</p>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG, WEBP</p>
                                    </div>
                                )}
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                {imagePreview && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold flex items-center gap-2">
                                            <Upload className="h-5 w-5" />
                                            Change Image
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                Blog Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your knowledge and insights here..."
                                rows={12}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 leading-relaxed"
                            />
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default CreateBlogPost
