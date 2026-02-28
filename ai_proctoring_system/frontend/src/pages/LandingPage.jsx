import { Link } from 'react-router-dom'
import { Shield, Eye, Lock, Activity, ArrowRight, Github, Twitter, Linkedin, ShieldCheck, Cpu } from 'lucide-react'

const LandingPage = () => {
    return (
        <div className="overflow-hidden bg-white dark:bg-gray-900 min-h-screen text-brand-black dark:text-white">
            {/* HERO SECTION */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-red/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-green/5 blur-[150px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-red/5 text-brand-red text-xs font-bold uppercase tracking-widest mb-8 border border-brand-red/10">
                            <ShieldCheck className="h-4 w-4" />
                            Secure Exam Environment
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-brand-black dark:text-white sm:text-7xl mb-8 leading-tight">
                            AI <span className="text-brand-red">Proctoring</span> System
                        </h1>
                        <p className="mt-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
                            A reliable, secure, and user-friendly solution for online examinations. Real-time monitoring and violation detection powered by advanced AI.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link
                                to="/student/welcome"
                                className="group relative px-10 py-5 bg-brand-black text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all duration-300 flex items-center gap-3"
                            >
                                Student Portal <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/teacher/login"
                                className="group px-10 py-5 bg-white dark:bg-gray-900 text-brand-black dark:text-white font-bold rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand-red hover:shadow-lg transition-all duration-300 flex items-center gap-3"
                            >
                                Teacher Login <Cpu className="h-5 w-5 text-brand-red" />
                            </Link>
                        </div>
                    </div>

                    {/* Features Preview */}
                    <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Real-time Monitoring",
                                desc: "Automated person and object detection to ensure exam integrity.",
                                icon: Eye,
                                color: "text-brand-red",
                                bg: "bg-brand-red/5"
                            },
                            {
                                title: "Secure Environment",
                                desc: "Comprehensive tracking of browser activity and system violations.",
                                icon: Lock,
                                color: "text-brand-green",
                                bg: "bg-brand-green/5"
                            },
                            {
                                title: "Instant Reports",
                                desc: "Detailed analytics and violation logs generated immediately after exams.",
                                icon: Activity,
                                color: "text-brand-orange",
                                bg: "bg-brand-brand-orange/5"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <div className={`h-14 w-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTEGRITY SECTION */}
            <section className="py-24 bg-brand-black text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 blur-3xl rounded-full -mr-48 -mt-48"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl font-black mb-8">Maintain Exam Integrity</h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-16">
                        Our system utilizes on-device AI models for lightning-fast detection without compromising student privacy. All processing happens locally in the browser.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        <div className="p-10 bg-white/5 rounded-3xl border border-white/10 text-left">
                            <Shield className="h-10 w-10 text-brand-red mb-6" />
                            <h4 className="text-xl font-bold mb-4">Zero Trust Security</h4>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                Continuous verification ensures the right candidate is taking the exam in a fair, controlled environment.
                            </p>
                        </div>
                        <div className="p-10 bg-white/5 rounded-3xl border border-white/10 text-left">
                            <Cpu className="h-10 w-10 text-brand-green mb-6" />
                            <h4 className="text-xl font-bold mb-4">Efficient Processing</h4>
                            <p className="text-gray-400 leading-relaxed font-medium">
                                Optimized AI models deliver accurate results with minimal impact on device performance or battery life.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-700 pt-24 pb-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-brand-black text-white rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-black uppercase tracking-tight">AI<span className="text-brand-red">PROCTOR</span></span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                Professional online examination security solutions powered by advanced artificial intelligence.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Quick Links</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Student Portal</a></li>
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Teacher Dashboard</a></li>
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Admin Access</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Resources</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Documentation</a></li>
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-brand-red transition-colors text-sm font-medium">Terms of Use</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Connect</h3>
                            <div className="flex gap-4">
                                <a href="#" className="h-10 w-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all">
                                    <Github className="h-5 w-5" />
                                </a>
                                <a href="#" className="h-10 w-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="h-10 w-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <p>&copy; 2026 AI Proctoring System. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-brand-red transition-colors">Privacy</a>
                            <a href="#" className="hover:text-brand-red transition-colors">Terms</a>
                            <a href="#" className="hover:text-brand-red transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
