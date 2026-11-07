import {
    Routes,
    Route
} from 'react-router-dom'

import Header from './components/Header.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Pricing from './pages/Pricing.jsx'
import Post from './pages/Post.jsx'
import BrowsePosts from './pages/BrowsePosts.jsx'

import PostDetails from './pages/PostDetails.jsx'
import SavedPosts from './pages/SavedPosts.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

import {
    useAuth
} from './context/AuthContext.jsx'


function App() {

    const {
        user,
        updateUser
    } = useAuth()

    return (
        <>
            <Header />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/pricing"
                    element={
                        <Pricing
                            user={user}
                            onUserUpdate={updateUser}
                        />
                    }
                />

                <Route
                    path="/post"
                    element={
                        <Post
                            user={user}
                        />
                    }
                />

                <Route
                    path="/browse-posts"
                    element={
                        <BrowsePosts />
                    }
                />

                {/* HD FEATURE:
                    Full post page with comments */}
                <Route
                    path="/posts/:postId"
                    element={
                        <PostDetails />
                    }
                />

                {/* HD FEATURE:
                    Persistent saved posts */}
                <Route
                    path="/saved-posts"
                    element={
                        <SavedPosts />
                    }
                />

                {/* HD FEATURE:
                    Role-based admin dashboard */}
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