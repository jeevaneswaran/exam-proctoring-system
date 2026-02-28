import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import StudentLogin from './pages/auth/StudentLogin'
import TeacherLogin from './pages/auth/TeacherLogin'
import AdminLogin from './pages/auth/AdminLogin'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import ManageQuestions from './pages/dashboard/ManageQuestions'
import CreateQuestion from './pages/dashboard/CreateQuestion'
import ManageStudyMaterial from './pages/dashboard/ManageStudyMaterial'
import ManageCourses from './pages/dashboard/ManageCourses'
import CreateCourse from './pages/dashboard/CreateCourse'
import CreateExam from './pages/dashboard/CreateExam'
import ViewCourses from './pages/dashboard/ViewCourses'
import ViewAllQuestions from './pages/dashboard/ViewAllQuestions'
import ViewResults from './pages/dashboard/ViewResults'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import StudentWelcome from './pages/auth/StudentWelcome'
import UploadMaterial from './pages/dashboard/UploadMaterial'
import StudentMaterials from './pages/dashboard/StudentMaterials'
import StudentExamList from './pages/dashboard/StudentExamList'
import StudentResults from './pages/dashboard/StudentResults'
import ManageNotices from './pages/dashboard/ManageNotices'
import AdminSupport from './pages/dashboard/AdminSupport'
import TeacherPendingApproval from './pages/dashboard/TeacherPendingApproval'
import ExamPage from './pages/exam/ExamPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import BlogManagement from './pages/dashboard/BlogManagement'
import CreateBlogPost from './pages/dashboard/CreateBlogPost'
import ManageBlogs from './pages/dashboard/ManageBlogs'
import StudentBlogs from './pages/dashboard/StudentBlogs'
import StudentBlogView from './pages/dashboard/StudentBlogView'
// New Admin Pages
import StudentManagement from './pages/dashboard/StudentManagement'
import RegisteredStudents from './pages/dashboard/RegisteredStudents'
import StudentPerformance from './pages/dashboard/StudentPerformance'
import StudentExamResults from './pages/dashboard/StudentExamResults'
import CourseManagement from './pages/dashboard/CourseManagement'
import QuestionManagement from './pages/dashboard/QuestionManagement'
import CourseQuestionsList from './pages/dashboard/CourseQuestionsList'
import TeacherApproval from './pages/dashboard/TeacherApproval'
import ManageTeachers from './pages/dashboard/ManageTeachers'
import StudentPreExamVerification from './pages/dashboard/StudentPreExamVerification'
import { ShieldCheck } from 'lucide-react'

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
    <div className="h-24 w-24 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mb-8 animate-bounce">
      <ShieldCheck className="h-12 w-12" />
    </div>
    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Access Restricted</h1>
    <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
      You do not have the required permissions to access this specific module. Please contact your administrator if you believe this is an error.
    </p>
    <Link
      to="/"
      className="px-8 py-4 bg-brand-black text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all"
    >
      Return to Safety
    </Link>
  </div>
)

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 text-brand-black dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <Routes>
              {/* Landing & Welcome Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/student/welcome" element={<StudentWelcome />} />

              {/* Login Routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-courses"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ManageCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/create-course"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/create-exam"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <CreateExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/view-courses"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ViewCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-questions"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ManageQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/view-all-questions"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ViewAllQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/view-results"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ViewResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/notices"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ManageNotices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-materials"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ManageStudyMaterial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/blog-management"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <BlogManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/manage-blogs"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <ManageBlogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/create-blog"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <CreateBlogPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/upload-material"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <UploadMaterial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/create-question"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <CreateQuestion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/materials"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/blogs"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentBlogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/blogs/:blogId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentBlogView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* New Admin Routes */}
              <Route
                path="/admin/student-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/registered-students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RegisteredStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/student-performance"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentPerformance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/student-exam-results/:studentId"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentExamResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/course-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-course"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/question-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <QuestionManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-question"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CreateQuestion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/course-questions/:courseId"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CourseQuestionsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentExamList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/pending"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherPendingApproval />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teacher-approvals"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TeacherApproval />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teacher-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageTeachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exam/verify"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPreExamVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exam/:examId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ExamPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
