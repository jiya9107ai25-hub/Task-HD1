import {
    useEffect,
    useState
} from 'react'

import {
    Link
} from 'react-router-dom'

import {
    useAuth
} from '../context/AuthContext'


function SavedPosts() {

    const {
        user,
        token
    } = useAuth()


    const [
        savedPosts,
        setSavedPosts
    ] = useState([])


    const [
        loading,
        setLoading
    ] = useState(true)


    const [
        message,
        setMessage
    ] = useState('')


    useEffect(() => {

        if (user && token) {
            loadSavedPosts()
        } else {
            setLoading(false)
        }

    }, [user, token])


    async function loadSavedPosts() {

        try {

            setLoading(true)
            setMessage('')


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/bookmarks`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setMessage(
                    data.message ||
                    'Unable to load saved posts.'
                )

                return
            }


            setSavedPosts(
                Array.isArray(
                    data.posts
                )
                    ? data.posts
                    : []
            )


        } catch (error) {

            console.error(
                'Load bookmarks error:',
                error
            )

            setMessage(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)
        }
    }


    async function removeBookmark(
        postId
    ) {

        try {

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/bookmarks/${postId}`,
                    {
                        method:
                            'DELETE',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setMessage(
                    data.message ||
                    'Unable to remove bookmark.'
                )

                return
            }


            setSavedPosts(
                (previous) =>
                    previous.filter(
                        (post) =>
                            post.id !==
                            postId
                    )
            )


        } catch (error) {

            console.error(
                'Remove bookmark error:',
                error
            )

            setMessage(
                'Unable to remove bookmark.'
            )
        }
    }


    function formatDate(
        dateValue
    ) {

        if (!dateValue) {
            return 'Date unavailable'
        }


        const date =
            new Date(
                dateValue
            )


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return 'Date unavailable'
        }


        return date.toLocaleDateString(
            undefined,
            {
                day:
                    'numeric',

                month:
                    'short',

                year:
                    'numeric'
            }
        )
    }


    // ----------------------------------------
    // NOT LOGGED IN
    // ----------------------------------------

    if (!user) {

        return (
            <main className="min-h-[80vh] bg-gray-50 px-6 py-12">

                <div className="max-w-3xl mx-auto bg-white border border-gray-300 rounded-lg p-10 text-center">

                    <h1 className="text-3xl font-bold mb-4">
                        Saved Posts
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Please login to view your saved posts.
                    </p>

                    <Link
                        to="/login"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                    >
                        Login
                    </Link>

                </div>

            </main>
        )
    }


    return (
        <main className="min-h-[80vh] bg-gray-50 px-6 py-12">

            <div className="max-w-5xl mx-auto">


                {/* PAGE HEADING */}

                <div className="text-center mb-10">

                    <h1 className="text-4xl font-bold mb-3">
                        Saved Posts
                    </h1>

                    <p className="text-gray-600">
                        Posts you have bookmarked for later.
                    </p>

                </div>


                {/* ERROR */}

                {message && (

                    <p className="text-red-600 text-center mb-6">
                        {message}
                    </p>

                )}


                {/* LOADING */}

                {loading && (

                    <p className="text-center text-gray-600">
                        Loading saved posts...
                    </p>

                )}


                {/* EMPTY STATE */}

                {!loading &&
                    !message &&
                    savedPosts.length ===
                        0 && (

                    <div className="bg-white border border-gray-300 rounded-lg p-10 text-center">

                        <h2 className="text-xl font-bold mb-3">
                            No saved posts yet
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Save a post from the Post Details page and it will appear here.
                        </p>

                        <Link
                            to="/browse-posts"
                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                        >
                            Browse Posts
                        </Link>

                    </div>

                )}


                {/* SAVED POSTS */}

                <div className="space-y-5">

                    {savedPosts.map(
                        (post) => (

                            <article
                                key={
                                    post.id
                                }
                                className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm"
                            >


                                {/* BADGES + DATE */}

                                <div className="flex flex-wrap justify-between gap-4 mb-4">

                                    <div className="flex gap-2">

                                        <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full uppercase">
                                            {
                                                post.postType
                                            }
                                        </span>


                                        <span
                                            className={`text-sm font-semibold px-3 py-1 rounded-full uppercase ${
                                                post.plan ===
                                                'paid'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {
                                                post.plan
                                            }
                                        </span>

                                    </div>


                                    <span className="text-sm text-gray-500">
                                        {
                                            formatDate(
                                                post.createdAt
                                            )
                                        }
                                    </span>

                                </div>


                                {/* TITLE */}

                                <h2 className="text-2xl font-bold mb-3">
                                    {post.title}
                                </h2>


                                {/* ARTICLE ABSTRACT */}

                                {post.postType ===
                                    'article' &&
                                    post.abstract && (

                                    <p className="text-gray-600 italic mb-4">
                                        {
                                            post.abstract
                                        }
                                    </p>

                                )}


                                {/* QUESTION PREVIEW */}

                                {post.postType ===
                                    'question' &&
                                    post.description && (

                                    <p className="text-gray-700 mb-4">
                                        {
                                            post.description
                                        }
                                    </p>

                                )}


                                {/* TAGS */}

                                {Array.isArray(
                                    post.tags
                                ) &&
                                    post.tags.length >
                                    0 && (

                                    <div className="flex flex-wrap gap-2 mb-5">

                                        {post.tags.map(
                                            (
                                                tag,
                                                index
                                            ) => (

                                                <span
                                                    key={`${post.id}-${tag}-${index}`}
                                                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded"
                                                >
                                                    #{tag}
                                                </span>

                                            )
                                        )}

                                    </div>

                                )}


                                {/* AUTHOR */}

                                <p className="text-sm text-gray-500 mb-5">

                                    Posted by{' '}

                                    <span className="font-medium text-gray-700">
                                        {
                                            post.authorName ||
                                            'DEV@Deakin User'
                                        }
                                    </span>

                                </p>


                                {/* BUTTONS */}

                                <div className="flex flex-wrap gap-3">

                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded"
                                    >
                                        View Post
                                    </Link>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeBookmark(
                                                post.id
                                            )
                                        }
                                        className="border border-red-400 text-red-600 hover:bg-red-50 px-5 py-2 rounded"
                                    >
                                        Remove Saved Post
                                    </button>

                                </div>

                            </article>

                        )
                    )}

                </div>

            </div>

        </main>
    )
}


export default SavedPosts