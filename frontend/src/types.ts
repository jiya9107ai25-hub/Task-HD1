export type UserPlan = 'free' | 'paid'

export type UserRole = 'user' | 'admin'

export type PostType = 'question' | 'article'

export type PostStatus = 'active' | 'hidden'


export interface User {
  id: string
  name: string
  email: string
  plan: UserPlan
  role: UserRole
}


export interface Post {
  id: string
  postType: PostType
  title: string
  description?: string
  abstract?: string
  articleText?: string
  tags: string[]
  plan: UserPlan
  status: PostStatus
  userId: string
  authorName: string
  authorEmail?: string
  createdAt: string | null
}


export interface CommentData {
  id: string
  postId: string
  userId: string
  authorName: string
  content: string
  parentCommentId: string | null
  createdAt: string | null
  optimistic?: boolean
}


export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  freePosts: number
  paidPosts: number
  questions: number
  articles: number
  activePosts: number
  hiddenPosts: number
}


export interface DashboardResponse {
  stats: DashboardStats
  posts: Post[]
}
