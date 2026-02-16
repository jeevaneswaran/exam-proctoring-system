import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, GraduationCap, FileText, Settings, BarChart3, Clock, Shield, CheckCircle, XCircle } from 'lucide-react'

const AdminDashboard = () => {
    const { user } = useAuth()
    const [pendingTeachers, setPendingTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const adminName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Administrator'

    useEffect(() => {
        fetchPendingTeachers()
    }, [])

    const fetchPendingTeachers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'teacher')
                .eq('is_approved', false)

            if (data) setPendingTeachers(data)
            if (error) throw error
        } catch (error) {
            console.error('Error fetching pending teachers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (teacherId) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', teacherId)

            if (error) throw error
            // Refresh list
            setPendingTeachers(pendingTeachers.filter(t => t.id !== teacherId))
            alert('Teacher account approved successfully!')
        } catch (error) {
            console.error('Error approving teacher:', error)
            alert('Failed to approve teacher.')
        }
    }

    const stats = [
        { label: 'Total Students', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Teachers', value: '45', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Exams', value: '12', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'System Health', value: 'Optimal', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {adminName}</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Teacher Approvals */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                            Pending Teacher Approvals
                        </h2>
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                            {pendingTeachers.length} New Requests
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : pendingTeachers.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400">No pending approval requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingTeachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                            {teacher.first_name?.charAt(0) || teacher.email?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold">{teacher.first_name} {teacher.last_name}</p>
                                            <p className="text-gray-500 text-sm">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(teacher.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            System History
                        </h3>
                        <div className="space-y-4">
                            {[
                                { user: 'John Doe', action: 'completed Mathematics Exam', time: '10 mins ago' },
                                { user: 'Prof. Miller', action: 'created Physics Midterm', time: '45 mins ago' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-xs">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {item.user.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-medium">{item.user} <span className="text-gray-500 font-normal">{item.action}</span></p>
                                        <p className="text-gray-400 mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-900/20 self-start">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-400" />
                        Quick Actions
                    </h2>
                    <div className="space-y-4">
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all text-left flex items-center justify-between group">
                            System Settings
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all text-left flex items-center justify-between group">
                            Manage Users
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all text-left flex items-center justify-between group">
                            View Logs
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
