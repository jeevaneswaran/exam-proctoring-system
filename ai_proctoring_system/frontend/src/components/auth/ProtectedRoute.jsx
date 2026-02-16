import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, role, loading, isApproved } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // If role is null but user exists, it means we are still fetching or state is transitioning
        // Let's show loading instead of redirecting prematurely
        if (!role) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
                </div>
            )
        }

        // Instead of a 403 error page, let's be helpful and send them to their actual home
        if (role === 'student') return <Navigate to="/student/dashboard" replace />
        if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />

        return <Navigate to="/unauthorized" replace />
    }

    // If teacher is not approved, redirect to pending page
    if (role === 'teacher' && !isApproved && location.pathname !== '/teacher/pending') {
        return <Navigate to="/teacher/pending" replace />
    }

    return children
}

export default ProtectedRoute
