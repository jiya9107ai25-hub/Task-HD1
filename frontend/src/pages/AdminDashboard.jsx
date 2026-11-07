import {
    useEffect,
    useReducer
} from 'react'

import {
    Link
} from 'react-router-dom'

import {
    useAuth
} from '../context/AuthContext.jsx'


// ====================================================
// HD1 - ADMIN DASHBOARD STATE WITH useReducer
// ====================================================

const initialState = {
    loading: true,

    message: '',

    stats: {
        totalUsers: 0,
        totalPosts: 0,
        freePosts: 0,
        paidPosts: 0,
        questions: 0,
        articles: 0,
        activePosts: 0,
        hiddenPosts: 0
    },

    posts: [],

    updatingPostId: null
}


function dashboardReducer(
    state,
    action
) {

    switch (
        action.type
    ) {

        case 'LOAD_START':

            return {
                ...state,

                loading:
                    true,

                message:
                    ''
            }


        case 'LOAD_SUCCESS':

            return {
                ...state,

                loading:
                    false,

                message:
                    '',

                stats:
                    action.payload.stats,

                posts:
                    action.payload.posts
            }


        case 'LOAD_ERROR':

            return {
                ...state,

                loading:
                    false,

                message:
                    action.payload
            }


        case 'UPDATE_START':

            return {
                ...state,

                updatingPostId:
                    action.payload,

                message:
                    ''
            }


        case 'UPDATE_SUCCESS':

            return {
                ...state,

                updatingPostId:
                    null,

                message:
                    action.payload.message,

                posts:
                    state.posts.map(
                        (post) => {

                            if (
                                post.id !==
                                action.payload.postId
                            ) {

                                return post
                            }


                            return {
                                ...post,

                                status:
                                    action.payload.status
                            }
                        }
                    ),

                stats: {

                    ...state.stats,

                    activePosts:
                        action.payload.status ===
                        'active'
                            ? state.stats.activePosts + 1
                            : state.stats.activePosts - 1,

                    hiddenPosts:
                        action.payload.status ===
                        'hidden'
                            ? state.stats.hiddenPosts + 1
                            : state.stats.hiddenPosts - 1
                }
            }


        case 'UPDATE_ERROR':

            return {
                ...state,

                updatingPostId:
                    null,

                message:
                    action.payload
            }


        default:

            return state
    }
}


// ====================================================
// ADMIN DASHBOARD
// ====================================================

