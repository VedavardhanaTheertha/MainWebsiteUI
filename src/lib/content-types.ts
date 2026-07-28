export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export interface BottomBarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
}

/** Date-scheduled carousel item, per SRS section 2.1/2.2 selection rules. */
export interface CarouselItem {
  id: string;
  tag: string;
  title: string;
  summary: string;
  href: string;
  bg: string;
  /** Explicit date this item should show — highest priority. */
  pinned_date: string | null;
  /** Active window; both null means the item is evergreen (always eligible). */
  launch_date: string | null;
  end_date: string | null;
}

export interface QuickNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface PromoCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  image: string;
}

export interface AnswerTile {
  id: string;
  glyph: string;
  question: string;
  subtitle: string;
  href: string;
}

export interface SecondaryLink {
  id: string;
  label: string;
  href: string;
}

export interface GuruparamparaEntry {
  order: number;
  name: string;
  title: string;
  description: string;
  portrait: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  description: string;
}

export interface SevaItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  featured: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface LibraryCategory {
  key: string;
  title: string;
  kn_label: string;
  image: string;
  description: string;
  items: LibraryItem[];
}

export interface PhotoItem {
  id: string;
  caption: string;
  image: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  status: "ongoing" | "completed" | "upcoming";
  description: string;
  image: string;
}

export interface SolutionCategory {
  id: string;
  glyph: string;
  title: string;
  description: string;
}

export interface ChantItem {
  id: string;
  title: string;
  duration: string;
}

export interface ContactRow {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface StoryItem {
  id: string;
  name: string;
  story: string;
  image: string;
}

export interface LearnItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  body: string;
}

export interface HistoryPage {
  key: string;
  title: string;
  image: string;
  intro: string;
  entries: HistoryEntry[];
}

export interface ContentShape {
  meta: {
    siteName: string;
    tagline: string;
    blessing: string;
  };
  nav: {
    items: NavItem[];
  };
  bottomBar: {
    items: BottomBarItem[];
  };
  footer: {
    blessing: string;
    address: string;
    copyright: string;
    social: SocialLink[];
  };
  home: {
    hero: {
      heading: string;
      subheading: string;
      ctaLabel: string;
      ctaHref: string;
      image: string;
    };
    carousel1: {
      items: CarouselItem[];
    };
    quickNav: {
      items: QuickNavItem[];
    };
    promoCards: PromoCard[];
    seekingAnswers: {
      heading: string;
      tiles: AnswerTile[];
    };
    secondaryLinks: SecondaryLink[];
  };
  about: {
    mission: {
      heading: string;
      body: string;
    };
    chiefSwamiji: {
      heading: string;
      name: string;
      title: string;
      description: string;
      portrait: string;
    };
    paryayaSignificance: {
      heading: string;
      body: string;
    };
    udupi: {
      heading: string;
      body: string;
    };
    guruparampara: {
      heading: string;
      intro: string;
      entries: GuruparamparaEntry[];
    };
  };
  events: {
    heading: string;
    intro: string;
    categories: string[];
    list: EventItem[];
  };
  mantraYajna: {
    heading: string;
    subheading: string;
    body: string;
    ctaLabel: string;
    image: string;
  };
  seva: {
    heading: string;
    intro: string;
    categories: string[];
    items: SevaItem[];
  };
  sevaVolunteer: {
    heading: string;
    intro: string;
    steps: string[];
    ctaLabel: string;
  };
  sevaDonations: {
    heading: string;
    intro: string;
    upiId: string;
    presetAmounts: number[];
  };
  panchanga: {
    heading: string;
    intro: string;
    valid_for_date: string;
    tithi: string;
    nakshatra: string;
    sunrise: string;
    sunset: string;
    notes: string;
  };
  library: {
    heading: string;
    intro: string;
    categories: LibraryCategory[];
  };
  media: {
    heading: string;
    intro: string;
    photos: PhotoItem[];
    videos: VideoItem[];
  };
  projects: {
    heading: string;
    intro: string;
    list: ProjectItem[];
  };
  solutions: {
    heading: string;
    intro: string;
    categories: SolutionCategory[];
  };
  chantingPlayer: {
    heading: string;
    intro: string;
    items: ChantItem[];
  };
  directions: {
    heading: string;
    intro: string;
    rows: ContactRow[];
  };
  feedback: {
    heading: string;
    intro: string;
    fields: { label: string; type: string }[];
    submitLabel: string;
  };
  userStories: {
    heading: string;
    intro: string;
    stories: StoryItem[];
    submitCtaLabel: string;
    submitCtaHref: string;
  };
  learn: {
    heading: string;
    intro: string;
    items: LearnItem[];
  };
  connect: {
    heading: string;
    intro: string;
    rows: ContactRow[];
  };
  history: {
    pages: HistoryPage[];
  };
}

export type Locale = "en" | "kn";
