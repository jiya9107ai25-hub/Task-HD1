
import {
    createContext,
    useContext,
    useState
} from "react";

import type {
    ReactNode
} from "react";

import type {
    User,
    UserPlan,
    UserRole
} from "../types";


// ====================================================
// CONTEXT TYPES
// ====================================================

interface AuthContextValue {
    user: User | null;

    token: string | null;

    isLoggedIn: boolean;

    plan: UserPlan;

    role: UserRole;

    login: (
        userData: User,
        token: string
    ) => void;

    logout: () => void;

    updateUser: (
        userData: User
    ) => void;
}


interface AuthProviderProps {
    children: ReactNode;
}


// ====================================================
// CONTEXT
// ====================================================

const AuthContext =
    createContext<AuthContextValue | null>(null);


// ====================================================
// AUTH PROVIDER
// ====================================================

export function AuthProvider({
    children
}: AuthProviderProps) {

    // ====================================================
    // CURRENT USER
    // ====================================================

    const [user, setUser] = useState<User | null>(() => {

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {

            const parsedUser: User = JSON.parse(storedUser);

            return parsedUser;

        } catch (error) {

            console.error(
                "Unable to parse stored user:",
                error
            );

            return null;
        }
    });


    // ====================================================
    // CURRENT AUTHENTICATION TOKEN
    // ====================================================

    const [token, setToken] = useState<string | null>(() => {

        return localStorage.getItem("token");

    });


    // ====================================================
    // LOGIN
    // ====================================================

    function login(
        userData: User,
        newToken: string
    ): void {

        setUser(userData);

        setToken(newToken);

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "token",
            newToken
        );

    }


    // ====================================================
    // LOGOUT
    // ====================================================

    function logout(): void {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setToken(null);

        setUser(null);

    }


    // ====================================================
    // UPDATE USER
    // ====================================================

    function updateUser(
        userData: User
    ): void {

        setUser(userData);

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

    }


    // ====================================================
    // CONTEXT VALUE
    // ====================================================

    const value: AuthContextValue = {

        user,

        token,

        isLoggedIn: Boolean(user && token),

        plan: user?.plan || "free",

        role: user?.role || "user",

        login,

        logout,

        updateUser

    };


    // ====================================================
    // AUTH PROVIDER
    // ====================================================

    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>

    );

}


// ====================================================
// CUSTOM AUTH HOOK
// ====================================================

export function useAuth(): AuthContextValue {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;

}
