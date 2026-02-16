import { useState } from 'react'
import LoginForm from '../../components/auth/LoginForm'
import { Link, useSearchParams } from 'react-router-dom'
import { GraduationCap, UserPlus, LogIn, Presentation } from 'lucide-react'

const TeacherLogin = () => {
    const [searchParams] = useSearchParams()
    const [mode, setMode] = useState(searchParams.get('mode')) // null = welcome, 'login', 'signup'

    if (mode === 'login') {
        return (
            <div>
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setMode(null)} className="text-gray-600 hover:text-brand-black flex items-center gap-2">
                        &larr; Back
                    </button>
                </div>
                <LoginForm
                    role="teacher"
                    title="Hello Teacher 👋"
                    redirectPath="/teacher/dashboard"
                />
            </div>
        )
    }

    if (mode === 'signup') {
        return (
            <div>
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setMode(null)} className="text-gray-600 hover:text-brand-black flex items-center gap-2">
                        &larr; Back
                    </button>
                </div>
                <LoginForm
                    role="teacher"
                    title="Hello Teacher 👋"
                    redirectPath="/teacher/dashboard"
                    defaultSignUp={true}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Back to Home */}
            <div className="absolute top-4 left-4 z-10">
                <Link to="/" className="text-gray-500 hover:text-brand-black flex items-center gap-2 transition-colors font-medium">
                    &larr; Back to Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Teacher Icon (Presentation logo) */}
                <div className="mx-auto mb-8 h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce">
                    <Presentation className="h-12 w-12 text-white" />
                </div>

                {/* Greeting */}
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                    Hello Teacher 👋
                </h1>

                {/* Description */}
                <div className="max-w-xl mx-auto mb-12">
                    <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-widest mb-4">
                        Welcome to the AI Proctoring & Examination Management System
                    </p>
                    <p className="text-base text-gray-600 leading-relaxed">
                        Design, manage, and deliver secure online examinations with AI-powered monitoring Create courses, build assessments, upload learning materials, and support student success — all from one intelligent platform.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button
                        onClick={() => setMode('signup')}
                        className="group flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 text-lg w-full sm:w-auto justify-center"
                    >
                        <UserPlus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        Create Account
                    </button>

                    <button
                        onClick={() => setMode('login')}
                        className="group flex items-center gap-3 px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-600 hover:text-indigo-600 hover:-translate-y-1 transition-all duration-300 text-lg w-full sm:w-auto justify-center"
                    >
                        <LogIn className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        Login Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TeacherLogin
