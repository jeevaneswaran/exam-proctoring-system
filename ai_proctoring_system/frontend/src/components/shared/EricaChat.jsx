import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

const EricaChat = ({ context = "general" }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hello! I'm Erica, your AI Proctroring Assistant. I'm here to guide you through the exam setup and ensure a smooth experience. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (!inputValue.trim()) return

        const userMessage = {
            role: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        // Mock AI Response - In a real app, this would call an LLM API
        setTimeout(() => {
            let responseText = "I'm analyzing your request. Please ensure you remain within the camera's view at all times."

            if (inputValue.toLowerCase().includes('help')) {
                responseText = "I can help with hardware checks, environment calibration, or clarifying exam rules. What do you need specifically?"
            } else if (inputValue.toLowerCase().includes('rule')) {
                responseText = "The main rules are: 1. No secondary devices. 2. No other people in the room. 3. Stay in the camera frame. 4. No external tabs or windows."
            }

            const botMessage = {
                role: 'bot',
                text: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMessage])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-[#1A1612] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm tracking-tight">Erica</h3>
                                <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Online Assistant</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        p-3 rounded-2xl text-sm font-medium shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-amber-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800'}
                                    `}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Erica anything..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-[#1A1612] text-white rounded-lg hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Send className="h-4 w-4 text-amber-500" />
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Neural Guidance Powered
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group
                    ${isOpen ? 'bg-red-500 text-white' : 'bg-[#1A1612] text-white'}
                `}
            >
                {isOpen ? (
                    <X className="h-8 w-8" />
                ) : (
                    <div className="relative">
                        <Bot className="h-8 w-8 group-hover:text-amber-500 transition-colors" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full border-2 border-[#1A1612]"></div>
                    </div>
                )}
            </button>
        </div>
    )
}

export default EricaChat
