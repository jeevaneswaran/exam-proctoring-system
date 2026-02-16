import {
    UploadCloud,
    ChevronLeft,
    FileText,
    ShieldCheck,
    Info,
    ArrowRight,
    X,
    CheckCircle2,
    Loader
} from 'lucide-react'
import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const UploadMaterial = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const fileInputRef = useRef(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit')
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile || !title || !user) return

        setUploading(true)
        setError(null)

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('materials')
                .upload(filePath, selectedFile)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('materials')
                .getPublicUrl(filePath)

            // 3. Insert record into study_materials table
            const { error: dbError } = await supabase
                .from('study_materials')
                .insert([
                    {
                        title,
                        description,
                        file_url: publicUrl,
                        teacher_id: user.id
                    }
                ])

            if (dbError) throw dbError

            navigate('/teacher/manage-materials')
        } catch (err) {
            console.error('Upload Error:', err)
            setError(err.message || 'Failed to upload material')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex">
            {/* Minimal Sidebar */}
            <div className="w-20 bg-[#1A1612] flex flex-col items-center py-8 gap-8 border-r border-white/5 shadow-2xl shrink-0">
                <Link to="/teacher/manage-materials" className="p-3 bg-white/5 rounded-2xl text-amber-500/50 hover:text-white transition-all shadow-xl shadow-black/20">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-4xl mx-auto">
                <header className="mb-10 animate-fade-in text-center">
                    <div className="flex items-center justify-center gap-3 mb-4 font-bold text-amber-600 uppercase tracking-widest text-xs">
                        <span className="h-1 w-8 bg-amber-600 rounded-full"></span>
                        Constructor Mode
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Upload Study Material</h1>
                    <p className="text-sm font-medium text-gray-500 lowercase tracking-widest leading-relaxed">
                        share educational resources and study material with your students
                    </p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                        <X className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {/* Notification Bar */}
                <div className="bg-[#1A1612] p-6 rounded-2xl border border-white/10 shadow-xl mb-10 relative overflow-hidden group animate-slide-up">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-bl-full -mr-6 -mt-6"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Info className="h-5 w-5" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Upload PDF files Documents and Present provide a clear title and description to help students understand the content
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {/* Material Information Box */}
                    <div className="bg-white p-10 rounded-[40px] border border-orange-100 shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-lg font-black text-gray-900 mb-1">Material Information</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">fill the details of your study material</p>
                        </div>

                        <div className="space-y-6">
                            {/* Title Field */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-3">
                                    <FileText className="h-3 w-3" />
                                    material title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter material title here..."
                                    className="w-full px-6 py-5 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 font-bold placeholder:text-gray-200 focus:outline-none focus:border-amber-600 focus:bg-white transition-all shadow-inner"
                                    required
                                    disabled={uploading}
                                />
                            </div>

                            {/* File Upload Field */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-3">
                                    <UploadCloud className="h-3 w-3" />
                                    upload file
                                </label>
                                <div
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    className={`
                                        cursor-pointer w-full p-10 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-4
                                        ${selectedFile
                                            ? 'border-amber-500 bg-amber-50/50'
                                            : 'border-orange-100 bg-amber-50/20 hover:border-amber-400 hover:bg-amber-50/30'
                                        }
                                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        disabled={uploading}
                                    />
                                    {selectedFile ? (
                                        <>
                                            <div className="h-16 w-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                <CheckCircle2 className="h-8 w-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-900">{selectedFile.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-16 w-16 rounded-2xl bg-white text-orange-500 flex items-center justify-center shadow-md">
                                                <UploadCloud className="h-8 w-8" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic text-center">
                                                Click to access my File Explorer
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 mb-3">
                                    <Info className="h-3 w-3" />
                                    material description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide a detailed description of the material..."
                                    className="w-full px-6 py-5 bg-amber-50/20 border-2 border-orange-50 rounded-2xl text-gray-900 font-bold placeholder:text-gray-200 focus:outline-none focus:border-amber-600 focus:bg-white transition-all min-h-[140px] resize-none shadow-inner"
                                    required
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-6 pt-4 pb-20">
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/manage-materials')}
                            className="flex-1 py-5 bg-white text-gray-900 font-black rounded-2xl border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3 group"
                            disabled={uploading}
                        >
                            <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className="flex-[2] py-5 bg-[#1A1612] text-white font-black rounded-2xl shadow-2xl shadow-orange-950/20 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:translate-y-0"
                        >
                            {uploading ? (
                                <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                                <UploadCloud className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload Material'}
                            {!uploading && <ArrowRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default UploadMaterial
