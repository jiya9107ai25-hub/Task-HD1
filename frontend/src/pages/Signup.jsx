import {
    useState
} from 'react'

import {
    Link,
    useNavigate
} from 'react-router-dom'

import {
    signInWithPopup
} from 'firebase/auth'

import {
    auth,
    googleProvider
} from '../firebase'

import {
    useAuth
} from '../context/AuthContext'


function Signup() {

    const navigate =
        useNavigate()


    const {
        login
    } = useAuth()


    const [
        name,
        setName
    ] = useState('')


    const [
        email,
        setEmail
    ] = useState('')


    const [
        password,
        setPassword
    ] = useState('')


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState('')


    const [
        message,
        setMessage
    ] = useState('')


    const [
        loading,
        setLoading
    ] = useState(false)


    const [
        googleLoading,
        setGoogleLoading
    ] = useState(false)


    // ====================================================
    // EMAIL VALIDATION
    // ====================================================

    const validateEmail = (
        emailValue
    ) => {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/


        return emailPattern.test(
            emailValue
        )
    }


    // ====================================================
    // NORMAL EMAIL / PASSWORD SIGNUP
    // ====================================================

    const handleSignup =
        async (
            event
        ) => {

            event.preventDefault()


            if (
                loading ||
                googleLoading
            ) {
                return
            }


            setMessage('')


            const cleanName =
                name.trim()


            const cleanEmail =
                email
                    .trim()
                    .toLowerCase()


            if (
                !cleanName ||
                !cleanEmail ||
                !password ||
                !confirmPassword
            ) {

                setMessage(
                    'Please complete all required fields.'
                )

                return
            }


            if (
                !validateEmail(
                    cleanEmail
                )
            ) {

                setMessage(
                    'Please enter a valid email address.'
                )

                return
            }


            if (
                password.length < 6
            ) {

                setMessage(
                    'Password must contain at least 6 characters.'
                )

                return
            }


            if (
                password !==
                confirmPassword
            ) {

                setMessage(
                    'Passwords do not match.'
                )

                return
            }


            try {

                setLoading(true)


                const response =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/register`,
                        {
                            method:
                                'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    name:
                                        cleanName,

                                    email:
                                        cleanEmail,

                                    password:
                                        password
                                })
                        }
                    )


                const data =
                    await response.json()


                if (
                    !response.ok
                ) {

                    setMessage(
                        data.message ||
                        'Unable to create your account.'
                    )

                    return
                }


                alert(
                    'Account created successfully! Please login.'
                )


                navigate(
                    '/login'
                )


            } catch (error) {

                console.error(
                    'Registration error:',
                    error
                )


                setMessage(
                    'Unable to connect to the server. Please try again.'
                )


            } finally {

                setLoading(false)

            }
        }


    // ====================================================
    // GOOGLE SIGNUP / LOGIN
    // ====================================================

    async function handleGoogleSignup() {

        if (
            loading ||
            googleLoading
        ) {
            return
        }


        setMessage('')


        try {

            setGoogleLoading(true)


            // --------------------------------------------
            // OPEN GOOGLE ACCOUNT POPUP
            // --------------------------------------------

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                )


            // --------------------------------------------
            // GET FIREBASE ID TOKEN
            // --------------------------------------------

            const firebaseIdToken =
                await result.user
                    .getIdToken(
                        true
                    )


            // --------------------------------------------
            // SEND VERIFIED GOOGLE TOKEN
            // TO YOUR EXPRESS BACKEND
            // --------------------------------------------

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/google`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                idToken:
                                    firebaseIdToken
                            })
                    }
                )


            const data =
                await response.json()


            if (
                !response.ok
            ) {

                setMessage(
                    data.message ||
                    'Unable to continue with Google.'
                )

                return
            }


            /*
                New Google email:
                - backend creates Firestore user
                - plan = free
                - role = user

                Existing Google email:
                - backend loads existing user
                - existing plan and role remain
            */

            login(
                data.user,
                data.token
            )


            navigate(
                '/',
                {
                    replace:
                        true
                }
            )


        } catch (error) {

            console.error(
                'Google signup error:',
                error
            )


            if (
                error?.code ===
                'auth/popup-closed-by-user'
            ) {

                setMessage(
                    'Google Sign-In was cancelled.'
                )

                return
            }


            if (
                error?.code ===
                'auth/popup-blocked'
            ) {

                setMessage(
                    'The Google Sign-In popup was blocked by your browser.'
                )

                return
            }


            setMessage(
                'Unable to continue with Google. Please try again.'
            )


        } finally {

            setGoogleLoading(false)

        }
    }


    return (

        <main className="min-h-[80vh] flex items-center justify-center px-6">


            <div className="w-full max-w-2xl border border-blue-400 p-10">


                <h1 className="text-2xl text-blue-500 text-center mb-10">
                    Create a DEV@Deakin Account
                </h1>


                <form
                    onSubmit={
                        handleSignup
                    }
                >


                    {/* NAME */}

                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-4 mb-6">

                        <label
                            htmlFor="name"
                            className="font-medium"
                        >
                            Name*
                        </label>


                        <input
                            id="name"
                            type="text"
                            value={
                                name
                            }
                            onChange={
                                (event) =>
                                    setName(
                                        event.target.value
                                    )
                            }
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="border border-gray-300 px-4 py-3 w-full"
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-4 mb-6">

                        <label
                            htmlFor="email"
                            className="font-medium"
                        >
                            Email*
                        </label>


                        <input
                            id="email"
                            type="email"
                            value={
                                email
                            }
                            onChange={
                                (event) =>
                                    setEmail(
                                        event.target.value
                                    )
                            }
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="border border-gray-300 px-4 py-3 w-full"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-4 mb-6">

                        <label
                            htmlFor="password"
                            className="font-medium"
                        >
                            Password*
                        </label>


                        <input
                            id="password"
                            type="password"
                            value={
                                password
                            }
                            onChange={
                                (event) =>
                                    setPassword(
                                        event.target.value
                                    )
                            }
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="border border-gray-300 px-4 py-3 w-full"
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-4 mb-8">

                        <label
                            htmlFor="confirmPassword"
                            className="font-medium"
                        >
                            Confirm password*
                        </label>


                        <input
                            id="confirmPassword"
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={
                                (event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                            }
                            required
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="border border-gray-300 px-4 py-3 w-full"
                        />

                    </div>


                    {/* MESSAGE */}

                    {message && (

                        <p
                            role="alert"
                            className="text-red-600 text-center mb-5"
                        >
                            {
                                message
                            }
                        </p>

                    )}


                    {/* CREATE BUTTON */}

                    <div className="md:ml-[196px]">

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3"
                        >

                            {
                                loading
                                    ? 'Creating...'
                                    : 'Create'
                            }

                        </button>

                    </div>

                </form>


                {/* ====================================
                    OR
                ==================================== */}

                <div className="flex items-center gap-4 my-7">

                    <div className="flex-1 border-t border-gray-300" />

                    <span className="text-sm text-gray-500">
                        OR
                    </span>

                    <div className="flex-1 border-t border-gray-300" />

                </div>


                {/* ====================================
                    GOOGLE SIGNUP
                ==================================== */}

                <div className="md:ml-[196px]">

                    <button
                        type="button"
                        onClick={
                            handleGoogleSignup
                        }
                        disabled={
                            loading ||
                            googleLoading
                        }
                        className="w-full border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 py-3 px-4 flex items-center justify-center gap-3"
                    >

                        <span
                            style={{
                                fontSize:
                                    '20px',

                                fontWeight:
                                    '700',

                                color:
                                    '#4285F4'
                            }}
                        >
                            G
                        </span>


                        <span>

                            {
                                googleLoading
                                    ? 'Connecting to Google...'
                                    : 'Continue with Google'
                            }

                        </span>

                    </button>

                </div>


                {/* LOGIN LINK */}

                <div className="text-center mt-6">

                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Already have an account? Login
                    </Link>

                </div>

            </div>

        </main>
    )
}


export default Signup