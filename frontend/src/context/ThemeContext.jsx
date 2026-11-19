
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('dev-theme')

        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme
        }

        return 'light'
    })

    useEffect(() => {
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark'
        )

        document.documentElement.style.colorScheme = theme

        localStorage.setItem('dev-theme', theme)

    }, [theme])

    function toggleTheme() {
        setTheme(current =>
            current === 'light' ? 'dark' : 'light'
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error(
            'useTheme must be used inside ThemeProvider'
        )
    }

    return context
}
