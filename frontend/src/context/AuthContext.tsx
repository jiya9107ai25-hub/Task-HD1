import {
    createContext,
    useContext,
    useState
} from 'react'

import type {
    ReactNode
} from 'react'

import type {
    User,
    UserPlan,
    UserRole
} from '../types'


// ====================================================
// CONTEXT TYPES
// ====================================================

interface AuthContextValue {
    user: User | null

    token: string | null

    isLoggedIn: boolean

    plan: UserPlan

    role: UserRole

    login: (
        userData: User,
        token: string
    ) => void

    logout: () => void

    updateUser: (
        userData: User
    ) => void
}


interface AuthProviderProps {
    children: ReactNode
}


// ====================================================
// CONTEXT
// ====================================================

const AuthContext =
    createContext<AuthContextValue | null>(
        null
    )


// ====================================================
// AUTH PROVIDER
// ====================================================

export function AuthProvider({
    children
}: AuthProviderProps) {

    const [
        user,
        setUser
    ] = useState<User | null>(
        () => {

            const storedUser =
                localStorage.getItem(
                    'user'
                )


            if (!storedUser) {
                return null
            }


            try {

                const parsedUser:
                    User =
                    JSON.parse(
                        storedUser
                    )

                return parsedUser

            } catch (error) {

                console.error(
                    'Unable to parse stored user:',
                    error
                )

                return null
            }
        }
    )


    // ====================================================
    // LOGIN
    // ====================================================

    function login(
        userData: User,
        token: string
    ): void {

        setUser(
            userData
        )


        localStorage.setItem(
            'user',
            JSON.stringify(
                userData
            )
        )


        if (token) {

            localStorage.setItem(
                'token',
                token
            )

        }
    }


    // ====================================================
    // LOGOUT
    // ====================================================

    function logout():
        void {

        localStorage.removeItem(
            'token'
        )


        localStorage.removeItem(
            'user'
        )


        setUser(
            null
        )
    }


    // ====================================================
    // UPDATE USER
    // ====================================================

    function updateUser(
        userData: User
    ): void {

        setUser(
            userData
        )


        localStorage.setItem(
            'user',
            JSON.stringify(
                userData
            )
        )
    }


    // ====================================================
    // CURRENT TOKEN
    // ====================================================

    const token:
        string | null =
        localStorage.getItem(
            'token'
        )


    // ====================================================
    // CONTEXT VALUE
    // ====================================================

    const value:
        AuthContextValue = {

        user,

        token,

        isLoggedIn:
            Boolean(user),

        plan:
            user?.plan ||
            'free',

        role:
            user?.role ||
            'user',

        login,

        logout,

        updateUser
    }


    return (

        <AuthContext.Provider
            value={
                value
            }
        >

            {children}

        </AuthContext.Provider>

    )
}


// ====================================================
// CUSTOM AUTH HOOK
// ====================================================

export function useAuth():
    AuthContextValue {

    const context =
        useContext(
            AuthContext
        )


    if (!context) {

        throw new Error(
            'useAuth must be used inside AuthProvider'
        )

    }


    return context
}