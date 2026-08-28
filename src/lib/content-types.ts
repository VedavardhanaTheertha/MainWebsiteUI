// Hand-authored shape for the generated content object (src/gen/content.ts).
// The codegen script emits plain JS object literals from YAML — this interface
// gives both locales one common, widened type (rather than each locale inferring
// its own literal-string type from `as const`, which made content.en and
// content.kn structurally incompatible with each other).
import type { NavItem } from "./nav-types";
import type { Schedulable } from "./scheduler";

interface LinkRef {
  label: string;
  href: string;
}

export type Carousel1Popup =
  | { kind: "body"; heading: string; body: string; link: LinkRef }
  | { kind: "seva-list"; heading: string; seva_list: { name: string; desc: string }[]; link: LinkRef };

export interface Carousel1Item extends Schedulable {
  id: string;
  tag: string;
  title: string;
  summary: string;
  bg: string;
  img_position: string;
  launch_date: string | null;
  end_date: string | null;
  pinned_date: string | null;
  popup: Carousel1Popup;
}

export type Carousel2Popup =
  | { kind: "body"; heading: string; body: string; link: LinkRef }
  | { kind: "events"; heading: string; events: { date: string; name: string }[]; link: LinkRef }
  | { kind: "projects"; heading: string; projects: { status: string; name: string }[]; link: LinkRef }
  | { kind: "stats"; heading: string; stats: { value: string; label: string }[]; link: LinkRef }
  | { kind: "volunteer"; heading: string; body: string; link: LinkRef };

export interface Carousel2Item extends Schedulable {
  id: string;
  tag: string;
  title: string;
  teaser: string;
  img: string;
  launch_date: string | null;
  end_date: string | null;
  pinned_date: string | null;
  popup: Carousel2Popup;
}

export interface ExploreLink {
  title: string;
  desc: string;
  href: string;
  cta: string;
}

export interface GuidanceCard {
  symbol: string;
  heading: string;
  sub: string;
  href: string;
}

export interface FooterShape {
  copyright_text: string;
  address: string;
  policies_label: string;
  policies: LinkRef[];
  social: LinkRef[];
}

export interface HeroIntro {
  title: string;
  cta_label: string;
  cta_href: string;
  images: string[];
}

export interface SpotlightItem {
  tag: string;
  title: string;
  sub: string;
  img: string;
  href: string;
}

export interface TileItem {
  icon: string;
  label: string;
  href: string;
  tone: string;
}

export interface FeatureItem {
  img: string;
  title: string;
  cta_label: string;
  cta_href: string;
}

export interface HomeShape {
  hero: { invocation: string; title: string; subtitle: string; body: string };
  hero_intro: HeroIntro;
  spotlight: SpotlightItem[];
  tiles: TileItem[];
  features: FeatureItem[];
  carousel1: { items: Carousel1Item[] };
  carousel2: { items: Carousel2Item[] };
  explore_links: ExploreLink[];
  guidance_cards: GuidanceCard[];
  explore_label: string;
  explore_title: string;
  guidance_label: string;
  guidance_title: string;
}

// Legacy flat keys mechanically migrated from src/lib/translations.ts — every
// value is a plain string, accessed directly as e.g. tr.about_heritage.
export interface LegacyFlatKeys {
  /** Institution name as shown in the footer. */
  site_name: string;
  /** Alt text for the logo, used in every header and the footer. */
  logo_alt: string;
  blog_eyebrow: string;
  blog_title: string;
  blog_back: string;
  /** Browser tab title and search-result headline. */
  meta_title: string;
  /** Search-result summary text. */
  meta_description: string;
  /** Search keywords. Held in content so they are placeholder-substituted outside production. */
  meta_keywords: string[];
  nav_home: string;
  nav_about: string;
  nav_sevas: string;
  nav_events: string;
  nav_blog: string;
  nav_contact: string;
  header_tagline: string;
  donate: string;
  scan_qr: string;
  offer_seva: string;
  qr_title: string;
  qr_subtitle: string;
  qr_upi_label: string;
  hero_invocation: string;
  hero_title: string;
  hero_subtitle: string;
  hero_body: string;
  qa_volunteer: string;
  qa_kotilekhana: string;
  qa_events: string;
  qa_volunteer_sub: string;
  qa_kotilekhana_sub: string;
  qa_events_sub: string;
  swamiji_label: string;
  swamiji_lineage: string;
  swamiji_paryaya: string;
  timings_label: string;
  timings_darshan: string;
  seva_label: string;
  seva_title: string;
  seva_body: string;
  seva_view_all: string;
  seva_from: string;
  seva_offer: string;
  seva_special: string;
  volunteer_label: string;
  volunteer_title: string;
  volunteer_body: string;
  volunteer_cta: string;
  volunteer_needed: string;
  sig_label: string;
  sig_title: string;
  mile_label: string;
  mile_title: string;
  mile_upcoming: string;
  mile_view_all: string;
  mile_learn: string;
  footer_explore: string;
  footer_policies: string;
  footer_tagline: string;
  footer_built: string;
  footer_touch: string;
  about_heritage: string;
  about_title: string;
  about_subtitle: string;
  about_founding: string;
  about_pontiff: string;
  about_parampara: string;
  about_parampara_sub: string;
  about_placeholder: string;
  sevas_label: string;
  sevas_title: string;
  sevas_subtitle: string;
  sevas_search: string;
  sevas_showing_template: string;
  sevas_empty_title: string;
  sevas_empty_sub: string;
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

export interface LibraryCategoryItem {
  name: string;
  sub: string;
}

export interface LibraryCategory {
  title: string;
  kn: string;
  img: string;
  desc: string;
  items: LibraryCategoryItem[];
}

export interface BhaktiPageContent {
  metadata_title: string;
  metadata_description: string;
  eyebrow: string;
  title: string;
  description: string;
  search_label: string;
  search_placeholder: string;
  collection: string;
  works: string;
  showing_template: string;
  no_results: string;
  show_all: string;
  show_less: string;
  collapse: string;
  expand: string;
  by: string;
  ankita: string;
  back: string;
  reading: string;
}

export interface BhaktiCategory extends LibraryCategory {
  page: BhaktiPageContent;
}

export interface LibraryShape {
  mantra: LibraryCategory;
  shastra: LibraryCategory;
  bhakti: BhaktiCategory;
  jnana: LibraryCategory;
  dharma: LibraryCategory;
  eyebrow: string;
  page_title: string;
}

export interface Connect2Shape {
  address: string;
  phone: string;
  email: string;
  hours: string;
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
  tabs: EventTab[];
  list: EventListItem[];
}

export interface MediaPhoto {
  title: string;
  detail: string;
  img: string;
}

export interface MediaVideo {
  title: string;
  detail: string;
  dur: string;
  img: string;
}

export interface MediaShape {
  gallery: string[];
  photos: MediaPhoto[];
  videos: MediaVideo[];
}

export interface ImageListItem {
  title: string;
  sub: string;
  img: string;
}

export interface DonationMaterial {
  name: string;
  sub: string;
  unit: string;
  icon: string;
}

export interface DonationShape {
  amounts: string[];
  upi: string;
  materials: DonationMaterial[];
}

export interface StoryItem {
  name: string;
  sub: string;
}

export interface StoryEntry {
  title: string;
  img: string;
  intro: string;
  items: StoryItem[];
}

export interface StoriesShape {
  parampara: StoryEntry;
  articles: StoryEntry;
  science: StoryEntry;
  pilgrim: StoryEntry;
}

export interface PageMetadataEntry {
  title: string;
  description?: string;
}

export interface EventPageItem {
  date: string;
  displayDate: string;
  category: string;
  title: string;
  location: string;
  time: string;
  description: string;
  thisWeek: boolean;
}

export interface PagesShape {
  detected: Record<string, string>;
  about: {
    title: string;
    subtitle: string;
    founder_alt: string;
    founder_caption: string;
    founding_paragraphs: string[];
    pontiff_alt: string;
    pontiff_name: string;
    pontiff_line: string;
    pontiff_paragraphs: string[];
    parampara_intro: string;
    parampara_note: string;
    parampara: string[];
  };
  contact: {
    reach_title: string;
    branches: Array<{ name: string; type: string; address: string; phone: string; email: string; hours: string; mapLink: string }>;
  };
  events: { items: EventPageItem[] };
  media_subtitle: string;
  projects: {
    eyebrow: string;
    completed: Array<{ name: string; year: string; desc: string }>;
    ongoing: Array<{ name: string; desc: string; progress: number }>;
    upcoming: Array<{ name: string; desc: string }>;
    vision: string;
  };
  terms: { acceptance: string; donations: string; property: string; disclaimer: string };
  v2: Record<string, string>;
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

// One entry per folder found in content/blog/. `articles` is keyed by language
// code and always has an entry for every discovered language: a post without a
// translation resolves to the default language rather than disappearing.
export interface BlogArticle {
  title: string;
  /** Body pre-rendered to HTML at build time. */
  html: string;
}

export interface BlogPost {
  slug: string;
  date: string;
  hero: string | null;
  tags: string[];
  articles: Record<string, BlogArticle>;
}

export interface ContentShape extends LegacyFlatKeys {
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
  connect2: Connect2Shape;
  events_exact: EventsExactShape;
  media: MediaShape;
  learn: ImageListItem[];
  volunteer_ops: ImageListItem[];
  donation: DonationShape;
  page_metadata: Record<string, PageMetadataEntry>;
  pages: PagesShape;
  stories: StoriesShape;
}
