import { useState, useRef, useCallback } from 'react';

/**
 * useVoiceAssistant Hook
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities.
 */
export const useVoiceAssistant = (onSpeechRecognized) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported in this browser.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                // For interim results, we could call a separate callback if needed
                if (event.results[0].isFinal) {
                    onSpeechRecognized(transcript);
                    setIsListening(false);
                    recognition.stop();
                }
            };

            recognition.start();
            recognitionRef.current = recognition;
        } catch (err) {
            console.error("Failed to start Speech Recognition:", err);
            setIsListening(false);
        }
    }, [onSpeechRecognized]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const speak = useCallback((text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Optional: Get a better voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { isListening, startListening, stopListening, speak, stopSpeaking };
};
