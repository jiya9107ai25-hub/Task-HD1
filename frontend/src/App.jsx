
import { Routes, Route } from 'react-router-dom'

import Header from './components/Header.jsx'
import DevBuddy from './components/DevBuddy.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Signup from './pages/Signup.jsx'
import Pricing from './pages/Pricing.jsx'
import Post from './pages/Post.jsx'
import BrowsePosts from './pages/BrowsePosts.jsx'
import PostDetails from './pages/PostDetails.jsx'
import SavedPosts from './pages/SavedPosts.jsx'
import AdminDashboard from './pages/AdminDashboard'

import { useAuth } from './context/AuthContext'

function App() {
    const { user, updateUser } = useAuth()

    return (
        <>
            {/* GLOBAL HEADER */}
            <Header />

            {/* APPLICATION ROUTES */}
            <Routes>
                {/* HOME */}
                <Route path="/" element={<Home />} />

                {/* AUTHENTICATION */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/signup" element={<Signup />} />

                {/* PRICING */}
                <Route
                    path="/pricing"
                    element={
                        <Pricing
                            user={user}
                            onUserUpdate={updateUser}
                        />
                    }
                />

                {/* CREATE POST */}
                <Route
                    path="/post"
                    element={<Post user={user} />}
                />

                {/* BROWSE POSTS */}
                <Route
                    path="/browse-posts"
                    element={<BrowsePosts />}
                />

                {/* POST DETAILS */}
                <Route
                    path="/posts/:postId"
                    element={<PostDetails />}
                />

                {/* SAVED POSTS */}
                <Route
                    path="/saved-posts"
                    element={<SavedPosts />}
                />

                {/* ADMIN DASHBOARD */}
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />
            </Routes>

            {/* GLOBAL DEVBUDDY ASSISTANT */}
            <DevBuddy />
        </>
    )
}

export default App
