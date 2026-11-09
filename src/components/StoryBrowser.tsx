"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import { UserRound, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode, defaultLang } from "@/gen/content";
import {
  mathas as defaultMathas,
  deities as defaultDeities,
  alternateMathas,
  alternateDeities,
} from "@/gen/story/data";
import { useDialog } from "@/hooks/useDialog";
import ParamparaBrowser from "@/components/ParamparaBrowser";

export type StoryTabKey = "mathas" | "parampara" | "deities";

export default function StoryBrowser({ initialTab = "mathas" }: { initialTab?: StoryTabKey } = {}) {
  const { lang, tr, contentMode } = useLang();
  const storyCopy = tr.pages.story;

  const [activeTab, setActiveTab] = useState<StoryTabKey>(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam === "mathas" || tabParam === "parampara" || tabParam === "deities") {
        return tabParam;
      }
    }
    return initialTab;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mathasTabRef = useRef<HTMLButtonElement>(null);
  const paramparaTabRef = useRef<HTMLButtonElement>(null);
  const deitiesTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const activeRef =
      activeTab === "parampara"
        ? paramparaTabRef.current
        : activeTab === "deities"
        ? deitiesTabRef.current
        : mathasTabRef.current;
    if (activeRef) {
      activeRef.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const mathas = contentMode !== defaultContentMode && alternateMathas ? alternateMathas : defaultMathas;
  const deities = contentMode !== defaultContentMode && alternateDeities ? alternateDeities : defaultDeities;

  const visibleItems = useMemo(() => {
    const currentList = activeTab === "mathas" ? mathas : activeTab === "deities" ? deities : [];
    return currentList.map((item) => ({
      ...item,
      displayTitle: item.title[lang] ?? item.title[defaultLang] ?? "",
      displaySubtitle: item.subtitle ? (item.subtitle[lang] ?? item.subtitle[defaultLang] ?? "") : "",
      displaySummary: item.summary[lang] ?? item.summary[defaultLang] ?? "",
      displayEra: item.era ? (item.era[lang] ?? item.era[defaultLang] ?? "") : "",
      displayDeity: item.deity ? (item.deity[lang] ?? item.deity[defaultLang] ?? "") : "",
      displayEstablishedBy: item.establishedBy ? (item.establishedBy[lang] ?? item.establishedBy[defaultLang] ?? "") : "",
      displayAttributes: item.attributes ? (item.attributes[lang] ?? item.attributes[defaultLang] ?? "") : "",
      displaySanctum: item.sanctum ? (item.sanctum[lang] ?? item.sanctum[defaultLang] ?? "") : "",
      detailsHtmlContent: item.detailsHtml[lang] ?? item.detailsHtml[defaultLang] ?? "",
    }));
  }, [activeTab, deities, lang, mathas]);

  const selected = useMemo(() => {
    return visibleItems.find((item) => item.id === selectedId) ?? null;
  }, [visibleItems, selectedId]);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedId]);

  // Sync tab with URL search parameter on browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam === "mathas" || tabParam === "parampara" || tabParam === "deities") {
        setActiveTab(tabParam);
      } else {
        setActiveTab(initialTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialTab]);

  const switchTab = (tab: StoryTabKey) => {
    setActiveTab(tab);
    setSelectedId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = "/story";
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  const closeDetails = () => {
    setSelectedId(null);
  };

  const dialogRef = useDialog(Boolean(selected), closeDetails);

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-3.5 pb-5 sm:pt-4 lg:px-8 lg:py-8">
        <header className="mx-auto max-w-3xl mb-6 px-16 text-center sm:px-20 lg:px-8">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-3">
            {storyCopy.title}
          </h1>
          <p className="mx-auto max-w-2xl font-body text-[14px] lg:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            {storyCopy.intro}
          </p>
        </header>

        {/* 3 Tabs Navigation */}
        <div className="mb-6 border-b border-[var(--color-line-strong)]">
          <nav role="tablist" className="-mb-px flex justify-center space-x-2 sm:space-x-8 overflow-x-auto" aria-label={storyCopy.title}>
            <button
              ref={mathasTabRef}
              role="tab"
              id="story-tab-mathas"
              aria-controls="story-panel-mathas"
              aria-selected={activeTab === "mathas"}
              type="button"
              onClick={() => switchTab("mathas")}
              aria-current={activeTab === "mathas" ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-3 px-3 sm:px-4 font-body text-sm font-semibold transition-colors ${
                activeTab === "mathas"
                  ? "border-[var(--color-saffron-600)] text-[var(--color-text-brand)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-line)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {storyCopy.tabs.mathas}
            </button>
            <button
              ref={paramparaTabRef}
              role="tab"
              id="story-tab-parampara"
              aria-controls="story-panel-parampara"
              aria-selected={activeTab === "parampara"}
              type="button"
              onClick={() => switchTab("parampara")}
              aria-current={activeTab === "parampara" ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-3 px-3 sm:px-4 font-body text-sm font-semibold transition-colors ${
                activeTab === "parampara"
                  ? "border-[var(--color-saffron-600)] text-[var(--color-text-brand)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-line)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {storyCopy.tabs.parampara}
            </button>
            <button
              ref={deitiesTabRef}
              role="tab"
              id="story-tab-deities"
              aria-controls="story-panel-deities"
              aria-selected={activeTab === "deities"}
              type="button"
              onClick={() => switchTab("deities")}
              aria-current={activeTab === "deities" ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-3 px-3 sm:px-4 font-body text-sm font-semibold transition-colors ${
                activeTab === "deities"
                  ? "border-[var(--color-saffron-600)] text-[var(--color-text-brand)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-line)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {storyCopy.tabs.deities}
            </button>
          </nav>
        </div>

        {/* Tab 2: Embedded Parampara Browser */}
        {activeTab === "parampara" && (
          <div role="tabpanel" id="story-panel-parampara" aria-labelledby="story-tab-parampara" className="story-tab-parampara">
            <ParamparaBrowser showSearch={false} showViewSwitch={false} initialView="timeline" embedded={true} />
          </div>
        )}

        {/* Tab 1 & Tab 3: List / Article View */}
        {(activeTab === "mathas" || activeTab === "deities") && (
          <div
            role="tabpanel"
            id={`story-panel-${activeTab}`}
            aria-labelledby={`story-tab-${activeTab}`}
            className="rounded-2xl border border-[var(--color-line-strong)] bg-[var(--color-cream-soft)]/92 p-4 shadow-sm backdrop-blur-md sm:p-6 lg:p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selected?.id === item.id}
                  className="visual-tile group flex flex-col sm:flex-row overflow-hidden text-left bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[16px] shadow-sm hover:-translate-y-0.5 hover:border-[var(--color-saffron-400)] hover:shadow-md aria-pressed:border-[var(--color-saffron-600)] aria-pressed:bg-[var(--color-saffron-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)] transition-all duration-300"
                >
                  <span className="visual-tile-art relative block h-48 sm:h-full sm:min-h-48 w-full sm:w-44 shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-gold-100),var(--color-cream-soft))] [&_.content-image-foreground]:transition-transform [&_.content-image-foreground]:duration-500 [&_.content-image-foreground]:ease-out group-hover:[&_.content-image-foreground]:scale-105">
                    {item.image ? (
                      <ContentImage
                        src={item.image}
                        alt={item.displayTitle}
                        fill
                        sizes="(max-width: 640px) 100vw, 176px"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-[var(--color-saffron-400)]">
                        <UserRound size={34} strokeWidth={1.4} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="visual-tile-body flex min-w-0 flex-col p-4 flex-1">
                    {item.displaySubtitle && (
                      <span className="font-body text-badge font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)] mb-1">
                        {item.displaySubtitle}
                      </span>
                    )}
                    <span className="font-display text-[18px] lg:text-[20px] font-bold leading-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-text-brand)] transition-colors">
                      {item.displayTitle}
                    </span>
                    {item.displayEra && (
                      <span className="font-body text-meta text-[var(--color-text-muted)] mt-1">
                        {item.displayEra}
                      </span>
                    )}
                    {item.displayAttributes && (
                      <span className="font-body text-meta text-[var(--color-text-muted)] mt-1">
                        {item.displayAttributes}
                      </span>
                    )}
                    <span className="mt-3 font-body text-caption leading-[1.55] text-[var(--color-text-secondary)] line-clamp-3">
                      {item.displaySummary}
                    </span>
                    <span className="mt-auto pt-3 text-xs font-semibold text-[var(--color-text-brand)] group-hover:underline">
                      {storyCopy.view_details} →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-dialog-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
        >
          <div
            ref={dialogRef}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-[var(--color-paper)] shadow-2xl sm:max-h-[88vh] sm:rounded-2xl border border-[var(--color-line-strong)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
              <span className="font-body text-badge font-bold uppercase tracking-[0.16em] text-[var(--color-text-brand)]">
                {selected.displaySubtitle || storyCopy.details}
              </span>
              <button
                type="button"
                onClick={closeDetails}
                aria-label={storyCopy.close}
                className="grid size-10 place-items-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-cream-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div ref={modalBodyRef} className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                {selected.image && (
                  <div className="relative aspect-[4/3] w-full sm:w-56 overflow-hidden rounded-xl bg-[var(--color-saffron-50)] shrink-0">
                    <ContentImage
                      src={selected.image}
                      alt={selected.displayTitle}
                      fill
                      sizes="(max-width: 640px) 100vw, 224px"
                    />
                  </div>
                )}
                <div>
                  <h2 id="story-dialog-title" className="font-display text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)]">
                    {selected.displayTitle}
                  </h2>
                  {selected.displaySubtitle && (
                    <p className="mt-1 font-body text-sm font-semibold text-[var(--color-text-brand)]">
                      {selected.displaySubtitle}
                    </p>
                  )}
                  {selected.displayEra && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      <strong>{storyCopy.era}:</strong> {selected.displayEra}
                    </p>
                  )}
                  {selected.displayEstablishedBy && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      <strong>{storyCopy.established_by}:</strong> {selected.displayEstablishedBy}
                    </p>
                  )}
                  {selected.displayDeity && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      <strong>{storyCopy.deity}:</strong> {selected.displayDeity}
                    </p>
                  )}
                  {selected.displaySanctum && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      <strong>{storyCopy.sanctum}:</strong> {selected.displaySanctum}
                    </p>
                  )}
                  {selected.displayAttributes && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      <strong>{storyCopy.attributes}:</strong> {selected.displayAttributes}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--color-line-soft)] pt-5">
                <p className="font-body text-[15px] leading-relaxed text-[var(--color-text-secondary)] mb-6 font-medium">
                  {selected.displaySummary}
                </p>
                {selected.detailsHtmlContent && (
                  <div
                    className="prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-4"
                    dangerouslySetInnerHTML={{ __html: selected.detailsHtmlContent }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
