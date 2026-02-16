import { supabase } from '../lib/supabase'

export const SupabaseService = {
    // Violation Logger
    logViolation: async (studentId, examId, violationType) => {
        const { data, error } = await supabase
            .from('violation_logs')
            .insert([
                {
                    student_id: studentId,
                    exam_id: examId,
                    violation_type: violationType,
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
    }
}
