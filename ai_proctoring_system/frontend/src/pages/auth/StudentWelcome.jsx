import {
    UserPlus,
    LogIn,
    BookOpen,
    PlayCircle,
    ArrowRight,
    GraduationCap,
    Sparkles,
    ShieldCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const StudentWelcome = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Back Arrow */}
            <Link to="/" className="absolute top-10 left-10 p-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all group flex items-center gap-2 text-gray-900 border border-orange-50 font-black text-xs uppercase tracking-widest">
                <div className="h-6 w-6 bg-orange-500 rounded-lg flex items-center justify-center text-white group-hover:-translate-x-1 transition-transform">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </div>
                Back to Home
            </Link>

            <div className="max-w-4xl w-full text-center relative z-10 animate-fade-in">
                {/* Greeting Icon */}
                <div className="mx-auto mb-8 h-24 w-24 rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 p-1 shadow-2xl shadow-orange-500/30 flex items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-500 group">
                    <GraduationCap className="h-14 w-14 group-hover:scale-110 transition-transform" />
                </div>

                {/* Main Message */}
                <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/50 backdrop-blur-md border border-orange-100 text-amber-800 text-xs font-black uppercase tracking-widest mb-6">
                    <ShieldCheck className="h-3 w-3 text-amber-500" />
                    Student Portal
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-[1.1] tracking-tight">
                    Hello Students
                </h1>
                <p className="text-xl md:text-2xl font-bold text-amber-600 mb-8">
                    Welcome to AI Proctoring System
                </p>
                <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                    Access your courses, take examinations, and track your academic progress—all in one place.
                </p>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 px-4">
                    <Link
                        to="/student/login?mode=signup"
                        className="group relative px-10 py-6 bg-[#1A1612] text-white font-black rounded-2xl shadow-2xl shadow-orange-950/30 hover:bg-black hover:-translate-y-1 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"></div>
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xl">Create Account</span>
                            <ArrowRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </div>
                    </Link>

                    <Link
                        to="/student/login"
                        className="group relative px-10 py-6 bg-white text-gray-900 font-black rounded-2xl shadow-xl border-b-4 border-orange-100 hover:shadow-2xl hover:-translate-y-1 transition-all hover:bg-amber-50"
                    >
                        <div className="flex items-center gap-3 font-black uppercase tracking-tight">
                            <LogIn className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xl">Login Now</span>
                        </div>
                    </Link>
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16 px-4">
                    <div className="bg-white p-8 rounded-[32px] border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 font-display">Course Access</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed italic">
                            browse through your enrolled courses and view uploaded study materials from teachers
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 font-display">Take Exam</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed italic">
                            securely take your online examinations with real-time AI proctoring and monitoring
                        </p>
                    </div>
                </div>

                {/* Square Box at bottom */}
                <div className="relative group animate-bounce-slow">
                    <div className="mx-auto h-24 w-24 bg-[#1A1612] rounded-[2rem] shadow-2xl shadow-orange-950/40 rotate-12 group-hover:rotate-0 transition-all duration-700 flex items-center justify-center border-2 border-white/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent"></div>
                        <ShieldCheck className="h-10 w-10 text-amber-500 relative z-10" />
                    </div>
                    <div className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Secure Environment</div>
                </div>
            </div>
        </div>
    )
}

export default StudentWelcome
