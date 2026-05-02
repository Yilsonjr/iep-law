export type UserRole = 'admin' | 'pastor' | 'leader' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  join_date: string;
  created_at: string;
}

export type SermonCategory = 'Sunday' | 'Wednesday' | 'Special' | 'Youth' | 'Devotional';

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  description: string;
  video_url?: string;
  duration: string;
  category: SermonCategory;
  thumbnail: string;
  notes?: string;
  author_id: string;
  author_name: string;
  published: boolean;
  created_at: string;
}

export type EventType =
  | 'service'
  | 'bible-study'
  | 'youth'
  | 'outreach'
  | 'celebration'
  | 'encounter';

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: EventType;
  author_id: string;
  created_at: string;
}

export interface LiveStreamConfig {
  id?: string;
  is_live: boolean;
  stream_url: string;
  title: string;
  speaker: string;
  description: string;
  viewer_count: number;
  start_time?: string;
  updated_by?: string;
  updated_at?: string;
}

export type PostCategory = 'reflection' | 'testimony' | 'devotional' | 'announcement' | 'prayer';

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  author_id: string;
  author_name: string;
  published: boolean;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface SermonNote {
  id: string;
  sermon_id: string;
  content: string;
  created_at: string;
}