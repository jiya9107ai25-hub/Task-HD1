import {
    Routes,
    Route
} from 'react-router-dom'

import Header
    from './components/Header.jsx'

import Home
    from './pages/Home.jsx'

import Login
    from './pages/Login.jsx'

import ForgotPassword
    from './pages/ForgotPassword.jsx'

import Signup
    from './pages/Signup.jsx'

import Pricing
    from './pages/Pricing.jsx'

import Post
    from './pages/Post.jsx'

import BrowsePosts
    from './pages/BrowsePosts.jsx'

import PostDetails
    from './pages/PostDetails.jsx'

import SavedPosts
    from './pages/SavedPosts.jsx'

import AdminDashboard
    from './pages/AdminDashboard'

import {
    useAuth
} from './context/AuthContext'


function App() {

    const {
        user,
        updateUser
    } = useAuth()


    return (

        <>

            <Header />


            <Routes>


                {/* ====================================
                    HOME
                ==================================== */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                {/* ====================================
                    LOGIN
                ==================================== */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* ====================================
                    FORGOT PASSWORD / OTP
                ==================================== */}

                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />


                {/* ====================================
                    SIGN UP
                ==================================== */}

                <Route
                    path="/signup"
                    element={
                        <Signup />
                    }
                />


                {/* ====================================
                    PRICING
                ==================================== */}

                <Route
                    path="/pricing"
                    element={
                        <Pricing
                            user={
                                user
                            }
                            onUserUpdate={
                                updateUser
                            }
                        />
                    }
                />


                {/* ====================================
                    CREATE POST
                ==================================== */}

                <Route
                    path="/post"
                    element={
                        <Post
                            user={
                                user
                            }
                        />
                    }
                />


                {/* ====================================
                    BROWSE POSTS
                ==================================== */}

                <Route
                    path="/browse-posts"
                    element={
                        <BrowsePosts />
                    }
                />


                {/* ====================================
                    HD FEATURE:
                    POST DETAILS + COMMENTS
                ==================================== */}

                <Route
                    path="/posts/:postId"
                    element={
                        <PostDetails />
                    }
                />


                {/* ====================================
                    HD FEATURE:
                    SAVED POSTS
                ==================================== */}

                <Route
                    path="/saved-posts"
                    element={
                        <SavedPosts />
                    }
                />


                {/* ====================================
                    HD FEATURE:
                    ADMIN DASHBOARD
                ==================================== */}

                <Route
                    path="/admin"
                    element={
                        <AdminDashboard />
                    }
                />


            </Routes>

        </>

    )
}


export default App