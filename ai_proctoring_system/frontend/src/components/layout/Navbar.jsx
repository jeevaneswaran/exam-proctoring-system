import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { LogOut, LayoutDashboard, ShieldCheck, Sun, Moon } from 'lucide-react'

const Navbar = () => {
    const { user, role, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const getDashboardLink = () => {
        switch (role) {
            case 'admin': return '/admin/dashboard'
            case 'teacher': return '/teacher/dashboard'
            case 'student': return '/student/dashboard'
            default: return '/'
        }
    }

    // Custom NavLink component for the "Square Highlight" effect
    const CustomLink = ({ to, children }) => (
        <NavLink
            to={to}
            className={({ isActive }) => `
                relative px-4 py-2 text-sm font-semibold transition-all duration-300
                ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-white'}
            `}
        >
            {({ isActive }) => (
                <>
                    {/* The "Square" Background */}
                    {isActive && (
                        <span className="absolute inset-0 bg-brand-red rounded-lg -z-10 shadow-md transform scale-100 transition-transform origin-center"></span>
                    )}
                    {children}
                </>
            )}
        </NavLink>
    )

    return (
        <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo Area */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-brand-black dark:bg-gray-800 text-white p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-brand-black dark:text-white">AI<span className="text-brand-red">Proctor</span></span>
                        </Link>
                    </div>

                    {/* Navigation Links and Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-amber-400 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-full transition-all"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm">
                            {user ? (
                                <>
                                    <Link
                                        to={getDashboardLink()}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-brand-red/20"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Access Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 text-gray-400 hover:text-brand-red transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="hidden md:flex items-center gap-1">
                                    <CustomLink to="/">Home</CustomLink>
                                    <CustomLink to="/student/welcome">Student</CustomLink>
                                    <CustomLink to="/teacher/login">Teacher</CustomLink>
                                    <CustomLink to="/admin/login">Admin</CustomLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
