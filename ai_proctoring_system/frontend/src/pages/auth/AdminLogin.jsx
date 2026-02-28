import { useState } from 'react'
import LoginForm from '../../components/auth/LoginForm'
import { Link } from 'react-router-dom'
import { ShieldCheck, LogIn, ChevronLeft, Settings, ShieldAlert } from 'lucide-react'

const AdminLogin = () => {
    const [mode, setMode] = useState(null) // null = welcome, 'login'

    if (mode === 'login' || mode === 'signup') {
        return (
            <div>
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setMode(null)} className="text-gray-600 dark:text-gray-300 hover:text-brand-black flex items-center gap-2">
                        &larr; Back
                    </button>
                </div>
                <LoginForm
                    role="admin"
                    title="Admin Portal"
                    redirectPath="/admin/dashboard"
                    defaultSignUp={mode === 'signup'}
                />
            </div>
        )
    }

    // Admin Welcome Screen
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
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-brand-black flex items-center gap-2 transition-colors font-medium">
                    &larr; Back to Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Admin Icon */}
                <div className="mx-auto mb-8 h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-bounce">
                    <ShieldCheck className="h-12 w-12 text-white" />
                </div>

                {/* Greeting */}
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                    Hello Admin 🛡️
                </h1>

                {/* Description */}
                <div className="max-w-xl mx-auto mb-12">
                    <p className="text-sm font-black text-blue-700 leading-relaxed uppercase tracking-[0.3em] mb-4">
                        System Configuration & Oversight
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        Control the core parameters of the AI Proctoring ecosystem. Manage user approvals, monitor system integrity, and ensure the highest standards of examination security across the entire enterprise.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center px-4">
                    <button
                        onClick={() => setMode('signup')}
                        className="group flex items-center gap-3 px-10 py-5 bg-[#1A1612] text-white font-black rounded-2xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 text-lg w-full sm:w-auto justify-center"
                    >
                        <ShieldAlert className="h-6 w-6 group-hover:scale-110 transition-transform text-blue-400" />
                        Create Admin
                    </button>

                    <button
                        onClick={() => setMode('login')}
                        className="group flex items-center gap-3 px-10 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-black rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 hover:border-blue-600 hover:text-blue-600 hover:-translate-y-1 transition-all duration-300 text-lg w-full sm:w-auto justify-center"
                    >
                        <LogIn className="h-6 w-6 group-hover:scale-110 transition-transform text-blue-600" />
                        Login Now
                    </button>
                </div>

                <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                    <Settings className="h-4 w-4 animate-spin-slow" />
                    Secure Management Environment
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
