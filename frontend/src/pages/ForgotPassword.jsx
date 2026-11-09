import {
    useState
} from 'react'

import {
    Link,
    useNavigate
} from 'react-router-dom'


function ForgotPassword() {

    const navigate =
        useNavigate()


    const [
        step,
        setStep
    ] = useState(1)


    const [
        email,
        setEmail
    ] = useState('')


    const [
        otp,
        setOtp
    ] = useState('')


    const [
        resetToken,
        setResetToken
    ] = useState('')


    const [
        newPassword,
        setNewPassword
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
        error,
        setError
    ] = useState('')


    const [
        loading,
        setLoading
    ] = useState(false)


    // ====================================================
    // SEND OTP
    // ====================================================

    async function handleSendOtp(
        event
    ) {

        event.preventDefault()

        setError('')
        setMessage('')


        const cleanEmail =
            email
                .trim()
                .toLowerCase()


        if (!cleanEmail) {

            setError(
                'Please enter your email address.'
            )

            return
        }


        try {

            setLoading(true)


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/forgot-password/send-otp`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                email:
                                    cleanEmail
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setError(
                    data.message ||
                    'Unable to send the verification code.'
                )

                return
            }


            setEmail(
                cleanEmail
            )


            setMessage(
                data.message ||
                'Verification code sent.'
            )


            setStep(2)


        } catch (error) {

            console.error(
                'Send OTP error:',
                error
            )


            setError(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)

        }
    }


    // ====================================================
    // VERIFY OTP
    // ====================================================

    async function handleVerifyOtp(
        event
    ) {

        event.preventDefault()

        setError('')
        setMessage('')


        const cleanOtp =
            otp.trim()


        if (
            !/^\d{6}$/.test(
                cleanOtp
            )
        ) {

            setError(
                'Please enter the 6-digit verification code.'
            )

            return
        }


        try {

            setLoading(true)


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/forgot-password/verify-otp`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                email,
                                otp:
                                    cleanOtp
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setError(
                    data.message ||
                    'Unable to verify the code.'
                )

                return
            }


            if (!data.resetToken) {

                setError(
                    'Password reset session could not be created.'
                )

                return
            }


            setResetToken(
                data.resetToken
            )


            setMessage(
                'Verification successful. Create your new password.'
            )


            setStep(3)


        } catch (error) {

            console.error(
                'Verify OTP error:',
                error
            )


            setError(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)

        }
    }


    // ====================================================
    // RESEND OTP
    // ====================================================

    async function handleResendOtp() {

        setError('')
        setMessage('')


        try {

            setLoading(true)


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/forgot-password/send-otp`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                email
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setError(
                    data.message ||
                    'Unable to resend the verification code.'
                )

                return
            }


            setOtp('')


            setMessage(
                data.message ||
                'A new verification code has been sent.'
            )


        } catch (error) {

            console.error(
                'Resend OTP error:',
                error
            )


            setError(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)

        }
    }


    // ====================================================
    // RESET PASSWORD
    // ====================================================

    async function handleResetPassword(
        event
    ) {

        event.preventDefault()

        setError('')
        setMessage('')


        if (
            newPassword.length < 6
        ) {

            setError(
                'Password must contain at least 6 characters.'
            )

            return
        }


        if (
            newPassword !==
            confirmPassword
        ) {

            setError(
                'The passwords do not match.'
            )

            return
        }


        if (!resetToken) {

            setError(
                'Your password reset session is invalid. Please request another code.'
            )

            return
        }


        try {

            setLoading(true)


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/forgot-password/reset`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({

                                resetToken,

                                newPassword,

                                confirmPassword
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setError(
                    data.message ||
                    'Unable to reset your password.'
                )

                return
            }


            setMessage(
                data.message ||
                'Password reset successfully.'
            )


            setStep(4)


        } catch (error) {

            console.error(
                'Reset password error:',
                error
            )


            setError(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)

        }
    }


    // ====================================================
    // UI
    // ====================================================

    return (

        <main
            style={{
                minHeight:
                    '80vh',

                display:
                    'flex',

                justifyContent:
                    'center',

                alignItems:
                    'center',

                padding:
                    '40px 20px',

                background:
                    '#ffffff'
            }}
        >

            <div
                style={{
                    width:
                        '100%',

                    maxWidth:
                        '480px',

                    border:
                        '1px solid #60a5fa',

                    padding:
                        '36px',

                    background:
                        '#ffffff'
                }}
            >


                {/* ========================================
                    STEP 1 - EMAIL
                ======================================== */}

                {step === 1 && (

                    <>

                        <h2
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#2563eb',

                                marginBottom:
                                    '12px'
                            }}
                        >
                            Forgot Password?
                        </h2>


                        <p
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#6b7280',

                                marginBottom:
                                    '30px'
                            }}
                        >
                            Enter your registered email address and we will send you a 6-digit verification code.
                        </p>


                        <form
                            onSubmit={
                                handleSendOtp
                            }
                        >

                            <label
                                htmlFor="reset-email"
                                style={{
                                    display:
                                        'block',

                                    fontWeight:
                                        '600',

                                    marginBottom:
                                        '8px'
                                }}
                            >
                                Email
                            </label>


                            <input
                                id="reset-email"
                                type="email"
                                required
                                value={
                                    email
                                }
                                onChange={
                                    (event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                placeholder="Enter your email"
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        '1px solid #d1d5db',

                                    marginBottom:
                                        '22px',

                                    boxSizing:
                                        'border-box'
                                }}
                            />


                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        'none',

                                    background:
                                        loading
                                            ? '#93c5fd'
                                            : '#3b82f6',

                                    color:
                                        '#ffffff',

                                    cursor:
                                        loading
                                            ? 'not-allowed'
                                            : 'pointer',

                                    fontWeight:
                                        '600'
                                }}
                            >

                                {
                                    loading
                                        ? 'Sending...'
                                        : 'Send OTP'
                                }

                            </button>

                        </form>

                    </>

                )}


                {/* ========================================
                    STEP 2 - VERIFY OTP
                ======================================== */}

                {step === 2 && (

                    <>

                        <h2
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#2563eb',

                                marginBottom:
                                    '12px'
                            }}
                        >
                            Verify Code
                        </h2>


                        <p
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#6b7280',

                                marginBottom:
                                    '8px'
                            }}
                        >
                            We sent a 6-digit verification code to
                        </p>


                        <p
                            style={{
                                textAlign:
                                    'center',

                                fontWeight:
                                    '600',

                                marginBottom:
                                    '28px'
                            }}
                        >
                            {email}
                        </p>


                        <form
                            onSubmit={
                                handleVerifyOtp
                            }
                        >

                            <label
                                htmlFor="otp"
                                style={{
                                    display:
                                        'block',

                                    fontWeight:
                                        '600',

                                    marginBottom:
                                        '8px'
                                }}
                            >
                                Verification Code
                            </label>


                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                required
                                value={
                                    otp
                                }
                                onChange={
                                    (event) => {

                                        const value =
                                            event
                                                .target
                                                .value
                                                .replace(
                                                    /\D/g,
                                                    ''
                                                )
                                                .slice(
                                                    0,
                                                    6
                                                )

                                        setOtp(
                                            value
                                        )
                                    }
                                }
                                placeholder="Enter 6-digit OTP"
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '14px',

                                    border:
                                        '1px solid #d1d5db',

                                    marginBottom:
                                        '22px',

                                    boxSizing:
                                        'border-box',

                                    textAlign:
                                        'center',

                                    fontSize:
                                        '22px',

                                    letterSpacing:
                                        '8px'
                                }}
                            />


                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        'none',

                                    background:
                                        loading
                                            ? '#93c5fd'
                                            : '#3b82f6',

                                    color:
                                        '#ffffff',

                                    cursor:
                                        loading
                                            ? 'not-allowed'
                                            : 'pointer',

                                    fontWeight:
                                        '600'
                                }}
                            >

                                {
                                    loading
                                        ? 'Verifying...'
                                        : 'Verify OTP'
                                }

                            </button>

                        </form>


                        <div
                            style={{
                                textAlign:
                                    'center',

                                marginTop:
                                    '20px'
                            }}
                        >

                            <button
                                type="button"
                                disabled={
                                    loading
                                }
                                onClick={
                                    handleResendOtp
                                }
                                style={{
                                    border:
                                        'none',

                                    background:
                                        'transparent',

                                    color:
                                        '#2563eb',

                                    cursor:
                                        'pointer',

                                    textDecoration:
                                        'underline'
                                }}
                            >
                                Resend code
                            </button>

                        </div>

                    </>

                )}


                {/* ========================================
                    STEP 3 - NEW PASSWORD
                ======================================== */}

                {step === 3 && (

                    <>

                        <h2
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#2563eb',

                                marginBottom:
                                    '12px'
                            }}
                        >
                            Create New Password
                        </h2>


                        <p
                            style={{
                                textAlign:
                                    'center',

                                color:
                                    '#6b7280',

                                marginBottom:
                                    '28px'
                            }}
                        >
                            Your email has been verified. Enter your new password below.
                        </p>


                        <form
                            onSubmit={
                                handleResetPassword
                            }
                        >

                            <label
                                htmlFor="new-password"
                                style={{
                                    display:
                                        'block',

                                    fontWeight:
                                        '600',

                                    marginBottom:
                                        '8px'
                                }}
                            >
                                New Password
                            </label>


                            <input
                                id="new-password"
                                type="password"
                                minLength={6}
                                required
                                value={
                                    newPassword
                                }
                                onChange={
                                    (event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                }
                                placeholder="Enter new password"
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        '1px solid #d1d5db',

                                    marginBottom:
                                        '20px',

                                    boxSizing:
                                        'border-box'
                                }}
                            />


                            <label
                                htmlFor="confirm-new-password"
                                style={{
                                    display:
                                        'block',

                                    fontWeight:
                                        '600',

                                    marginBottom:
                                        '8px'
                                }}
                            >
                                Confirm Password
                            </label>


                            <input
                                id="confirm-new-password"
                                type="password"
                                minLength={6}
                                required
                                value={
                                    confirmPassword
                                }
                                onChange={
                                    (event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                }
                                placeholder="Confirm new password"
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        '1px solid #d1d5db',

                                    marginBottom:
                                        '22px',

                                    boxSizing:
                                        'border-box'
                                }}
                            />


                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                style={{
                                    width:
                                        '100%',

                                    padding:
                                        '12px',

                                    border:
                                        'none',

                                    background:
                                        loading
                                            ? '#93c5fd'
                                            : '#3b82f6',

                                    color:
                                        '#ffffff',

                                    cursor:
                                        loading
                                            ? 'not-allowed'
                                            : 'pointer',

                                    fontWeight:
                                        '600'
                                }}
                            >

                                {
                                    loading
                                        ? 'Resetting...'
                                        : 'Reset Password'
                                }

                            </button>

                        </form>

                    </>

                )}


                {/* ========================================
                    STEP 4 - SUCCESS
                ======================================== */}

                {step === 4 && (

                    <div
                        style={{
                            textAlign:
                                'center'
                        }}
                    >

                        <div
                            style={{
                                fontSize:
                                    '52px',

                                marginBottom:
                                    '15px'
                            }}
                        >
                            ✓
                        </div>


                        <h2
                            style={{
                                color:
                                    '#16a34a',

                                marginBottom:
                                    '14px'
                            }}
                        >
                            Password Reset Successful
                        </h2>


                        <p
                            style={{
                                color:
                                    '#6b7280',

                                marginBottom:
                                    '28px'
                            }}
                        >
                            Your password has been changed successfully. You can now log in using your new password.
                        </p>


                        <button
                            type="button"
                            onClick={
                                () =>
                                    navigate(
                                        '/login'
                                    )
                            }
                            style={{
                                width:
                                    '100%',

                                padding:
                                    '12px',

                                border:
                                    'none',

                                background:
                                    '#3b82f6',

                                color:
                                    '#ffffff',

                                cursor:
                                    'pointer',

                                fontWeight:
                                    '600'
                            }}
                        >
                            Back to Login
                        </button>

                    </div>

                )}


                {/* ========================================
                    MESSAGES
                ======================================== */}

                {error && (

                    <div
                        style={{
                            marginTop:
                                '20px',

                            padding:
                                '12px',

                            background:
                                '#fef2f2',

                            border:
                                '1px solid #fecaca',

                            color:
                                '#dc2626'
                        }}
                    >
                        {error}
                    </div>

                )}


                {message &&
                    !error &&
                    step !== 4 && (

                    <div
                        style={{
                            marginTop:
                                '20px',

                            padding:
                                '12px',

                            background:
                                '#f0fdf4',

                            border:
                                '1px solid #bbf7d0',

                            color:
                                '#15803d'
                        }}
                    >
                        {message}
                    </div>

                )}


                {step !== 4 && (

                    <div
                        style={{
                            textAlign:
                                'center',

                            marginTop:
                                '25px'
                        }}
                    >

                        <Link
                            to="/login"
                            style={{
                                color:
                                    '#2563eb',

                                textDecoration:
                                    'none'
                            }}
                        >
                            Back to Login
                        </Link>

                    </div>

                )}

            </div>

        </main>
    )
}


export default ForgotPassword