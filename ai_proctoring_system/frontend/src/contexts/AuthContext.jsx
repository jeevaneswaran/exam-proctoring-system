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

            if (error) {
                // If profile doesn't exist, create it from metadata
                if (error.code === 'PGRST116') { // single() returns this code when no rows found
                    const meta = currentUser?.user_metadata || {}
                    const metaRole = meta.role || 'student'

                    const { data: newProfile, error: insertError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: userId,
                                email: currentUser.email,
                                role: metaRole,
                                first_name: meta.first_name || '',
                                last_name: meta.last_name || '',
                                contact_number: meta.contact_number || '',
                                address: meta.address || '',
                                profile_picture: meta.profile_picture || '',
                                is_approved: metaRole !== 'teacher'
                            }
                        ])
                        .select()
                        .single()

                    if (insertError) {
                        console.error('JIT Profile Creation Error:', insertError)
                        setRole(metaRole)
                        setIsApproved(false)
                    } else {
                        setRole(newProfile.role)
                        setIsApproved(newProfile.is_approved)
                    }
                } else {
                    throw error
                }
            } else {
                setRole(data?.role)
                setIsApproved(data?.is_approved ?? false)
            }
        } catch (error) {
            console.error('Error fetching role:', error)
            const metaRole = currentUser?.user_metadata?.role
            if (metaRole) {
                setRole(metaRole)
                setIsApproved(false)
            } else {
                setRole('student')
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
