export type UserRole = 'admin' | 'pastor' | 'leader' | 'member';

// ── Site Config ────────────────────────────────────────────────
export interface HeroButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface HeroConfig {
  mode: 'text' | 'image' | 'slider';
  prefix: string;
  title: string;
  subtitle: string;
  bg_url: string;
  overlay: number;
  buttons: HeroButton[];
  slides: string[];
}

export interface BrandingConfig {
  site_name: string;
  logo_url: string;
  tagline: string;
}

// ── Footer Widget System ───────────────────────────────────────
export type FooterWidgetType =
  | 'logo_info'   // logo + site name + description + address
  | 'contact'     // phone / email / whatsapp
  | 'nav_links'   // configurable link list
  | 'social'      // social media icons + join button
  | 'schedule'    // service schedule items
  | 'custom_html' // free rich text / HTML
  | 'online_cta'; // "También online" mini-cta

export interface FooterWidgetLink {
  label: string;
  href: string;
}

export interface FooterWidget {
  id: string;
  type: FooterWidgetType;
  title: string;       // column heading displayed in footer
  visible: boolean;
  order: number;
  // Per-widget color overrides (empty string = inherit global)
  color_heading: string;
  color_text: string;
  color_accent: string; // hover / accent
  // 'nav_links' & 'online_cta'
  links: FooterWidgetLink[];
  // 'custom_html'
  html: string;
}

export interface FooterScheduleItem {
  day: string;
  time: string;
  label: string;
}

export interface FooterConfig {
  // Description text (used by logo_info widget)
  text: string;
  copyright: string;
  // Global colors (widgets inherit these unless overridden)
  colors: {
    bg: string;
    heading: string;
    body: string;
    link: string;
  };
  // Social links (used by social widget)
  social: { facebook: string; youtube: string; instagram: string };
  // Contact info (used by contact widget)
  contact: { address: string; phone: string; email: string; whatsapp: string };
  // CTA top band
  cta: { enabled: boolean; title: string; subtitle: string };
  // Schedule band
  schedules: { enabled: boolean; items: FooterScheduleItem[] };
  // Widget columns
  widgets: FooterWidget[];
}

export interface SeoConfig {
  title: string;
  description: string;
  og_image: string;
}

// ── Home Blocks ────────────────────────────────────────────────
export type HomeBlockType =
  | 'cards'
  | 'columns'
  | 'cta_banner'
  | 'stats'
  | 'rich_text'
  | 'contact_form'
  | 'testimonials'
  | 'gallery';

export type HomeBlockBg = 'white' | 'light' | 'primary' | 'gradient' | 'custom';

export interface HomeBlockCardItem {
  emoji: string;
  title: string;
  description: string;
}

export interface HomeBlockStatItem {
  value: string;
  label: string;
  emoji: string;
}

export interface HomeBlockColumnItem {
  title: string;
  body: string;
  image_url: string;
  btn_label: string;
  btn_href: string;
}

export interface HomeBlockTestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatar_url: string;
}

export interface HomeBlockGalleryItem {
  image_url: string;
  caption: string;
}

export interface HomeBlock {
  id: string;
  type: HomeBlockType;
  title: string;
  subtitle: string;
  visible: boolean;
  order: number;
  bg: HomeBlockBg;
  // Per-block custom colors (empty = use bg defaults)
  color_bg: string;       // custom background color
  color_heading: string;  // custom heading color
  color_text: string;     // custom body text color
  color_accent: string;   // custom accent color
  // cards
  card_cols: 2 | 3 | 4;
  cards: HomeBlockCardItem[];
  // columns
  col_items: HomeBlockColumnItem[];
  // cta_banner
  cta_btn1_label: string;
  cta_btn1_href: string;
  cta_btn2_label: string;
  cta_btn2_href: string;
  // stats
  stats: HomeBlockStatItem[];
  // rich_text
  html: string;
  text_align: 'left' | 'center';
  // testimonials
  testimonials: HomeBlockTestimonialItem[];
  // gallery
  gallery: HomeBlockGalleryItem[];
}

export interface SiteConfigMap {
  branding: BrandingConfig;
  hero: HeroConfig;
  footer: FooterConfig;
  seo: SeoConfig;
  home_blocks: HomeBlock[];
}

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
  series?: string;
  author_id: string;
  author_name: string;
  published: boolean;
  published_at?: string;
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
  published_at?: string;
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
  published_at?: string;
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

export interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  cover_image?: string;
  content: string;
  published: boolean;
  show_in_nav: boolean;
  nav_order: number;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}
