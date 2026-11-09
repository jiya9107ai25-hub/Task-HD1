import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
    const navigate = useNavigate()

    const {
        user,
        role,
        logout
    } = useAuth()

    function handleLogout() {
        logout()

        navigate('/', {
            replace: true
        })
    }

    return (
        <header className="bg-gray-100 border-b border-gray-300">

            <nav className="flex items-center gap-4 px-8 py-3">

                <Link
                    to="/"
                    className="font-bold text-xl text-gray-900 whitespace-nowrap"
                >
                    DEV@Deakin
                </Link>

                <div className="w-56">
                    <input
                        type="text"
                        placeholder="Search..."
                        aria-label="Search"
                        className="w-full bg-white border border-gray-300 px-4 py-2 outline-none"
                    />
                </div>

                <Link
                    to="/post"
                    className="ml-auto text-gray-900 font-medium px-3 hover:text-blue-600"
                >
                    Post
                </Link>

                <Link
                    to="/browse-posts"
                    className="text-gray-900 font-medium px-3 hover:text-blue-600"
                >
                    Browse Posts
                </Link>

                {user && (
                    <Link
                        to="/saved-posts"
                        className="text-gray-900 font-medium px-3 hover:text-blue-600"
                    >
                        Saved Posts
                    </Link>
                )}

                <Link
                    to="/pricing"
                    className="text-gray-900 font-medium px-3 hover:text-blue-600"
                >
                    Pricing
                </Link>

                {/* HD FEATURE:
                    Admin link is only shown for admin users.

                    IMPORTANT:
                    This is only a UI convenience.
                    The backend must still protect
                    all admin API endpoints.
                */}
                {user && role === 'admin' && (
                    <Link
                        to="/admin"
                        className="text-purple-700 font-semibold px-3 hover:text-purple-900"
                    >
                        Admin
                    </Link>
                )}

                {user ? (
                    <>
                        <div className="flex items-center gap-2">

                            <span className="text-sm text-blue-600">
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
                            className="text-gray-900 font-medium px-3 hover:text-blue-600"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="text-gray-900 font-medium px-3 hover:text-blue-600"
                    >
                        Login
                    </Link>
                )}

            </nav>

        </header>
    )
}

export default Header