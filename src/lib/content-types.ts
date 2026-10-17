// Hand-authored shape for the generated content object (src/gen/content.ts).
// Codegen assembles object literals from canonical JSON and Markdown sources.
// Discovered languages share a widened type rather than incompatible literal types.
import type { NavItem } from "./nav-types";
import type { EditorialCopy, UiCopy } from "./ui-copy-types";

interface LinkRef {
  label: string;
  href: string;
}

export interface HomePageCard {
  id: string;
  title: string;
  description: string;
  image: string;
  page_type: string;
  url: string;
  footnote: string;
}

export interface HomeIconCard extends HomePageCard {
  icon: "calendar" | "hand-heart" | "sparkles" | "book-open" | "video";
  tone: "saffron" | "green" | "amber" | "rose" | "plum";
}

export interface FooterShape {
  copyright_text: string;
  address: string;
  policies_label: string;
  policies: LinkRef[];
  social: (LinkRef & { connectId: string })[];
}

export interface HeroIntro {
  title: string;
  cta_label: string;
  cta_href: string;
  images: string[];
}

export interface HomeShape {
  hero: { invocation: string; title: string; subtitle: string; body: string };
  hero_intro: HeroIntro;
  top_carousel: HomePageCard[];
  icon_carousel: HomeIconCard[];
  bottom_carousel: HomePageCard[];
  explore_carousel: HomePageCard[];
  remidies_carousel: HomePageCard[];
  explore_label: string;
  explore_title: string;
  guidance_label: string;
  guidance_title: string;
}

// Shared top-level labels consumed directly from the localized dictionary.
export interface FlatCopyKeys {
  /** Institution name as shown in the footer. */
  site_name: string;
  /** Alt text for the logo, used in every header and the footer. */
  logo_alt: string;
  /** Browser tab title and search-result headline. */
  meta_title: string;
  /** Search-result summary text. */
  meta_description: string;
  /** Search keywords. Held in content so they are placeholder-substituted outside production. */
  meta_keywords: string[];
  nav_home: string;
  nav_sevas: string;
  nav_events: string;
  nav_contact: string;
  header_tagline: string;
  donate: string;
  scan_qr: string;
  offer_seva: string;
  qr_title: string;
  qr_subtitle: string;
  footer_explore: string;
  footer_policies: string;
  footer_tagline: string;
  footer_built: string;
  footer_touch: string;
  sevas_label: string;
  sevas_title: string;
  sevas_subtitle: string;
  sevas_search: string;
  sevas_clear_search: string;
  sevas_showing_template: string;
  sevas_empty_title: string;
  sevas_empty_sub: string;
  sevas_featured_title: string;
  sevas_all_title: string;
  sevas_filter_category: string;
  sevas_filter_deity: string;
  sevas_all_deities: string;
  sevas_amount_min: string;
  sevas_amount_max: string;
  sevas_sort: string;
  sevas_sort_default: string;
  sevas_sort_ascending: string;
  sevas_sort_descending: string;
  sevas_all_categories: string;
  sevas_clear_filters: string;
  sevas_results_template: string;
  sevas_any_amount: string;
  sevas_deity: string;
  sevas_sannidhi: string;
  sevas_location: string;
  sevas_description: string;
  sevas_significance: string;
  sevas_offer: string;
  sevas_view_details: string;
  sevas_close: string;
  sevas_show_more?: string;
  show_more?: string;
  events_label: string;
  events_title: string;
  events_subtitle: string;
  events_upcoming: string;
  events_milestones: string;
  events_placeholder: string;
  vol_label: string;
  vol_title: string;
  vol_subtitle: string;
  vol_why: string;
  vol_roles: string;
  vol_ready: string;
  vol_ready_body: string;
  vol_register: string;
  contact_label: string;
  contact_title: string;
  contact_subtitle: string;
  contact_locations: string;
  contact_map: string;
  contact_enquiry: string;
  contact_enquiry_sub: string;
  contact_email_btn: string;
  contact_call_btn: string;
}

export interface BhaktiPageContent {
  metadata_title: string;
  metadata_description: string;
  eyebrow: string;
  title: string;
  description: string;
  search_label: string;
  search_placeholder: string;
  works: string;
  showing_template: string;
  no_results: string;
  show_all: string;
  show_less: string;
  show_more?: string;
  collapse: string;
  expand: string;
  by: string;
  ankita: string;
  back: string;
  reading: string;
}

