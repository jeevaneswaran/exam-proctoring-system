import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing webcam stream for proctoring.
 * Handles starting/stopping the camera and track management.
 * 
 * FIX: Uses a stream ref in addition to state so the video element
 * can be attached at any time — resolves the black screen race condition.
 */
export const useWebcam = () => {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null); // Keep stream in a ref for immediate access
    const stopRequestedRef = useRef(false);

    // Whenever videoRef or stream changes, attach the stream to the video element
    useEffect(() => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    });

    const startCamera = useCallback(async () => {
        stopRequestedRef.current = false;
        // Don't re-request if already running
        if (streamRef.current) {
            if (videoRef.current) videoRef.current.srcObject = streamRef.current;
            return streamRef.current;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                },
                audio: false
            });

            if (stopRequestedRef.current) {
                mediaStream.getTracks().forEach(track => track.stop());
                return null;
            }

            streamRef.current = mediaStream;
            setStream(mediaStream);

            // Attach immediately if video element is already mounted
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            return mediaStream;
        } catch (err) {
            console.error("Camera Access Denied or Error:", err);
            throw err;
        }
    }, []);

    const stopCamera = useCallback(() => {
        stopRequestedRef.current = true;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped track: ${track.kind}`);
            });
            streamRef.current = null;
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, []);

    return {
        videoRef,
        startCamera,
        stopCamera,
        stream,
        isActive: !!stream
    };
};
