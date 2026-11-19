
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Header() {
    const navigate = useNavigate()

    const {
        user,
        role,
        logout
    } = useAuth()

    const {
        theme,
        toggleTheme
    } = useTheme()

    function handleLogout() {
        logout()

        navigate('/', {
            replace: true
        })
    }

    const isDark = theme === 'dark'

    const navLinkClass = `
        font-medium px-3 py-2
        transition-colors duration-200
        ${isDark
            ? 'text-gray-200 hover:text-blue-400'
            : 'text-gray-900 hover:text-blue-600'
        }
    `

    return (
        <header
            className={`border-b transition-colors duration-200 ${
                isDark
                    ? 'bg-gray-900 border-gray-700'
                    : 'bg-gray-100 border-gray-300'
            }`}
        >

            <nav className="flex flex-wrap items-center gap-4 px-8 py-3">

                {/* Logo */}

                <Link
                    to="/"
                    className={`font-bold text-xl whitespace-nowrap ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                    DEV@Deakin
                </Link>


                {/* Search */}

                <div className="w-56">
                    <input
                        type="text"
                        placeholder="Search..."
                        aria-label="Search"
                        className={`w-full border px-4 py-2 outline-none rounded-md transition-colors ${
                            isDark
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        }`}
                    />
                </div>


                {/* Post */}

                <Link
                    to="/post"
                    className={`ml-auto ${navLinkClass}`}
                >
                    Post
                </Link>


                {/* Browse Posts */}

                <Link
                    to="/browse-posts"
                    className={navLinkClass}
                >
                    Browse Posts
                </Link>


                {/* Saved Posts */}

                {user && (
                    <Link
                        to="/saved-posts"
                        className={navLinkClass}
                    >
                        Saved Posts
                    </Link>
                )}



                {/* Pricing */}

                <Link
                    to="/pricing"
                    className={navLinkClass}
                >
                    Pricing
                </Link>


                {/* Admin */}

                {user && role === 'admin' && (
                    <Link
                        to="/admin"
                        className={`font-semibold px-3 py-2 ${
                            isDark
                                ? 'text-purple-400 hover:text-purple-300'
                                : 'text-purple-700 hover:text-purple-900'
                        }`}
                    >
                        Admin
                    </Link>
                )}


                {/* Theme Toggle */}

                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 font-medium transition-all duration-200 ${
                        isDark
                            ? 'bg-gray-800 border-gray-600 text-yellow-300 hover:bg-gray-700'
                            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                    <span className="text-lg">
                        {isDark ? '☀️' : '🌙'}
                    </span>

                    <span className="text-sm">
                        {isDark ? 'Light' : 'Dark'}
                    </span>
                </button>


                {/* Authentication */}

                {user ? (
                    <>

                        <div className="flex flex-wrap items-center gap-2">

                            <span
                                className={`text-sm ${
                                    isDark
                                        ? 'text-blue-400'
                                        : 'text-blue-600'
                                }`}
                            >
                                {user.email}
                            </span>


                            {user.plan && (
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
                                        user.plan === 'paid'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}
                                >
                                    {user.plan}
                                </span>
                            )}


                            {role === 'admin' && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                    ADMIN
                                </span>
                            )}

                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className={navLinkClass}
                        >
                            Logout
                        </button>

                    </>
                ) : (

                    <Link
                        to="/login"
                        className={navLinkClass}
                    >
                        Login
                    </Link>

                )}

            </nav>

        </header>
    )
}

export default Header
