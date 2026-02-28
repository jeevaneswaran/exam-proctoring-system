import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    // Check if user has previously selected a theme, otherwise check system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('app-theme')
        if (savedTheme) {
            return savedTheme
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }
        return 'light'
    })

    useEffect(() => {
        const root = document.documentElement

        // Remove both classes to ensure clean state
        root.classList.remove('light', 'dark')

        // Add current theme class
        root.classList.add(theme)

        // Save to localStorage
        localStorage.setItem('app-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