function AdminDashboard() {

    const {
        user,
        token,
        role
    } = useAuth()


    const [
        state,
        dispatch
    ] = useReducer(
        dashboardReducer,
        initialState
    )


    useEffect(() => {

        if (
            user &&
            token &&
            role === 'admin'
        ) {

            loadDashboard()

        } else {

            dispatch({
                type:
                    'LOAD_ERROR',

                payload:
                    'Administrator access is required.'
            })
        }

    }, [
        user,
        token,
        role
    ])


    // ====================================================
    // LOAD DASHBOARD
    // ====================================================

    async function loadDashboard() {

        try {

            dispatch({
                type:
                    'LOAD_START'
            })


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/dashboard`,
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

                dispatch({
                    type:
                        'LOAD_ERROR',

                    payload:
                        data.message ||
                        'Unable to load the admin dashboard.'
                })

                return
            }


            dispatch({
                type:
                    'LOAD_SUCCESS',

                payload: {
                    stats:
                        data.stats,

                    posts:
                        Array.isArray(
                            data.posts
                        )
                            ? data.posts
                            : []
                }
            })


        } catch (error) {

            console.error(
                'Admin dashboard error:',
                error
            )


            dispatch({
                type:
                    'LOAD_ERROR',

                payload:
                    'Unable to connect to the server.'
            })
        }
    }


    // ====================================================
    // HIDE / RESTORE POST
    // ====================================================

    async function updatePostStatus(
        post
    ) {

        const shouldHide =
            post.status ===
            'active'


        const action =
            shouldHide
                ? 'hide'
                : 'restore'


        const newStatus =
            shouldHide
                ? 'hidden'
                : 'active'


        try {

            dispatch({
                type:
                    'UPDATE_START',

                payload:
                    post.id
            })


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/posts/${post.id}/${action}`,
                    {
                        method:
                            'PATCH',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {

                dispatch({
                    type:
                        'UPDATE_ERROR',

                    payload:
                        data.message ||
                        'Unable to update this post.'
                })

                return
            }


            dispatch({
                type:
                    'UPDATE_SUCCESS',

                payload: {
                    postId:
                        post.id,

                    status:
                        newStatus,

                    message:
                        data.message ||
                        'Post updated successfully.'
                }
            })


        } catch (error) {

            console.error(
                'Post moderation error:',
                error
            )


            dispatch({
                type:
                    'UPDATE_ERROR',

                payload:
                    'Unable to update this post.'
            })
        }
    }


    // ====================================================
    // DATE FORMATTER
    // ====================================================

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


    // ====================================================
    // ACCESS CHECK
    // ====================================================

    if (
        !user ||
        role !== 'admin'
    ) {

        return (

            <main className="min-h-[80vh] bg-gray-50 px-6 py-12">

                <div className="max-w-3xl mx-auto bg-white border border-red-300 rounded-lg p-10 text-center">

                    <h1 className="text-3xl font-bold mb-4">
                        Access Denied
                    </h1>

                    <p className="text-red-600 mb-6">
                        Administrator access is required.
                    </p>

                    <Link
                        to="/"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded"
                    >
                        Return Home
                    </Link>

                </div>

            </main>
        )
    }


    // ====================================================
    // PAGE
    // ====================================================

    return (

        <main className="min-h-[80vh] bg-gray-50 px-6 py-12">

            <div className="max-w-7xl mx-auto">


                {/* HEADER */}

                <div className="mb-10">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>

                            <h1 className="text-4xl font-bold mb-2">
                                Admin Dashboard
                            </h1>

                            <p className="text-gray-600">
                                Monitor DEV@Deakin activity and moderate posts.
                            </p>

                        </div>


                        <span className="bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-full">
                            Administrator
                        </span>

                    </div>

                </div>


                {/* LOADING */}

                {state.loading && (

                    <div className="bg-white border border-gray-300 rounded-lg p-10 text-center">

                        <p className="text-gray-600">
                            Loading dashboard...
                        </p>

                    </div>

                )}


                {/* MESSAGE */}

                {!state.loading &&
                    state.message && (

                    <div
                        className={`mb-6 border rounded-lg px-5 py-4 ${
                            state.message
                                .toLowerCase()
                                .includes(
                                    'success'
                                )
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : 'border-red-300 bg-red-50 text-red-700'
                        }`}
                    >

                        {
                            state.message
                        }

                    </div>

                )}


                {!state.loading && (

                    <>

                        {/* ================================= */}
                        {/* STATISTICS */}
                        {/* ================================= */}

                        <section className="mb-12">

                            <h2 className="text-2xl font-bold mb-5">
                                Platform Overview
                            </h2>


                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                                <StatCard
                                    title="Total Users"
                                    value={
                                        state.stats.totalUsers
                                    }
                                />


                                <StatCard
                                    title="Total Posts"
                                    value={
                                        state.stats.totalPosts
                                    }
                                />


                                <StatCard
                                    title="Free Posts"
                                    value={
                                        state.stats.freePosts
                                    }
                                />


                                <StatCard
                                    title="Paid Posts"
                                    value={
                                        state.stats.paidPosts
                                    }
                                />


                                <StatCard
                                    title="Questions"
                                    value={
                                        state.stats.questions
                                    }
                                />


                                <StatCard
                                    title="Articles"
                                    value={
                                        state.stats.articles
                                    }
                                />


                                <StatCard
                                    title="Active Posts"
                                    value={
                                        state.stats.activePosts
                                    }
                                />


                                <StatCard
                                    title="Hidden Posts"
                                    value={
                                        state.stats.hiddenPosts
                                    }
                                />

                            </div>

                        </section>


                        {/* ================================= */}
                        {/* MODERATION */}
                        {/* ================================= */}

                        <section>

                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Post Moderation
                                    </h2>

                                    <p className="text-gray-600 mt-1">
                                        Hide inappropriate posts or restore previously hidden content.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        loadDashboard
                                    }
                                    className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
                                >
                                    Refresh
                                </button>

                            </div>


                            {state.posts.length ===
                                0 ? (

                                <div className="bg-white border border-gray-300 rounded-lg p-10 text-center">

                                    <p className="text-gray-600">
                                        There are no posts to moderate.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {state.posts.map(
                                        (post) => (

                                            <article
                                                key={
                                                    post.id
                                                }
                                                className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm"
                                            >


                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">


                                                    {/* POST DETAILS */}

                                                    <div className="flex-1">


                                                        <div className="flex flex-wrap gap-2 mb-3">


                                                            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">

                                                                {
                                                                    post.postType
                                                                }

                                                            </span>


                                                            <span
                                                                className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
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


                                                            <span
                                                                className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
                                                                    post.status ===
                                                                    'hidden'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-emerald-100 text-emerald-700'
                                                                }`}
                                                            >

                                                                {
                                                                    post.status
                                                                }

                                                            </span>

                                                        </div>


                                                        <h3 className="text-xl font-bold mb-2">

                                                            {
                                                                post.title
                                                            }

                                                        </h3>


                                                        <div className="text-sm text-gray-500 space-y-1">

                                                            <p>

                                                                Posted by{' '}

                                                                <span className="font-medium text-gray-700">

                                                                    {
                                                                        post.authorName ||
                                                                        'DEV@Deakin User'
                                                                    }

                                                                </span>

                                                            </p>


                                                            <p>

                                                                {
                                                                    formatDate(
                                                                        post.createdAt
                                                                    )
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>


                                                    {/* MODERATION BUTTONS */}

                                                    <div className="flex flex-wrap gap-3">


                                                        {post.status ===
                                                        'active' && (

                                                            <Link
                                                                to={`/posts/${post.id}`}
                                                                className="bg-gray-900 text-white px-5 py-2 rounded hover:bg-black"
                                                            >
                                                                View
                                                            </Link>

                                                        )}


                                                        <button
                                                            type="button"
                                                            disabled={
                                                                state.updatingPostId ===
                                                                post.id
                                                            }
                                                            onClick={() =>
                                                                updatePostStatus(
                                                                    post
                                                                )
                                                            }
                                                            className={`px-5 py-2 rounded font-medium disabled:opacity-50 ${
                                                                post.status ===
                                                                'active'
                                                                    ? 'border border-red-400 text-red-600 hover:bg-red-50'
                                                                    : 'border border-green-500 text-green-700 hover:bg-green-50'
                                                            }`}
                                                        >

                                                            {
                                                                state.updatingPostId ===
                                                                post.id
                                                                    ? 'Updating...'
                                                                    : post.status ===
                                                                      'active'
                                                                        ? 'Hide Post'
                                                                        : 'Restore Post'
                                                            }

                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </>

                )}

            </div>

        </main>

    )
}


// ====================================================
// STAT CARD
// ====================================================

function StatCard({
    title,
    value
}) {

    return (

        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">

            <p className="text-gray-500 text-sm mb-2">
                {title}
            </p>

            <p className="text-3xl font-bold">
                {value}
            </p>

        </div>

    )
}


export default AdminDashboard