export interface LibraryShape {
  bhakti: { page: BhaktiPageContent };
}

export interface LibraryBrowserShape {
  clear_search: string;
  open_article: string;
  related_articles: string;
  back_collection: string;
  unavailable: string;
  loading: string;
  error: string;
  retry: string;
  collection_count: string;
  read_minutes: string;
  estimated_read_minutes: string;
  devotional_context: string;
  detail_labels: Record<string, string>;
  featured_title: string;
  all_items: string;
  search_label: string;
  search_placeholder: string;
  showing_template: string;
  no_results: string;
  show_more: string;
  view_details: string;
  close_article: string;
}

export interface LibrarySectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export type LibrarySectionsShape = Record<string, LibrarySectionCopy>;

export interface SectionHubItem {
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface SectionHubContent {
  eyebrow: string;
  title: string;
  description: string;
  open_label: string;
  items: SectionHubItem[];
}

export interface SectionHubsShape {
  library: SectionHubContent;
  story: SectionHubContent;
}

export interface EventTab {
  id: string;
  label: string;
}

export interface EventListItem {
  cat: string;
  live: boolean;
  tag: string;
  title: string;
  date: string;
  dur: string;
  views: string;
  img: string;
  desc: string;
}

export interface EventsExactShape {
  date_from: string;
  date_to: string;
  month: string;
  clear_filters: string;
  results_template: string;
  load_error: string;
  retry: string;
  event_not_found: string;
  copy_link: string;
  link_copied: string;
  share: string;
  share_error: string;
  add_calendar: string;
  sort_label: string;
  sort_earliest: string;
  sort_latest: string;
  tabs: EventTab[];
  list?: EventListItem[];
  search_placeholder?: string;
  all_categories?: string;
  no_results?: string;
  clear_search?: string;
  view_details?: string;
  hide_details?: string;
  full_page?: string;
  performers?: string;
  location?: string;
  timing?: string;
  gallery?: string;
  no_upcoming_events?: string;
  no_past_events?: string;
  loading_past?: string;
  recurring_badge?: string;
  close_modal?: string;
  show_more?: string;
}

export interface EventsSectionsShape {
  annual_festivals: string;
  classical_concerts: string;
  dance_cultural: string;
  pooja_rituals: string;
}

export interface MediaMetadata {
  id?: string;
  caption?: string;
  fullImage?: string;
  albumId?: string;
  recordedAt?: string;
  language?: string;
}

export interface MediaAlbumItem extends MediaMetadata {
  title: string;
  detail: string;
  image: string;
  type: "photo" | "video";
  duration?: string;
  videoUrl?: string;
  externalUrl?: string;
}

export interface MediaAlbum {
  id: string;
  title: string;
  description: string;
  cover: string;
  tags: string[];
  date?: string;
  event?: string;
  items: MediaAlbumItem[];
}

export interface MediaShape {
  eyebrow: string;
  title: string;
  description: string;
  top_title: string;
  recent_title: string;
  all_title: string;
  search_label: string;
  search_placeholder: string;
  showing_template: string;
  no_results: string;
  show_more: string;
  open_album: string;
  no_media_results: string;
  album_items: string;
  photo_label: string;
  video_label: string;
  photos_label: string;
  videos_label: string;
  date_from: string;
  date_to: string;
  event_filter: string;
  all_events: string;
  type_filter: string;
  all_types: string;
  sort_label: string;
  newest: string;
  oldest: string;
  clear_filters: string;
  date_unknown: string;
  close_viewer: string;
  previous_item: string;
  next_item: string;
  position_template: string;
  back_to_albums: string;
  parent_album: string;
  item_link: string;
  open_photo: string;
  open_video: string;
  playback_unavailable: string;
  media_error: string;
  item_not_found: string;
  album_not_found: string;
  duration_label: string;
  recorded_label: string;
  language_label: string;
  albums: MediaAlbum[];
}

export interface ImageListItem {
  title: string;
  sub: string;
  img: string;
}

export interface LearnItem extends ImageListItem {
  id?: string;
  href?: string;
  description?: string;
  level?: string;
  language?: string;
  format?: string;
  duration?: string;
  enrollmentUrl?: string;
  availability?: string;
}

export interface PageMetadataEntry {
  title: string;
  description?: string;
}

export interface ConnectPageShape {
  title: string;
  intro: string;
  branches_title: string;
  branches_intro: string;
  view_details: string;
  branch_type: string;
  address: string;
  timings: string;
  contact: string;
  phone: string;
  email: string;
  deity: string;
  close: string;
  map_title: string;
  open_google_maps: string;
  directions: string;
  connect_title: string;
  connect_intro: string;
  audience: string;
}

export interface PagesShape {
  local_copy: Record<string, string>;
  learn: {
    eyebrow: string;
    title: string;
    intro: string;
    details: string;
    back: string;
    level: string;
    language: string;
    format: string;
    duration: string;
    unspecified: string;
    availability: string;
    enroll: string;
    paths_title: string;
    empty: string;
    not_found: string;
    suggested_paths: Array<{ title: string; description: string; itemIds: string[] }>;
  };
  parampara: {
    title: string;
    intro: string;
    position: string;
    founder: string;
    see_more: string;
    close: string;
    lineage: string;
    back_to_lineage: string;
    guru_navigation: string;
    previous: string;
    next: string;
    content_views: string;
    summary: string;
    details: string;
    details_placeholder: string;
    timeline: string;
    list: string;
    show_timeline: string;
    show_list: string;
    view: string;
    search: string;
    no_results: string;
    clear_search: string;
    not_found: string;
    references: string;
    related_places: string;
    related_works: string;
  };
  detected: Record<string, string>;
  contact: {
    reach_title: string;
    branches: Array<{ name: string; type: string; address: string; phone: string; email: string; hours: string; mapLink: string }>;
  };
  media_subtitle: string;
  projects: {
    eyebrow: string;
    vision: string;
  };
  terms: { acceptance: string; donations: string; property: string; disclaimer: string };
  volunteer_question: string;
}

// One entry per file found in content/languages/. Produced by the content build
// step, which discovers languages from the filesystem — no locale is named in
// application code, so adding a language means adding a file and nothing else.
export interface LanguageDescriptor {
  code: string;
  /** English name, e.g. "Kannada". */
  name: string;
  /** The language's name in itself, e.g. "ಕನ್ನಡ" — what a reader recognises. */
  native_name: string;
  /** Full switcher label. */
  label: string;
  /** Compact label for the mobile toggle, where space is tight. */
  short_label: string;
  /** True for the language every other language falls back to. */
  is_default: boolean;
}

export interface ContentShape extends FlatCopyKeys {
  ui: UiCopy;
  editorial: EditorialCopy;
  bhakti_controls: {
    composer: string; ankita: string; composition_type: string; all: string;
    reading_size: string; print: string; copy_link: string; copied: string;
    copy_failed: string; load_failed: string; retry: string; loading: string;
    clear_filters: string; type_unavailable: string;
  };
  page_controls: {
    open_filters: string;
    close_filters: string;
    pause_motion: string;
    resume_motion: string;
    close: string;
    unavailable: string;
    call: string;
    email: string;
  };
  public_actions: {
    whatsapp_label: string;
    subscribe_label: string;
    donate_label: string;
    donate_tooltip: string;
    volunteer_label: string;
    payment_label: string;
    whatsapp_channel: string;
    send_email: string;
    donation_note: string;
    donation_email_message: string;
    donation_email_subject: string;
  };
  announcement: {
    label: string;
    dismiss: string;
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    href: string;
  };
  /** Self-description of the language file. Metadata, not display content. */
  _language?: LanguageDescriptor;
  local_preview: {
    label: string;
    real: string;
    placeholder: string;
  };
  nav: NavItem[];
  footer: FooterShape;
  home: HomeShape;
  library: LibraryShape;
  library_browser: LibraryBrowserShape;
  library_sections: LibrarySectionsShape;
  section_hubs: SectionHubsShape;
  connect_page: ConnectPageShape;
  events_exact: EventsExactShape;
  events_sections?: EventsSectionsShape;
  events_recurring?: string;
  events_this_week?: string;
  events_all?: string;
  media: MediaShape;
  learn: LearnItem[];
  volunteer_ops: ImageListItem[];
  page_metadata: Record<string, PageMetadataEntry>;
  pages: PagesShape;
}
