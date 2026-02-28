import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Sparkles, Loader2, User, Bot, Minimize2, Maximize2 } from 'lucide-react'

const AISupportBot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your AI Exam Assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef(null)

    const RESPONSE_MAP = {
        proctoring: "Our AI Proctoring system monitors your environment. Ensure you are alone, in a well-lit room, and no prohibited objects (like phones) are visible.",
        camera: "Your webcam must be active throughout the exam. If the feed is interrupted, the exam will pause automatically. Keep your face centered in the frame.",
        internet: "If you lose connection, don't panic. The system will attempt to reconnect for 60 seconds. If it fails, your progress up to that point is saved.",
        cheating: "Cheating attempts (mobile phones, textbooks, looking away frequently) are detected by YOLOv8. You have a limited violation counter before the exam terminates.",
        result: "Rankings and marks are usually available immediately after submission. You can view them in the 'My Rankings & Marks' section of your dashboard.",
        start: "To start an exam, navigate to 'My Examinations', select your unit, and click 'Start Module'. You will need to complete face verification first.",
        bot: "I'm your AI assistant, specifically trained to help you navigate this proctoring system and answer common examination questions!"
    }

    const QUICK_QUESTIONS = [
        "How does proctoring work?",
        "What if my internet fails?",
        "When will I get my marks?",
        "How do I start the exam?"
    ]

    const handleSend = async (textInput) => {
        const userMsg = typeof textInput === 'string' ? textInput : input
        if (!userMsg.trim()) return

        if (typeof textInput !== 'string') setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setIsTyping(true)

        // Simulating AI Processing
        setTimeout(() => {
            let botResponse = "I can definitely help with that! Regarding " + userMsg.split(' ').slice(0, 3).join(' ') + "..."

            const lowInput = userMsg.toLowerCase()
            const foundKey = Object.keys(RESPONSE_MAP).find(key => lowInput.includes(key))

            if (foundKey) {
                botResponse = RESPONSE_MAP[foundKey]
            } else {
                botResponse = "That's a great question. For specific academic issues, please use the 'Admin Support' form on your dashboard. For proctoring or technical help, I'm here for you!"
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }])
            setIsTyping(false)
        }, 800)
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const onFormSubmit = (e) => {
        e.preventDefault()
        handleSend()
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 z-[300] h-16 w-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 group"
            >
                <MessageSquare className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
        )
    }

    return (
        <div className={`fixed bottom-10 right-[350px] z-[300] w-96 flex flex-col bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 ${isMinimized ? 'h-20' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-12 w-12 rotate-12" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight leading-none mb-1">AI Exam Support</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-gray-400">Neural Sync Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-all">
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-all">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Message Area */}
                    <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-gray-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none shadow-lg shadow-gray-900/10'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex gap-1">
                                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}

                        {/* Quick Questions Bubbles */}
                        {!isTyping && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-black rounded-lg border border-orange-100 transition-all text-left"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={onFormSubmit} className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 bg-gray-50 dark:bg-gray-950 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <button
                            type="submit"
                            className="h-12 w-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}

export default AISupportBot
