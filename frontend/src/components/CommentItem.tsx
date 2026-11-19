
import { useState } from 'react'
import type { FormEvent } from 'react'

import type {
    CommentData,
    User
} from '../types'

interface CommentItemProps {
    comment: CommentData
    replies?: CommentData[]
    currentUser: User | null

    onReply: (
        parentCommentId: string,
        content: string
    ) => Promise<boolean>

    submitting: boolean
}

/*
 * Format comment timestamps safely.
 */
function formatDate(
    dateValue: string | null | undefined
): string {

    if (!dateValue) {
        return 'Just now'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
        return 'Just now'
    }

    return date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

function CommentItem({
    comment,
    replies = [],
    currentUser,
    onReply,
    submitting
}: CommentItemProps) {

    const [showReplyForm, setShowReplyForm] =
        useState<boolean>(false)

    const [replyText, setReplyText] =
        useState<string>('')

    if (!comment || !comment.id) {
        return null
    }

    const safeReplies = Array.isArray(replies)
        ? replies.filter(
            reply => Boolean(reply && reply.id)
        )
        : []

    async function handleReplySubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {

        event.preventDefault()

        const cleanReply = replyText.trim()

        if (!cleanReply || submitting) {
            return
        }

        const success = await onReply(
            comment.id,
            cleanReply
        )

        if (success) {
            setReplyText('')
            setShowReplyForm(false)
        }
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">

            {/* Comment Header */}
            <div className="mb-2 flex justify-between gap-4">

                <div>
                    <span className="font-semibold text-gray-900">
                        {comment.authorName || 'DEV@Deakin User'}
                    </span>

                    {comment.optimistic && (
                        <span className="ml-2 text-xs text-blue-600">
                            Sending...
                        </span>
                    )}
                </div>

                <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                </span>

            </div>

            {/* Comment Content */}
            <p className="whitespace-pre-wrap break-words text-gray-700">
                {comment.content || ''}
            </p>

            {/* Reply Button */}
            {currentUser && !comment.optimistic && (
                <button
                    type="button"
                    onClick={() =>
                        setShowReplyForm(previous => !previous)
                    }
                    className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                >
                    {showReplyForm ? 'Cancel reply' : 'Reply'}
                </button>
            )}

            {/* Reply Form */}
            {showReplyForm && (
                <form
                    onSubmit={handleReplySubmit}
                    className="mt-4"
                >

                    <textarea
                        rows={3}
                        maxLength={500}
                        value={replyText}
                        onChange={event =>
                            setReplyText(event.target.value)
                        }
                        disabled={submitting}
                        placeholder="Write a reply..."
                        className="w-full resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />

                    <div className="mt-2 flex justify-end">

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !replyText.trim()
                            }
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {submitting ? 'Sending...' : 'Reply'}
                        </button>

                    </div>

                </form>
            )}

            {/* Nested Replies */}
            {safeReplies.length > 0 && (
                <div className="mt-5 ml-6 space-y-3 border-l-2 border-gray-200 pl-4">

                    {safeReplies.map(reply => (
                        <div
                            key={reply.id}
                            className="rounded-lg bg-gray-50 p-4"
                        >

                            <div className="mb-2 flex justify-between gap-4">

                                <span className="font-medium text-gray-900">
                                    {reply.authorName || 'DEV@Deakin User'}
                                </span>

                                <span className="text-xs text-gray-500">
                                    {formatDate(reply.createdAt)}
                                </span>

                            </div>

                            <p className="whitespace-pre-wrap break-words text-gray-700">
                                {reply.content || ''}
                            </p>

                            {reply.optimistic && (
                                <span className="text-xs text-blue-600">
                                    Sending...
                                </span>
                            )}

                        </div>
                    ))}

                </div>
            )}

        </div>
    )
}

export default CommentItem
