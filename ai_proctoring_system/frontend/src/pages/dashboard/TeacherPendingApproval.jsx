import { useAuth } from '../../contexts/AuthContext'
import { Clock, ClipboardCheck, Bell, ShieldCheck, LogOut } from 'lucide-react'

const TeacherPendingApproval = () => {
    const { user, signOut } = useAuth()
    const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Teacher'

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E6] to-[#FFF0D9] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center text-white">
                        <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                            <Clock className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-1">
                            Hello {userName}! 👋
                        </h1>
                        <p className="text-sm opacity-90">Teacher Account Authorization Required</p>
                    </div>

                    {/* Pending Approval Button (UA Design) */}
                    <div className="flex justify-center -mt-6">
                        <div className="px-8 py-4 bg-white rounded-2xl shadow-xl border border-amber-100 flex items-center gap-3">
                            <div className="h-4 w-4 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            <span className="text-amber-800 font-bold uppercase tracking-widest text-xs">
                                Pending Approval Button
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Your account has not been activated yet.
                        </h2>
                        <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
                            We are waiting for the approval from the administrator.
                            You will be able to access your account soon after approval.
                        </p>

                        {/* What Happens Next */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                What happens next?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group/box">
                                    <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/box:bg-amber-600 group-hover/box:text-white transition-colors">
                                        <ClipboardCheck className="h-6 w-6 text-amber-600 group-hover/box:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 leading-tight">
                                        Administrator will review your application
                                    </p>
                                </div>

                                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group/box">
                                    <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/box:bg-orange-600 group-hover/box:text-white transition-colors">
                                        <Bell className="h-6 w-6 text-orange-600 group-hover/box:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-900 leading-tight">
                                        You will receive notification once it is approved
                                    </p>
                                </div>

                                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group/box">
                                    <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/box:bg-rose-600 group-hover/box:text-white transition-colors">
                                        <ShieldCheck className="h-6 w-6 text-rose-600 group-hover/box:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-900 leading-tight">
                                        Full access will be granted after approval
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherPendingApproval
