
import {
    useCallback,
    useEffect,
    useState
} from 'react'

import type {
    FormEvent
} from 'react'

import type {
    CommentData
} from '../types'

import {
    useAuth
} from '../context/AuthContext'

import CommentItem from './CommentItem'


const API_URL: string = (
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
).replace(/\/+$/, '')


type CommentWithParent = CommentData & {
    parentCommentId?: string | null
}


interface CommentSectionProps {
    postId: string
}


/*
 * Normalize backend comment data.
 */
function normalizeComment(
    raw: unknown
): CommentWithParent | null {

    if (!raw || typeof raw !== 'object') {
        return null
    }

    const item = raw as Record<string, any>

    const id = item.id ?? item._id

    if (!id) {
        return null
    }

    let createdAt: string | null = null

    const created = item.createdAt

    if (typeof created === 'string') {

        createdAt = created

    } else if (created && typeof created === 'object') {

        const seconds =
            created._seconds ?? created.seconds

        if (typeof seconds === 'number') {

            createdAt = new Date(
                seconds * 1000
            ).toISOString()

        }
    }

    return {
        ...item,

        id: String(id),

        content: String(item.content ?? ''),

        authorName:
            item.authorName ??
            item.author?.name ??
            item.userName ??
            'DEV@Deakin User',

        createdAt,

        parentCommentId:
            item.parentCommentId ??
            item.parentId ??
            null,

        optimistic: false

    } as CommentWithParent
}


function CommentSection({
    postId
}: CommentSectionProps) {

    const {
        user: currentUser,
        token
    } = useAuth()


    // Component state.
    const [comments, setComments] =
        useState<CommentWithParent[]>([])

    const [loading, setLoading] =
        useState<boolean>(true)

    const [submitting, setSubmitting] =
        useState<boolean>(false)

    const [error, setError] =
        useState<string>('')

    const [newComment, setNewComment] =
        useState<string>('')


    /*
     * Authentication headers.
     */
    const getAuthHeaders = useCallback((): Record<string, string> => {

        return {
            'Content-Type': 'application/json',

            ...(token
                ? {
                    Authorization: `Bearer ${token}`
                }
                : {})
        }

    }, [token])


    /*
     * Fetch existing comments and replies.
     */
    const fetchComments = useCallback(async (): Promise<void> => {

        try {

            const response = await fetch(
                `${API_URL}/posts/${postId}/comments`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            )

            if (!response.ok) {

                throw new Error(
                    `Unable to load comments (${response.status}).`
                )

            }

            const data = await response.json()

            const list: unknown[] =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.comments)
                        ? data.comments
                        : []

            const cleaned = list
                .map(normalizeComment)
                .filter(
                    (item): item is CommentWithParent =>
                        item !== null
                )

            setComments(cleaned)
            setError('')

        } catch (err) {

            console.error(
                'Fetch comments error:',
                err
            )

            setError(
                'Unable to load comments. Please refresh the page.'
            )

        } finally {

            setLoading(false)

        }

    }, [postId, getAuthHeaders])


    /*
     * Load comments when post changes.
     */
    useEffect(() => {

        setLoading(true)
        setComments([])

        fetchComments()

    }, [fetchComments])


    /*
     * Add a normal comment or a reply.
     *
     * Normal comment:
     * POST /posts/:postId/comments
     *
     * Reply:
     * POST /comments/:commentId/replies
     */
    async function addComment(
        content: string,
        parentCommentId: string | null
    ): Promise<boolean> {

        if (!currentUser || !token) {

            setError(
                'Please log in to participate in the discussion.'
            )

            return false
        }

        const cleanContent = content.trim()

        if (!cleanContent || cleanContent.length > 500) {

            setError(
                'Comments must contain between 1 and 500 characters.'
            )

            return false
        }


        const tempId = `temp-${Date.now()}`


        // Optimistically display the comment.
        const optimisticComment = {

            id: tempId,

            content: cleanContent,

            authorName:
                (currentUser as any).name ||
                (currentUser as any).firstName ||
                currentUser.email ||
                'You',

            createdAt: new Date().toISOString(),

            parentCommentId,

            optimistic: true

        } as unknown as CommentWithParent


        setComments(previous => [
            ...previous,
            optimisticComment
        ])

        setSubmitting(true)
        setError('')


        try {

            // Choose the correct backend endpoint.
            const isReply = Boolean(parentCommentId)

            const endpoint = isReply
                ? `${API_URL}/comments/${parentCommentId}/replies`
                : `${API_URL}/posts/${postId}/comments`


            const response = await fetch(
                endpoint,
                {
                    method: 'POST',

                    headers: getAuthHeaders(),

                    body: JSON.stringify({
                        content: cleanContent
                    })
                }
            )


            const data = await response.json().catch(() => ({}))


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `Unable to submit comment (${response.status}).`
                )

            }


            // Reload saved backend data.
            await fetchComments()

            return true

        } catch (err) {

            console.error(
                'Comment submission error:',
                err
            )


            // Remove temporary comment if submission fails.
            setComments(previous =>
                previous.filter(
                    item => item.id !== tempId
                )
            )


            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not post your comment. Please try again.'
            )

            return false

        } finally {

            setSubmitting(false)

        }
    }


    /*
     * Handle replies to any main comment.
     */
    async function handleReply(
        parentCommentId: string,
        content: string
    ): Promise<boolean> {

        return addComment(
            content,
            parentCommentId
        )

    }


    /*
     * Handle new top-level comments.
     */
    async function handleNewCommentSubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {

        event.preventDefault()

        const clean = newComment.trim()

        if (!clean || submitting) {
            return
        }

        const success = await addComment(
            clean,
            null
        )

        if (success) {
            setNewComment('')
        }

    }


    /*
     * Separate main comments and replies.
     */
    const topLevelComments = comments.filter(
        item => !item.parentCommentId
    )


    /*
     * Get replies belonging to a main comment.
     */
    function getReplies(
        parentId: string
    ): CommentWithParent[] {

        return comments.filter(
            item => item.parentCommentId === parentId
        )

    }


    return (

        <div className="mt-8">

            {/* Heading */}
            <h2 className="mb-4 text-xl font-semibold">
                Comments ({comments.length})
            </h2>


            {/* Main Comment Form */}
            {currentUser && token ? (

                <form
                    onSubmit={handleNewCommentSubmit}
                    className="mb-6"
                >

                    <textarea
                        rows={3}
                        maxLength={500}
                        value={newComment}

                        onChange={event =>
                            setNewComment(event.target.value)
                        }

                        disabled={submitting}

                        placeholder="Write a comment..."

                        className="w-full resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />


                    <div className="mt-2 flex items-center justify-between">

                        <span className="text-xs text-gray-500">
                            {newComment.length}/500 characters
                        </span>

                        <button
                            type="submit"

                            disabled={
                                submitting ||
                                !newComment.trim()
                            }

                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >

                            {submitting
                                ? 'Posting...'
                                : 'Post comment'
                            }

                        </button>

                    </div>

                </form>

            ) : (

                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">

                    <p className="text-sm text-gray-600">
                        Log in to join the discussion.
                    </p>

                </div>

            )}


            {/* Error Message */}
            {error && (

                <div
                    role="alert"
                    className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    {error}
                </div>

            )}


            {/* Loading */}
            {loading ? (

                <p className="text-gray-500">
                    Loading comments...
                </p>

            ) : topLevelComments.length === 0 ? (

                <p className="text-gray-500">
                    No comments yet. Be the first!
                </p>

            ) : (

                <div className="space-y-4">

                    {topLevelComments.map(comment => (

                        <CommentItem
                            key={comment.id}

                            comment={comment}

                            replies={getReplies(comment.id)}

                            currentUser={currentUser}

                            onReply={handleReply}

                            submitting={submitting}
                        />

                    ))}

                </div>

            )}

        </div>

    )
}


export default CommentSection
