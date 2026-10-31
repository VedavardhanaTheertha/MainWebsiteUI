export type UiValue = boolean | number | string;
export type UiElements = Record<string, Record<string, UiValue>>;

export type UiFieldDefinition = { group: string; key: string } & (
  | { kind: "boolean" }
  | { kind: "number"; minimum: number; maximum: number; integer: boolean; exclusiveMinimum?: boolean }
  | { kind: "choice"; options: readonly string[] }
);

export interface UiSettings {
  collectionPagination: { initialVisible: number; loadIncrement: number };
  railAutoScroll: { enabled: boolean; pixelsPerSecond: number; returnDurationMs: number; resumeDelayMs: number };
  heroSettings: { autoplay: boolean; intervalMs: number; fadeDurationMs: number };
  upcomingEventSettings: { lookAheadDays: number; maxCards: number };
  readingTimeSettings: { wordsPerMinute: number };
  bhaktiReaderSettings: { initialSize: number; minSize: number; maxSize: number; step: number };
  mediaViewerSettings: { swipeThresholdPx: number; videoControlExclusionPx: number; wrap: boolean };
  browserDefaults: {
    advancedFiltersOpen: boolean;
    lineageView: "list" | "timeline";
    eventsUpcomingSort: "earliest" | "latest";
    eventsPastSort: "earliest" | "latest";
    albumsSort: "newest" | "oldest";
  };
  interactionSettings: { dropdownCloseDelayMs: number; modalResetDelayMs: number; searchPreloadDelayMs: number };
  presentationSettings: { imageTreatment: boolean; imageBackedTiles: boolean; tileOverlayOpacity: number; tileCornerRadius: number };
  layoutSettings: {
    featuredTiles: boolean;
    sectionHeaders: boolean;
    layoutProfiles: boolean;
    compactCollections: boolean;
    tileInformation: boolean;
    carouselNavigation: boolean;
  };
}
