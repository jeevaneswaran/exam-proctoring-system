import React, { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { AlertTriangle, CheckCircle, Camera } from 'lucide-react'

const WebcamProctor = ({ onViolation }) => {
    const webcamRef = useRef(null)
    const [isExamining, setIsExamining] = useState(true)
    const [status, setStatus] = useState('active') // active, warning, violation
    const [lastViolation, setLastViolation] = useState(null)

    // Ref to store interval
    const intervalRef = useRef(null)

    useEffect(() => {
        // Start monitoring loop
        intervalRef.current = setInterval(async () => {
            if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                const video = webcamRef.current.video
                const { videoWidth, videoHeight } = video

                // Capture frame
                // const screenshot = webcamRef.current.getScreenshot()

                // TODO: Pass to ObjectDetection service
                // const detections = await objectDetection.detect(video)

                // Simulation for demo purposes:
                // randomly trigger violation
                // checkForViolations(detections)
            }
        }, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    const checkForViolations = (detections) => {
        // Logic to check for 'cell phone', 'book', or 'multiple persons'
        // If found, call onViolation(type)
    }

    return (
        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-brand-black bg-black">
            <div className="absolute top-4 right-4 z-10">
                {status === 'active' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Monitoring Active
                    </div>
                )}
                {status === 'violation' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-sm font-medium backdrop-blur-sm animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                        Violation Detected
                    </div>
                )}
            </div>

            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                    facingMode: "user"
                }}
            />

            {lastViolation && (
                <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white p-2 text-center text-sm font-bold backdrop-blur-sm">
                    Warning: {lastViolation}
                </div>
            )}
        </div>
    )
}

export default WebcamProctor
