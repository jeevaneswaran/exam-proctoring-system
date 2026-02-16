import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [role, setRole] = useState(null)
    const [isApproved, setIsApproved] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchuserRole(session.user.id, session.user)
            } else {
                setLoading(false)
            }
        }).catch(err => {
            console.error('Session check failed:', err)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                setLoading(true)
                fetchuserRole(session.user.id, session.user)
            } else {
                setRole(null)
                setIsApproved(false)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchuserRole = async (userId, currentUser) => {
        setLoading(true)
        setRole(null) // Clear stale role immediately
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, is_approved')
                .eq('id', userId)
                .single()

            if (error) throw error
            setRole(data?.role)
            setIsApproved(data?.is_approved ?? false)
        } catch (error) {
            console.error('Error fetching role:', error)
            // If profile doesn't exist yet, use metadata role from the user object passed in
            const metaRole = currentUser?.user_metadata?.role
            if (metaRole) {
                setRole(metaRole)
                setIsApproved(false)
            } else {
                setRole('student') // Default to student if everything fails
                setIsApproved(false)
            }
        } finally {
            setLoading(false)
        }
    }

    const value = {
        user,
        role,
        session,
        loading,
        isApproved,
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signUp: (email, password, role, additionalData) => supabase.auth.signUp({
            email,
            password,
            options: {
                data: { role, ...additionalData }
            }
        }),
        signOut: () => supabase.auth.signOut(),
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
