import {
    startTransition,
    useEffect,
    useOptimistic,
    useState
} from 'react'

import {
    Link
} from 'react-router-dom'

import {
    useAuth
} from '../context/AuthContext.jsx'

import CommentItem from './CommentItem.jsx'


function CommentSection({
    postId
}) {
    const {
        user,
        token
    } = useAuth()


    const [
        comments,
        setComments
    ] =
        useState([])


    /*
        HD REACT CONCEPT: useOptimistic

        The optimistic version allows a new
        comment/reply to appear immediately
        before the backend request finishes.
    */
    const [
        optimisticComments,
        addOptimisticComment
    ] =
        useOptimistic(
            comments,
            (
                currentComments,
                newComment
            ) => [
                ...currentComments,
                newComment
            ]
        )


    const [
        newComment,
        setNewComment
    ] =
        useState('')


    const [
        loading,
        setLoading
    ] =
        useState(true)


    const [
        submitting,
        setSubmitting
    ] =
        useState(false)


    const [
        message,
        setMessage
    ] =
        useState('')


    useEffect(() => {
        loadComments()
    }, [postId])


    async function loadComments() {
        try {
            setLoading(true)
            setMessage('')

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`
                )

            const data =
                await response.json()

            if (!response.ok) {
                setMessage(
                    data.message ||
                    'Unable to load comments.'
                )

                return
            }

            setComments(
                Array.isArray(
                    data.comments
                )
                    ? data.comments
                    : []
            )

        } catch (error) {
            console.error(
                'Load comments error:',
                error
            )

            setMessage(
                'Unable to load comments.'
            )

        } finally {
            setLoading(false)
        }
    }


    async function handleCommentSubmit(
        event
    ) {
        event.preventDefault()

        if (
            submitting ||
            !user
        ) {
            return
        }

        const cleanComment =
            newComment.trim()

        if (!cleanComment) {
            setMessage(
                'Please enter a comment.'
            )

            return
        }

        if (
            cleanComment.length >
            500
        ) {
            setMessage(
                'Comment must be 500 characters or fewer.'
            )

            return
        }


        const temporaryComment = {
            id:
                `temporary-${Date.now()}`,

            postId,

            userId:
                user.id,

            authorName:
                user.name,

            content:
                cleanComment,

            parentCommentId:
                null,

            createdAt:
                new Date()
                    .toISOString(),

            optimistic:
                true
        }


        /*
            Immediately show the comment.

            The backend request happens after
            this optimistic UI update.
        */
        startTransition(() => {
            addOptimisticComment(
                temporaryComment
            )
        })


        setNewComment('')
        setMessage('')


        try {
            setSubmitting(true)

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                content:
                                    cleanComment
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {
                setMessage(
                    data.message ||
                    'Unable to add comment.'
                )

                /*
                    Reloading removes the temporary
                    optimistic item if the backend
                    request failed.
                */
                await loadComments()

                return
            }


            setComments(
                (previous) => [
                    ...previous,
                    data.comment
                ]
            )


        } catch (error) {
            console.error(
                'Create comment error:',
                error
            )

            setMessage(
                'Unable to add comment. Please try again.'
            )

            await loadComments()

        } finally {
            setSubmitting(false)
        }
    }


    async function handleReply(
        parentCommentId,
        content
    ) {
        if (
            !user ||
            !token
        ) {
            setMessage(
                'Please login before replying.'
            )

            return false
        }


        const cleanReply =
            content.trim()


        if (!cleanReply) {
            return false
        }


        if (
            cleanReply.length >
            500
        ) {
            setMessage(
                'Reply must be 500 characters or fewer.'
            )

            return false
        }


        const temporaryReply = {
            id:
                `temporary-reply-${Date.now()}`,

            postId,

            userId:
                user.id,

            authorName:
                user.name,

            content:
                cleanReply,

            parentCommentId,

            createdAt:
                new Date()
                    .toISOString(),

            optimistic:
                true
        }


        startTransition(() => {
            addOptimisticComment(
                temporaryReply
            )
        })


        try {
            setSubmitting(true)
            setMessage('')


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/comments/${parentCommentId}/replies`,
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                content:
                                    cleanReply
                            })
                    }
                )


            const data =
                await response.json()


            if (!response.ok) {
                setMessage(
                    data.message ||
                    'Unable to add reply.'
                )

                await loadComments()

                return false
            }


            setComments(
                (previous) => [
                    ...previous,
                    data.comment
                ]
            )


            return true


        } catch (error) {
            console.error(
                'Create reply error:',
                error
            )

            setMessage(
                'Unable to add reply.'
            )

            await loadComments()

            return false

        } finally {
            setSubmitting(false)
        }
    }


    const parentComments =
        optimisticComments.filter(
            (comment) =>
                !comment.parentCommentId
        )


    function getReplies(
        commentId
    ) {
        return optimisticComments.filter(
            (comment) =>
                comment.parentCommentId ===
                commentId
        )
    }


    return (
        <section className="border-t mt-8 pt-8">

            <div className="flex justify-between items-center mb-5">

                <h2 className="text-2xl font-bold">
                    Comments
                </h2>

                <span className="text-sm text-gray-500">
                    {
                        parentComments.length
                    }{' '}
                    {
                        parentComments.length ===
                        1
                            ? 'comment'
                            : 'comments'
                    }
                </span>

            </div>


            {!user ? (

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">

                    <p className="text-gray-700">

                        Please{' '}

                        <Link
                            to="/login"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            login
                        </Link>

                        {' '}to join the discussion.

                    </p>

                </div>

            ) : (

                <form
                    onSubmit={
                        handleCommentSubmit
                    }
                    className="mb-8"
                >

                    <label
                        htmlFor="newComment"
                        className="block font-semibold mb-2"
                    >
                        Add a comment
                    </label>

                    <textarea
                        id="newComment"
                        rows="4"
                        maxLength="500"
                        value={
                            newComment
                        }
                        onChange={
                            (event) =>
                                setNewComment(
                                    event.target.value
                                )
                        }
                        disabled={
                            submitting
                        }
                        placeholder="Share your thoughts..."
                        className="w-full border border-gray-300 rounded px-4 py-3 resize-y"
                    />

                    <div className="flex justify-between items-center mt-2">

                        <span className="text-xs text-gray-500">
                            {
                                newComment.length
                            }/500
                        </span>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !newComment.trim()
                            }
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-5 py-2 rounded"
                        >
                            {
                                submitting
                                    ? 'Posting...'
                                    : 'Comment'
                            }
                        </button>

                    </div>

                </form>
            )}


            {message && (

                <p className="text-red-600 mb-5">
                    {message}
                </p>
            )}


            {loading && (

                <p className="text-gray-500">
                    Loading comments...
                </p>
            )}


            {!loading &&
                parentComments.length ===
                0 && (

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">

                    <p className="text-gray-500">
                        No comments yet. Be the first to join the discussion.
                    </p>

                </div>
            )}


            <div className="space-y-4">

                {parentComments.map(
                    (comment) => (

                        <CommentItem
                            key={
                                comment.id
                            }
                            comment={
                                comment
                            }
                            replies={
                                getReplies(
                                    comment.id
                                )
                            }
                            currentUser={
                                user
                            }
                            submitting={
                                submitting
                            }
                            onReply={
                                handleReply
                            }
                        />
                    )
                )}

            </div>

        </section>
    )
}

export default CommentSection