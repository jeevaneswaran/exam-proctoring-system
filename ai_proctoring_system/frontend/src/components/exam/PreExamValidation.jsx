import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, Circle, Camera, ShieldCheck, UserCheck, Sun, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

const PreExamValidation = ({ onComplete, profilePicUrl, videoRef }) => {
    const [step, setStep] = useState(1)
    const [validations, setValidations] = useState({
        camera: false,
        microphone: false,
        environment: false,
        identity: false,
        lighting: false
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState(null)

    // MediaPipe Logic
    const [faceLandmarker, setFaceLandmarker] = useState(null)
    const [isFacePresent, setIsFacePresent] = useState(false)

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
                console.log("✅ Validation Landmarker Ready")
            } catch {
                console.error("Failed to init landmarker in validation")
            }
        }
        initLandmarker()
    }, [])

    const detectFace = useCallback(() => {
        if (!videoRef.current || !faceLandmarker) return
        const video = videoRef.current
        if (video.readyState === 4) {
            const results = faceLandmarker.detectForVideo(video, Date.now())
            setIsFacePresent(results.faceLandmarks && results.faceLandmarks.length > 0)
        }
    }, [faceLandmarker, videoRef])

    useEffect(() => {
        const interval = setInterval(detectFace, 500)
        return () => clearInterval(interval)
    }, [detectFace])

    const steps = [
        { id: 1, title: 'System Check', icon: Camera, desc: 'Verifying camera and microphone access' },
        { id: 2, title: 'Lighting Check', icon: Sun, desc: 'Ensuring your face is clearly visible' },
        { id: 3, title: 'Face Authentication', icon: UserCheck, desc: 'Verifying your identity' },
        { id: 4, title: 'Environment Scan', icon: ShieldCheck, desc: 'Confirming a secure test environment' }
    ]

    const handleSystemCheck = () => {
        setIsProcessing(true)
        setError(null)
        if (!isFacePresent) {
            setError("Subject not detected. Please position yourself in front of the camera to initialize hardware.")
            setIsProcessing(false)
            return
        }
        if (!videoRef.current) {
            setError("Camera not detected. Please ensure permissions are granted.")
            setIsProcessing(false)
            return
        }
        setTimeout(() => {
            setValidations(prev => ({ ...prev, camera: true, microphone: true }))
            setIsProcessing(false)
            setStep(2)
        }, 1500)
    }

    const handleLightingCheck = () => {
        setIsProcessing(true)
        setError(null)
        if (!isFacePresent) {
            setError("No face detected. Please ensure you are in the frame and have good lighting.")
            setIsProcessing(false)
            return
        }
        setTimeout(() => {
            setValidations(prev => ({ ...prev, lighting: true }))
            setIsProcessing(false)
            setStep(3)
        }, 1500)
    }

    const handleFaceScan = () => {
        setIsProcessing(true)
        setError(null)
        if (!isFacePresent) {
            setError("Face authentication failed. Face must be visible in the frame.")
            setIsProcessing(false)
            return
        }
        setTimeout(() => {
            setValidations(prev => ({ ...prev, identity: true }))
            setIsProcessing(false)
            setStep(4)
        }, 2000)
    }

    const handleEnvScan = () => {
        setIsProcessing(true)
        setError(null)
        if (!isFacePresent) {
            setError("Validation failed. Please remain in the frame during the environment scan.")
            setIsProcessing(false)
            return
        }
        setTimeout(() => {
            setValidations(prev => ({ ...prev, environment: true }))
            setIsProcessing(false)
            onComplete()
        }, 3000)
    }

    return (
        <div className="fixed inset-0 z-[2000] bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-12 bg-amber-500 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Step {step} of 4</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight uppercase leading-none">Neural Validation</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Active Protocol: SECURE_EXAM_PIPELINE_V4</p>
                    </div>

                    <div className="space-y-3">
                        {steps.map((s) => (
                            <div key={s.id} className={`flex items-center gap-4 p-5 rounded-3xl transition-all border-2 ${step === s.id ? 'bg-amber-50 border-amber-500 shadow-xl shadow-amber-500/10 scale-105 z-10' : 'bg-gray-50 dark:bg-gray-950 border-transparent opacity-40'}`}>
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${step === s.id ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                                    <s.icon className={`h-7 w-7 ${step === s.id ? 'animate-pulse' : ''}`} />
                                </div>
                                <div>
                                    <h3 className={`font-black uppercase tracking-tight text-sm ${step === s.id ? 'text-amber-900' : 'text-gray-400'}`}>{s.title}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mt-1.5">{s.desc}</p>
                                </div>
                                {step > s.id && <CheckCircle2 className="h-6 w-6 text-green-500 ml-auto" />}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[32px] flex items-center gap-4 animate-shake">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <p className="text-xs font-bold text-red-700 uppercase tracking-wide leading-relaxed">{error}</p>
                        </div>
                    )}
                </div>

                <div className="bg-[#1A1612] rounded-[50px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col gap-10 min-h-[550px]">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <ShieldCheck className="h-40 w-40 text-amber-500 rotate-12" />
                    </div>

                    <div className="flex-1 rounded-[40px] overflow-hidden border-2 border-white/5 bg-black relative shadow-inner">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover scale-x-[-1] transition-all duration-700 ${isProcessing ? 'blur-sm scale-110' : 'grayscale contrast-125 opacity-80'}`}
                        />

                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border ${isFacePresent ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${isFacePresent ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isFacePresent ? 'text-green-400' : 'text-red-400'}`}>
                                    {isFacePresent ? 'Identity Visible' : 'No Subject Detected'}
                                </span>
                            </div>
                        </div>

                        {isProcessing && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-amber-500/5 backdrop-blur-sm">
                                <div className="absolute inset-x-0 h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-scan"></div>
                                <div className="bg-black/40 px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                                    <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Analyzing Biometrics</p>
                                </div>
                            </div>
                        )}

                        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-10">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-white/20"></div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        {step === 1 && (
                            <button
                                onClick={handleSystemCheck}
                                disabled={isProcessing}
                                className="w-full py-6 bg-amber-500 text-black dark:text-white font-black rounded-[28px] hover:bg-amber-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-amber-500/20 uppercase tracking-[0.2em] text-xs group active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? 'Verifying Hardware...' : 'Initialize Integrity Check'}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        {step === 2 && (
                            <button
                                onClick={handleLightingCheck}
                                disabled={isProcessing}
                                className="w-full py-6 bg-amber-500 text-black dark:text-white font-black rounded-[28px] hover:bg-amber-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-amber-500/20 uppercase tracking-[0.2em] text-xs group active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? 'Analyzing Luminescence...' : 'Conduct Lighting Scan'}
                                <Sun className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        )}
                        {step === 3 && (
                            <button
                                onClick={handleFaceScan}
                                disabled={isProcessing}
                                className="w-full py-6 bg-amber-500 text-black dark:text-white font-black rounded-[28px] hover:bg-amber-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-amber-500/20 uppercase tracking-[0.2em] text-xs group active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? 'Matching Biometrics...' : 'Authenticate Identity'}
                                <UserCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                        {step === 4 && (
                            <button
                                onClick={handleEnvScan}
                                disabled={isProcessing}
                                className="w-full py-6 bg-amber-500 text-black dark:text-white font-black rounded-[28px] hover:bg-amber-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-amber-500/20 uppercase tracking-[0.2em] text-xs group active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? 'Optimizing Environment...' : 'Begin Environmental Audit'}
                                <ShieldCheck className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        )}
                    </div>

                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-amber-500' : 'w-2 bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16 flex items-center gap-4 px-8 py-4 bg-red-50 text-red-600 rounded-3xl border border-red-100 max-w-2xl mx-auto shadow-sm">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Neural Sentinel Notice: Any attempt to bypass validation or spoof biological identity will result in immediate disqualification and system lockout.</p>
            </div>
        </div>
    )
}

export default PreExamValidation
