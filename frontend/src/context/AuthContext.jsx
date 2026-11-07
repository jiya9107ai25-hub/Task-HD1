import {
    createContext,
    useContext,
    useState
} from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser =
            localStorage.getItem('user')

        if (!storedUser) {
            return null
        }

        try {
            return JSON.parse(storedUser)
        } catch {
            return null
        }
    })

    function login(userData, token) {
        setUser(userData)

        localStorage.setItem(
            'user',
            JSON.stringify(userData)
        )

        if (token) {
            localStorage.setItem(
                'token',
                token
            )
        }
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setUser(null)
    }

    function updateUser(userData) {
        setUser(userData)

        localStorage.setItem(
            'user',
            JSON.stringify(userData)
        )
    }

    const value = {
        user,

        token:
            localStorage.getItem('token'),

        isLoggedIn:
            Boolean(user),

        plan:
            user?.plan || 'free',

        role:
            user?.role || 'user',

        login,
        logout,
        updateUser
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context =
        useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        )
    }

    return context
}