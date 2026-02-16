import { Link, useSearchParams } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'

const StudentLogin = () => {
    const [searchParams] = useSearchParams()
    const isSignUp = searchParams.get('mode') === 'signup'

    return (
        <div>
            <div className="absolute top-4 left-4 z-10">
                <Link to="/student/welcome" className="text-gray-600 hover:text-brand-black flex items-center gap-2 font-medium">
                    &larr; Back to Welcome
                </Link>
            </div>
            <LoginForm
                role="student"
                title="Student Portal"
                redirectPath="/student/dashboard"
                defaultSignUp={isSignUp}
            />
        </div>
    )
}

export default StudentLogin
