import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FileText, Clock, HelpCircle, GraduationCap, ArrowRight, Loader } from 'lucide-react'

const StudentExamList = () => {
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchExams()
    }, [])

    const fetchExams = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*, questions(count)') // Fetch exam with question count

            if (error) throw error

            // Format data to include question count
            const formattedData = data.map(exam => ({
                ...exam,
                total_questions: exam.questions?.[0]?.count || 0
            }))

            setExams(formattedData || [])
        } catch (error) {
            console.error('Error fetching exams:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="h-8 w-8 text-brand-red animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-orange-50 p-6 md:p-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Examinations</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Select an exam from the list below to begin. Ensure you have a stable internet connection and your camera is ready for proctoring.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {exams.map((exam, index) => (
                    <div
                        key={exam.id}
                        className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
                        style={{ animationDelay: `${index * 100}ms` }} // Staggered animation effect
                    >
                        {/* Card Header (Subject & Graduation) */}
                        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                                    {exam.subject || 'General'}
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{exam.title}</h2>
                            </div>
                            <div className="bg-gray-900 text-white p-2 rounded-lg shadow-sm">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Card Body (Details) */}
                        <div className="p-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <HelpCircle className="h-5 w-5 mr-3 text-orange-500" />
                                    <span className="font-medium">{exam.total_questions || 0} Questions</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="h-5 w-5 mr-3 text-orange-500" />
                                    <span className="font-medium">{exam.duration_minutes || 60} Minutes</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <p className="text-sm text-green-600 font-semibold mb-2 flex items-center">
                                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Ready to Start
                                </p>
                            </div>
                        </div>

                        {/* Card Footer (Action Button) */}
                        <div className="p-6 pt-0 mt-auto">
                            <Link
                                to={`/student/exam/${exam.id}`}
                                className="w-full flex items-center justify-center py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors group shadow-lg shadow-gray-900/20 hover:shadow-orange-600/20"
                            >
                                Start Examination
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {exams.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No Exams Available</h3>
                        <p className="text-gray-500 mt-2">Check back later for new scheduled examinations.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentExamList
