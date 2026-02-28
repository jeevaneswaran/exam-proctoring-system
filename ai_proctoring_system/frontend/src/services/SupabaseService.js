import { supabase } from '../lib/supabase'

export const SupabaseService = {
    // Violation Logger
    logViolation: async (studentId, examId, violationType, riskScore = 0) => {
        const { data, error } = await supabase
            .from('violation_logs')
            .insert([
                {
                    student_id: studentId,
                    exam_id: examId,
                    violation_type: violationType,
                    risk_score: riskScore,
                    timestamp: new Date().toISOString()
                }
            ])

        if (error) {
            console.error('Error logging violation:', error)
            return null
        }
        return data
    },

    // Fetch Exams
    getExamsForStudent: async (studentId) => {
        // This would typically join with an enrollment table
        const { data, error } = await supabase
            .from('exams')
            .select('*')

        if (error) {
            console.error('Error fetching exams:', error)
            return []
        }
        return data
    },

    // Get Exam Details
    getExamDetails: async (examId) => {
        const { data, error } = await supabase
            .from('exams')
            .select('*, questions(*)')
            .eq('id', examId)
            .single()

        if (error) return null
        return data
    },

    // Teacher Management
    getPendingTeachers: async () => {
        try {
            // Broaden search to include NULL is_approved or different role cases if they somehow occur
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'teacher')
                .or('is_approved.eq.false,is_approved.is.null')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Core Query Error:', error)
                // Fallback: try without 'is_approved' filter if it fails, then filter in JS
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'teacher')

                if (fallbackError) throw fallbackError
                return (fallbackData || []).filter(p => !p.is_approved)
            }
            return data || []
        } catch (error) {
            console.error('Critical Error fetching pending teachers:', error)
            return []
        }
    },

    updateTeacherApproval: async (userId, approve = true) => {
        if (approve) {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', userId)

            if (error) throw error
            return data
        } else {
            // If rejected, we might want to delete the profile or just keep it unapproved
            // For now, let's just keep it unapproved or provide a way to delete
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) throw error
            return true
        }
    },

    getAllTeachers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'teacher')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching all teachers:', error)
            return []
        }
        return data
    }
}
