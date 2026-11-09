import {
    useState
} from 'react'

import type {
    FormEvent
} from 'react'

import type {
    CommentData,
    User
} from '../types'


interface CommentItemProps {
    comment: CommentData

    replies: CommentData[]

    currentUser: User | null

    onReply: (
        parentCommentId: string,
        content: string
    ) => Promise<boolean>

    submitting: boolean
}


function CommentItem({
    comment,
    replies,
    currentUser,
    onReply,
    submitting
}: CommentItemProps) {

    const [
        showReplyForm,
        setShowReplyForm
    ] = useState<boolean>(false)

    const [
        replyText,
        setReplyText
    ] = useState<string>('')


    function formatDate(
        dateValue: string | null
    ): string {

        if (!dateValue) {
            return 'Just now'
        }

        const date =
            new Date(dateValue)

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return 'Just now'
        }

        return date.toLocaleString(
            undefined,
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }
        )
    }


    async function handleReplySubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {

        event.preventDefault()

        const cleanReply =
            replyText.trim()

        if (!cleanReply) {
            return
        }

        const success =
            await onReply(
                comment.id,
                cleanReply
            )

        if (success) {
            setReplyText('')
            setShowReplyForm(false)
        }
    }


    return (

        <div className="border border-gray-200 rounded-lg p-5 bg-white">

            <div className="flex justify-between gap-4 mb-2">

                <div>

                    <span className="font-semibold text-gray-900">
                        {
                            comment.authorName ||
                            'DEV@Deakin User'
                        }
                    </span>

                    {comment.optimistic && (

                        <span className="ml-2 text-xs text-blue-600">
                            Sending...
                        </span>

                    )}

                </div>


                <span className="text-xs text-gray-500">
                    {
                        formatDate(
                            comment.createdAt
                        )
                    }
                </span>

            </div>


            <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
            </p>


            {currentUser &&
                !comment.optimistic && (

                <button
                    type="button"
                    onClick={() =>
                        setShowReplyForm(
                            (previous) =>
                                !previous
                        )
                    }
                    className="mt-3 text-sm text-blue-600 hover:underline"
                >

                    {
                        showReplyForm
                            ? 'Cancel reply'
                            : 'Reply'
                    }

                </button>

            )}


            {showReplyForm && (

                <form
                    onSubmit={
                        handleReplySubmit
                    }
                    className="mt-4"
                >

                    <textarea
                        rows={3}
                        maxLength={500}
                        value={
                            replyText
                        }
                        onChange={
                            (event) =>
                                setReplyText(
                                    event.target.value
                                )
                        }
                        disabled={
                            submitting
                        }
                        placeholder="Write a reply..."
                        className="w-full border border-gray-300 rounded px-3 py-2 resize-y"
                    />


                    <div className="flex justify-end mt-2">

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !replyText.trim()
                            }
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded"
                        >
                            Reply
                        </button>

                    </div>

                </form>

            )}


            {replies.length > 0 && (

                <div className="mt-5 ml-6 space-y-3 border-l-2 border-gray-200 pl-4">

                    {replies.map(
                        (reply) => (

                            <div
                                key={
                                    reply.id
                                }
                                className="bg-gray-50 rounded-lg p-4"
                            >

                                <div className="flex justify-between gap-4 mb-2">

                                    <span className="font-medium text-gray-900">

                                        {
                                            reply.authorName ||
                                            'DEV@Deakin User'
                                        }

                                    </span>


                                    <span className="text-xs text-gray-500">

                                        {
                                            formatDate(
                                                reply.createdAt
                                            )
                                        }

                                    </span>

                                </div>


                                <p className="text-gray-700 whitespace-pre-wrap">

                                    {
                                        reply.content
                                    }

                                </p>


                                {reply.optimistic && (

                                    <span className="text-xs text-blue-600">
                                        Sending...
                                    </span>

                                )}

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    )
}


export default CommentItem