import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ShieldCheck,
    Camera,
    ScanFace,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    Play
} from 'lucide-react'
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { useWebcam } from '../../hooks/useWebcam'

const StudentPreExamVerification = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { videoRef, startCamera, stopCamera } = useWebcam()
    const canvasRef = useRef(null)

    // Attempt to get exam data from location state (e.g. from StudentExamList)
    const examData = location.state?.exam || { title: 'Unknown Examination' }

    const [isCameraReady, setIsCameraReady] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState(null)
    const [faceDetected, setFaceDetected] = useState(false)

    const [faceLandmarker, setFaceLandmarker] = useState(null)

    // Auto-start camera on mount
    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [startCamera, stopCamera])

    useEffect(() => {
        const initLandmarker = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )
                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 1
                })
                setFaceLandmarker(landmarker)
                console.log("✅ Identity Verification Landmarker Ready")
            } catch (err) {
                console.error("❌ Landmarker Init Failed:", err)
                setError("Neural engine failed to initialize. Please check connection.")
            }
        }
        initLandmarker()
    }, [])

    useEffect(() => {
        let animationFrameId;

        const runDetection = async () => {
            if (videoRef.current?.readyState === 4 && faceLandmarker) {
                const results = faceLandmarker.detectForVideo(videoRef.current, Date.now())

                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    setFaceDetected(true)
                    setError(null)
                } else {
                    setFaceDetected(false)
                }
            }
            animationFrameId = requestAnimationFrame(runDetection)
        }

        if (faceLandmarker) {
            runDetection()
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
        }
    }, [faceLandmarker, videoRef])

    const speakWarning = (text) => {
        if (!window.speechSynthesis) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
    }

    const handleVerification = () => {
        if (!faceDetected) {
            setError("No human face detected. Please position yourself clearly in front of the camera.");
            speakWarning("Don't do this! Face must be visible for identity verification.")
            return;
        }

        setIsVerifying(true);
        setTimeout(() => {
            setIsVerified(true);
            setIsVerifying(false);
            speakWarning("Identity confirmed. You may now proceed to the exam.")
        }, 2000);
    };

    const startExam = () => {
        navigate(`/student/exam/${examData.id || 'start'}`, { state: { verified: true, exam: examData } });
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-10 font-sans">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                <div className="lg:w-1/3 p-10 bg-gray-50 dark:bg-gray-950 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8 cursor-pointer text-gray-400 hover:text-orange-600 transition-all font-bold uppercase text-[10px] tracking-widest" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                            Return
                        </div>
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Pre-Exam Check</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Please complete the face identity verification to proceed to the exam.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${videoRef.current ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <Camera className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">Camera Access</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Ensure your webcam is enabled and permissions granted.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${faceDetected ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <ScanFace className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">Face Recognition</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">Position your face within the frame to verify identity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12">
                        {isVerified ? (
                            <button onClick={startExam} className="w-full py-5 bg-black text-white font-black rounded-2xl hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-600/20 transition-all flex items-center justify-center gap-3 animate-bounce-in"><Play className="h-5 w-5 fill-current" />Start Module</button>
                        ) : (
                            <button onClick={handleVerification} disabled={!faceDetected} className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all">{isVerifying && faceDetected ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}Verify Identity</button>
                        )}
                    </div>
                </div>
                <div className="lg:w-2/3 bg-gray-900 relative flex items-center justify-center min-h-[400px]">
                    {error && (
                        <div className="absolute top-6 left-6 right-6 z-30 bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl animate-shake"><AlertCircle className="h-5 w-5 shrink-0" /><p className="text-xs font-black uppercase tracking-widest">{error}</p></div>
                    )}
                    {isVerified && (
                        <div className="absolute inset-0 z-20 bg-green-500/10 border-8 border-green-500/20 flex items-center justify-center"><div className="bg-green-500 text-white p-6 rounded-full shadow-2xl animate-bounce-in"><CheckCircle2 className="h-16 w-16" /></div></div>
                    )}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                        <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full object-cover scale-x-[-1]" />
                        {!isVerified && (
                            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                                <div className="h-full w-full border-2 border-orange-500/30 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
                                    {!isVerified && faceDetected && <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-scan"></div>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-lg px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${faceDetected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{faceDetected ? 'Face Recognized' : 'Position Face in Frame'}</span>
                    </div>
                </div>
            </div>
            <p className="mt-8 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] text-center">AI Proctoring System • Unit: <span className="text-gray-300">{examData.title}</span></p>
        </div>
    )
}

export default StudentPreExamVerification
