import {
    useEffect,
    useState
} from 'react'

import {
    Link,
    useParams
} from 'react-router-dom'

import {
    useAuth
} from '../context/AuthContext.jsx'

import CommentSection
    from '../components/CommentSection.jsx'


function PostDetails() {

    const {
        postId
    } = useParams()


    const {
        user,
        token
    } = useAuth()


    const [
        post,
        setPost
    ] = useState(null)


    const [
        loading,
        setLoading
    ] = useState(true)


    const [
        message,
        setMessage
    ] = useState('')


    const [
        isSaved,
        setIsSaved
    ] = useState(false)


    const [
        bookmarkLoading,
        setBookmarkLoading
    ] = useState(false)


    const [
        bookmarkMessage,
        setBookmarkMessage
    ] = useState('')


    useEffect(() => {
        loadPost()

        if (
            user &&
            token
        ) {
            checkBookmark()
        }

    }, [
        postId,
        token,
        user
    ])


    async function loadPost() {

        try {

            setLoading(true)
            setMessage('')


            const headers = {}


            if (token) {

                headers.Authorization =
                    `Bearer ${token}`

            }


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/posts/${postId}`,
                    {
                        method: 'GET',
                        headers
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setPost(null)

                setMessage(
                    data.message ||
                    'Unable to load the post.'
                )

                return
            }


            setPost(
                data.post
            )


        } catch (error) {

            console.error(
                'Post details error:',
                error
            )


            setPost(null)


            setMessage(
                'Unable to connect to the server.'
            )


        } finally {

            setLoading(false)

        }
    }


    // ----------------------------------------
    // CHECK IF POST IS ALREADY SAVED
    // ----------------------------------------

    async function checkBookmark() {

        try {

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/bookmarks`,
                    {
                        method:
                            'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {
                return
            }


            const savedPosts =
                Array.isArray(
                    data.posts
                )
                    ? data.posts
                    : []


            const alreadySaved =
                savedPosts.some(
                    (savedPost) =>
                        savedPost.id ===
                        postId
                )


            setIsSaved(
                alreadySaved
            )


        } catch (error) {

            console.error(
                'Check bookmark error:',
                error
            )

        }
    }


    // ----------------------------------------
    // SAVE / REMOVE BOOKMARK
    // ----------------------------------------

    async function handleBookmark() {

        if (
            !user ||
            !token
        ) {

            setBookmarkMessage(
                'Please login to save posts.'
            )

            return
        }


        try {

            setBookmarkLoading(true)
            setBookmarkMessage('')


            const method =
                isSaved
                    ? 'DELETE'
                    : 'POST'


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/bookmarks/${postId}`,
                    {
                        method,

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                setBookmarkMessage(
                    data.message ||
                    'Unable to update saved post.'
                )

                return
            }


            if (isSaved) {

                setIsSaved(false)

                setBookmarkMessage(
                    'Post removed from Saved Posts.'
                )

            } else {

                setIsSaved(true)

                setBookmarkMessage(
                    'Post saved successfully.'
                )

            }


        } catch (error) {

            console.error(
                'Bookmark error:',
                error
            )


            setBookmarkMessage(
                'Unable to update saved post.'
            )


        } finally {

            setBookmarkLoading(false)

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


    function getPostContent() {

        if (!post) {

            return ''

        }


        if (
            post.postType ===
            'article'
        ) {

            return (
                post.articleText ||
                ''
            )

        }


        return (
            post.description ||
            ''
        )
    }


    return (

        <main className="min-h-[80vh] bg-gray-50 px-6 py-12">

            <div className="max-w-4xl mx-auto">


                {/* BACK BUTTON */}

                <Link
                    to="/browse-posts"
                    className="text-blue-600 hover:underline font-medium"
                >
                    ← Back to Browse Posts
                </Link>


                {/* LOADING */}

                {loading && (

                    <div className="bg-white border border-gray-300 rounded-lg p-10 mt-6 text-center">

                        <p className="text-gray-600">
                            Loading post...
                        </p>

                    </div>

                )}


                {/* ERROR */}

                {!loading &&
                    message && (

                    <div className="bg-white border border-red-300 rounded-lg p-10 mt-6 text-center">

                        <h1 className="text-2xl font-bold mb-3">
                            Unable to open post
                        </h1>

                        <p className="text-red-600">
                            {message}
                        </p>

                    </div>

                )}


                {/* POST */}

                {!loading &&
                    !message &&
                    post && (

                    <article className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 mt-6">


                        {/* BADGES + DATE */}

                        <div className="flex flex-wrap justify-between items-start gap-4 mb-5">

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

                        <h1 className="text-3xl font-bold mb-4">

                            {
                                post.title
                            }

                        </h1>


                        {/* ARTICLE ABSTRACT */}

                        {post.postType ===
                            'article' &&
                            post.abstract && (

                            <p className="text-gray-600 italic mb-5">

                                {
                                    post.abstract
                                }

                            </p>

                        )}


                        {/* CONTENT */}

                        <p className="text-gray-700 whitespace-pre-wrap leading-7 mb-6">

                            {
                                getPostContent()
                            }

                        </p>


                        {/* TAGS */}

                        {Array.isArray(
                            post.tags
                        ) &&
                            post.tags.length >
                            0 && (

                            <div className="flex flex-wrap gap-2 mb-6">

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

                        <div className="text-sm text-gray-500 border-t pt-5">

                            Posted by{' '}

                            <span className="font-medium text-gray-700">

                                {
                                    post.authorName ||
                                    'DEV@Deakin User'
                                }

                            </span>

                        </div>


                        {/* HD FEATURE - BOOKMARK */}

                        <div className="mt-6">

                            {user ? (

                                <button
                                    type="button"
                                    onClick={
                                        handleBookmark
                                    }
                                    disabled={
                                        bookmarkLoading
                                    }
                                    className={`px-5 py-2 rounded font-medium ${
                                        isSaved
                                            ? 'border border-red-400 text-red-600 hover:bg-red-50'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >

                                    {
                                        bookmarkLoading
                                            ? 'Updating...'
                                            : isSaved
                                                ? 'Remove Saved Post'
                                                : 'Save Post'
                                    }

                                </button>

                            ) : (

                                <Link
                                    to="/login"
                                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
                                >
                                    Login to Save
                                </Link>

                            )}


                            {bookmarkMessage && (

                                <p
                                    className={`mt-3 text-sm ${
                                        bookmarkMessage
                                            .toLowerCase()
                                            .includes(
                                                'unable'
                                            ) ||
                                        bookmarkMessage
                                            .toLowerCase()
                                            .includes(
                                                'login'
                                            )
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                    }`}
                                >

                                    {
                                        bookmarkMessage
                                    }

                                </p>

                            )}

                        </div>


                        {/* HD FEATURE - COMMENTS */}

                        <CommentSection
                            postId={
                                post.id
                            }
                        />


                    </article>

                )}

            </div>

        </main>

    )
}


export default PostDetails