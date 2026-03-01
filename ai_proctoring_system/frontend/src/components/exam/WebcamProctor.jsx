import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AlertTriangle, ShieldCheck, ShieldAlert, Eye, Camera } from 'lucide-react'
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://prefers-career-additionally-template.trycloudflare.com'
const FRAME_INTERVAL_MS = 2500     // Send to YOLO every 2.5s
const INFERENCE_INTERVAL_MS = 150  // Run MediaPipe every 150ms (smooth face box)
const HEAD_YAW_WARN = 45        // Degrees before side-look warning
const HEAD_PITCH_WARN = 35        // Degrees before tilt warning
const WARN_COOLDOWN_MS = 8000      // 8s between same warning
const NO_FACE_TIMEOUT = 10        // Seconds no-face → stop exam

// ─── Canvas drawing helpers ───────────────────────────────────────────────────
function drawRoundRect(ctx, x, y, w, h, r, strokeColor, fillColor) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill() }
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.stroke()
}

function drawLabel(ctx, text, x, y, bgColor) {
    ctx.font = 'bold 11px monospace'
    const w = ctx.measureText(text).width + 10
    ctx.fillStyle = bgColor
    ctx.fillRect(x, y - 16, w, 17)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, x + 5, y - 3)
}

// ─── Main Component ───────────────────────────────────────────────────────────
const WebcamProctor = ({ onViolation, videoRef }) => {
    const overlayCanvasRef = useRef(null)   // Drawn-on canvas (face + object boxes)
    const captureCanvasRef = useRef(null)   // Hidden canvas for frame capture
    const faceLandmarkerRef = useRef(null)
    const lastLandmarksRef = useRef(null)
    const noFaceTimerRef = useRef(null)
    const backendIntervalRef = useRef(null)
    const localIntervalRef = useRef(null)
    const isSendingRef = useRef(false)
    const lastWarnTimeRef = useRef({})
    const yoloBoxesRef = useRef([])   // Boxes from last YOLO response

    const [status, setStatus] = useState('loading')
    const [backendOnline, setBackendOnline] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [popupData, setPopupData] = useState({ title: '', message: '', type: 'warning' })
    const [noFaceSeconds, setNoFaceSeconds] = useState(0)
    const [cameraActive, setCameraActive] = useState(false)
    const [faceStatus, setFaceStatus] = useState('searching') // searching | found | away

    // ─── Cooldown-gated warning ───────────────────────────────────────
    const warnWithCooldown = useCallback((key, title, message, type = 'warning', score = 30) => {
        const now = Date.now()
        if (now - (lastWarnTimeRef.current[key] || 0) < WARN_COOLDOWN_MS) return
        lastWarnTimeRef.current[key] = now

        setPopupData({ title, message, type })
        setShowPopup(true)
        setStatus('violation')

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
            const u = new SpeechSynthesisUtterance(message)
            u.rate = 1.1; u.volume = 0.9
            window.speechSynthesis.speak(u)
        }

        setTimeout(() => { setShowPopup(false); setStatus('active') }, 4000)
        onViolation({ alerts: [message], risk_score: score })
    }, [onViolation])

    // ─── 1. Draw both face box AND YOLO boxes on canvas ───────────────
    const drawOverlay = useCallback((video, landmarks) => {
        const canvas = overlayCanvasRef.current
        if (!canvas || !video) return

        // Match canvas size to displayed video
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const vW = video.clientWidth
        const vH = video.clientHeight
        const srcW = video.videoWidth || 640
        const srcH = video.videoHeight || 480

        // ── Face bounding box (from MediaPipe landmarks) ──
        if (landmarks && landmarks.length > 0) {
            const pts = landmarks  // array of {x,y,z}, normalized 0→1
            let minX = 1, maxX = 0, minY = 1, maxY = 0
            pts.forEach(pt => {
                if (pt.x < minX) minX = pt.x
                if (pt.x > maxX) maxX = pt.x
                if (pt.y < minY) minY = pt.y
                if (pt.y > maxY) maxY = pt.y
            })

            // Draw at original coords — CSS scale-x-[-1] on canvas handles the mirror
            const fx1 = minX * vW
            const fy1 = minY * vH
            const fw = (maxX - minX) * vW
            const fh = (maxY - minY) * vH

            // Green face box with glow
            ctx.shadowColor = 'rgba(34, 197, 94, 0.8)'
            ctx.shadowBlur = 12
            drawRoundRect(ctx, fx1, fy1, fw, fh, 6, '#22c55e', null)
            ctx.shadowBlur = 0
            drawLabel(ctx, '● USER', fx1 + 2, fy1, '#16a34a')

            // Corner brackets (cool look)
            const bLen = 14
            ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3
            // TL
            ctx.beginPath(); ctx.moveTo(fx1, fy1 + bLen); ctx.lineTo(fx1, fy1); ctx.lineTo(fx1 + bLen, fy1); ctx.stroke()
            // TR
            ctx.beginPath(); ctx.moveTo(fx1 + fw - bLen, fy1); ctx.lineTo(fx1 + fw, fy1); ctx.lineTo(fx1 + fw, fy1 + bLen); ctx.stroke()
            // BL
            ctx.beginPath(); ctx.moveTo(fx1, fy1 + fh - bLen); ctx.lineTo(fx1, fy1 + fh); ctx.lineTo(fx1 + bLen, fy1 + fh); ctx.stroke()
            // BR
            ctx.beginPath(); ctx.moveTo(fx1 + fw - bLen, fy1 + fh); ctx.lineTo(fx1 + fw, fy1 + fh); ctx.lineTo(fx1 + fw, fy1 + fh - bLen); ctx.stroke()
        }

        // ── YOLO bounding boxes (objects from backend) ──
        const boxes = yoloBoxesRef.current
        boxes.forEach(det => {
            if (!det.box) return
            const [x1, y1, x2, y2] = det.box
            const scaleX = vW / srcW
            const scaleY = vH / srcH

            // Draw at original coords — CSS scale-x-[-1] on canvas handles the mirror
            const bx = x1 * scaleX
            const by = y1 * scaleY
            const bw = (x2 - x1) * scaleX
            const bh = (y2 - y1) * scaleY

            const isProhibited = ['cell phone', 'book', 'laptop', 'remote', 'tablet'].includes(det.object)
            const color = isProhibited ? '#ef4444' : '#f59e0b'

            ctx.shadowColor = isProhibited ? 'rgba(239,68,68,0.7)' : 'rgba(245,158,11,0.5)'
            ctx.shadowBlur = 10
            drawRoundRect(ctx, bx, by, bw, bh, 4, color, null)
            ctx.shadowBlur = 0

            const label = isProhibited
                ? `⚠ ${det.object.toUpperCase()} ${Math.round(det.accuracy * 100)}%`
                : `${det.object} ${Math.round(det.accuracy * 100)}%`
            drawLabel(ctx, label, bx + 2, by, isProhibited ? '#dc2626' : '#d97706')
        })
    }, [])

    // ─── 2. Initialize MediaPipe FaceLandmarker ───────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )
                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 2
                })
                faceLandmarkerRef.current = landmarker
                setStatus('active')
                console.log("✅ MediaPipe ready")
            } catch (err) {
                console.error("❌ MediaPipe init failed:", err)
                setStatus('active')
            }
        }
        init()
    }, [])

    // ─── 3. Backend health check ──────────────────────────────────────
    useEffect(() => {
        fetch(`${BACKEND_URL}/health`, {
            headers: { 'bypass-tunnel-reminder': 'true' }
        })
            .then(r => r.json())
            .then(d => { if (d.status === 'online') { setBackendOnline(true); console.log("✅ YOLO Backend online") } })
            .catch(() => console.warn("⚠️ YOLO Backend offline"))
    }, [])

    // ─── 4. Wait for camera video ─────────────────────────────────────
    useEffect(() => {
        const check = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                setCameraActive(true); clearInterval(check)
            }
        }, 500)
        return () => clearInterval(check)
    }, [videoRef])

    // ─── 5. Capture frame for Flask ───────────────────────────────────
    const captureFrame = useCallback(() => {
        const video = videoRef.current
        const canvas = captureCanvasRef.current
        if (!video || !canvas || video.readyState < 2) return null
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.8)
    }, [videoRef])

    // ─── 6. Send frame to Flask YOLO backend ─────────────────────────
    const sendFrameToBackend = useCallback(async () => {
        if (!backendOnline || isSendingRef.current) return
        const screenshot = captureFrame()
        if (!screenshot) return

        isSendingRef.current = true
        try {
            const res = await fetch(`${BACKEND_URL}/proctor/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify({ image: screenshot }),
                signal: AbortSignal.timeout(20000)
            })
            if (!res.ok) return
            const data = await res.json()

            // Update YOLO boxes ref so the next canvas draw picks them up
            if (data.objects) {
                yoloBoxesRef.current = data.objects
            }

            if (data.warning) {
                warnWithCooldown('no_face', '⚠️ Look at Camera', data.warning, 'warning', 15)
            }

            if (data.violation && data.violation_details?.msg) {
                const label = data.violation_details.object?.replace(/_/g, ' ').toUpperCase() || 'ITEM'
                warnWithCooldown(`obj_${data.violation_details.object}`,
                    `🚫 ${label} Detected`,
                    data.violation_details.msg,
                    'critical', 70)
            }

            if (data.person_count > 1) {
                warnWithCooldown('multi', '👥 Multiple People',
                    `${data.person_count} PERSONS DETECTED IN FRAME`, 'critical', 80)
            }

            if (data.movement_alert) {
                // Disabled because it's too sensitive and spams "Please stay still"
                // warnWithCooldown('move', '⚡ Excessive Movement', 'PLEASE STAY STILL', 'warning', 20)
            }

        } catch (err) {
            if (err.name !== 'AbortError') console.error("Backend err:", err)
        } finally {
            isSendingRef.current = false
        }
    }, [backendOnline, captureFrame, warnWithCooldown])

    // ─── 7. Local MediaPipe inference + canvas drawing ────────────────
    const runLocalInference = useCallback(() => {
        const landmarker = faceLandmarkerRef.current
        const video = videoRef.current
        if (!landmarker || !video || video.readyState < 4) return

        try {
            const results = landmarker.detectForVideo(video, Date.now())
            const faces = results.faceLandmarks

            if (!faces || faces.length === 0) {
                setFaceStatus('searching')
                drawOverlay(video, null)   // still draw YOLO boxes even if no face

                if (!noFaceTimerRef.current) {
                    let secs = 0
                    noFaceTimerRef.current = setInterval(() => {
                        secs++
                        setNoFaceSeconds(secs)
                        if (secs >= NO_FACE_TIMEOUT) {
                            // Reset and warn — never terminate the exam
                            clearInterval(noFaceTimerRef.current)
                            noFaceTimerRef.current = null
                            setNoFaceSeconds(0)
                            warnWithCooldown('no_face_long',
                                '⚠️ Look at Camera',
                                'FACE NOT DETECTED — PLEASE LOOK AT THE WEBCAM',
                                'warning', 30)
                        }
                    }, 1000)
                }
                return
            }

            // Face found
            if (noFaceTimerRef.current) {
                clearInterval(noFaceTimerRef.current)
                noFaceTimerRef.current = null
                setNoFaceSeconds(0)
            }

            const lm = faces[0]

            // Draw face box + YOLO boxes on overlay canvas
            drawOverlay(video, lm)

            // Jitter
            if (lastLandmarksRef.current) {
                let jitter = 0
                    ;[1, 33, 263, 61, 291].forEach(i => {
                        const dx = lm[i].x - lastLandmarksRef.current[i].x
                        const dy = lm[i].y - lastLandmarksRef.current[i].y
                        jitter += Math.sqrt(dx * dx + dy * dy)
                    })
                if (jitter > 0.25) {
                    warnWithCooldown('jitter', '⚡ Stay Still', 'SUDDEN HEAD MOVEMENT', 'warning', 15)
                }
            }
            lastLandmarksRef.current = lm

            // Head pose
            const nose = lm[1], leftEye = lm[33], rightEye = lm[263]
            const yaw = (nose.x - (leftEye.x + rightEye.x) / 2) * 500
            const pitch = (nose.y - (leftEye.y + rightEye.y) / 2) * 500

            if (Math.abs(yaw) > HEAD_YAW_WARN) {
                const dir = yaw > 0 ? 'LOOKING RIGHT' : 'LOOKING LEFT'
                setFaceStatus('away')
                warnWithCooldown(`head_${dir}`, '👁️ Eyes Forward', `${dir} — FOCUS ON SCREEN`, 'warning', 35)
            } else if (Math.abs(pitch) > HEAD_PITCH_WARN) {
                setFaceStatus('away')
                warnWithCooldown('pitch', '👁️ Eyes Forward', 'HEAD TILTED — LOOK AT SCREEN', 'warning', 20)
            } else {
                setFaceStatus('found')
            }

        } catch (e) { /* ignore transient errors */ }
    }, [videoRef, onViolation, drawOverlay, warnWithCooldown])

    // ─── 8. Start intervals when camera is ready ──────────────────────
    useEffect(() => {
        if (!cameraActive) return
        backendIntervalRef.current = setInterval(sendFrameToBackend, FRAME_INTERVAL_MS)
        localIntervalRef.current = setInterval(runLocalInference, INFERENCE_INTERVAL_MS)
        return () => {
            clearInterval(backendIntervalRef.current)
            clearInterval(localIntervalRef.current)
            if (noFaceTimerRef.current) clearInterval(noFaceTimerRef.current)
        }
    }, [cameraActive])

    // ─── Render ───────────────────────────────────────────────────────
    return (
        <>
            {/* Hidden capture canvas */}
            <canvas ref={captureCanvasRef} className="hidden" />

            <div className="flex flex-col gap-2">
                {/* Camera Widget */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-900 bg-[#0A0A0A]"
                    style={{ width: 320, height: 220 }}>

                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900/95 px-3 py-1.5 flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                            {status === 'loading'
                                ? <Camera className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                                : status === 'active'
                                    ? <ShieldCheck className="h-3.5 w-3.5 text-green-400 animate-pulse" />
                                    : <ShieldAlert className="h-3.5 w-3.5 text-red-400 animate-pulse" />}
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">
                                {backendOnline ? 'YOLO + MediaPipe Active' : 'Local Mode'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${faceStatus === 'found' ? 'bg-green-500' : faceStatus === 'away' ? 'bg-orange-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                            <span className="text-[8px] font-black text-white/50 uppercase">
                                {faceStatus === 'found' ? 'Face OK' : faceStatus === 'away' ? 'Look Fwd' : 'No Face'}
                            </span>
                        </div>
                    </div>

                    {/* Live Video */}
                    <video ref={videoRef} autoPlay playsInline muted
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        style={{ top: 0, left: 0 }} />

                    {/* Canvas overlay — draws face box & YOLO boxes on top of video */}
                    <canvas ref={overlayCanvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
                        style={{ top: 0, left: 0, zIndex: 10 }} />

                    {/* No-face countdown */}
                    {noFaceSeconds > 0 && (
                        <div className="absolute inset-0 z-30 bg-red-900/70 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-white text-5xl font-black font-mono">
                                {NO_FACE_TIMEOUT - noFaceSeconds}
                            </div>
                            <div className="text-red-200 text-[9px] font-black uppercase tracking-widest mt-1">
                                Look at Camera
                            </div>
                        </div>
                    )}

                    {/* Violation border flash */}
                    {status === 'violation' &&
                        <div className="absolute inset-0 border-4 border-red-500 pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(239,68,68,0.5)] animate-pulse" />}
                </div>

                {/* Status strip below camera */}
                <div className="bg-gray-900 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-green-400" />
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">
                            Face <span className={faceStatus === 'found' ? 'text-green-400' : 'text-red-400'}>
                                {faceStatus === 'found' ? '✓ Detected' : faceStatus === 'away' ? '⚠ Look Forward' : '✗ Not Found'}
                            </span>
                        </span>
                    </div>
                    <div className="text-[8px] font-black text-white/30 uppercase">
                        {backendOnline ? '🟢 YOLO' : '🔴 YOLO offline'}
                    </div>
                </div>
            </div>

            {/* ─── Violation Popup ─── */}
            {showPopup && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
                    <div className={`text-white rounded-[28px] shadow-2xl px-8 py-6 max-w-xs w-full text-center mx-4 border-2 backdrop-blur-xl
                        ${popupData.type === 'critical' ? 'bg-red-950/95 border-red-500/70' : 'bg-gray-900/95 border-orange-500/50'}`}>
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${popupData.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}>
                            <AlertTriangle className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-sm font-black mb-1 uppercase tracking-tight">{popupData.title}</h2>
                        <p className="text-[11px] text-gray-300 font-bold uppercase tracking-wider leading-relaxed">
                            {popupData.message}
                        </p>
                        <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-3 font-black uppercase tracking-widest">
                            ⚠️ Logged • Please Refocus
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

export default WebcamProctor
