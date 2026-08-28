import "./styles.css";
import tabManifest from "./generated/tabs.json";
import { siteConfig } from "./config/site.config.js";
import placeholderConfig from "./config/generated.placeholder.json";

const catalogs = import.meta.glob("./generated/*/index.json", {
  eager: true,
  import: "default",
});
const contentDocuments = import.meta.glob("./generated/*/content/*.html", {
  query: "?raw",
  import: "default",
});

const elements = {
  collectionView: document.querySelector("#collection-view"),
  collectionDescription: document.querySelector("#collection-description"),
  language: document.querySelector("#language-select"),
  textSourcePicker: document.querySelector("#text-source-picker"),
  textSource: document.querySelector("#text-source-select"),
  search: document.querySelector("#library-search"),
  resultsToggle: document.querySelector("#results-toggle"),
  resultsBody: document.querySelector("#results-body"),
  resultCount: document.querySelector("#result-count"),
  resultGrid: document.querySelector("#result-grid"),
  emptyResults: document.querySelector("#empty-results"),
  showAll: document.querySelector("#show-all"),
  contentSection: document.querySelector("#content-section"),
  contentHeading: document.querySelector("#content-heading"),
  contentLoading: document.querySelector("#content-loading"),
  literatureContent: document.querySelector("#literature-content"),
  backToResults: document.querySelector("#back-to-results"),
  unavailableState: document.querySelector("#unavailable-state"),
};

const supportedLocales = new Set(siteConfig.locales.map(({ code }) => code));
const savedLocale = localStorage.getItem("library-locale");
const browserLocale = navigator.language.split("-")[0];
const environment = import.meta.env.MODE;
const canChooseTextSource = environment === "development";
const savedTextSource = localStorage.getItem("library-text-source");
const state = {
  tabs: tabManifest.tabs,
  activeTab: null,
  items: [],
  selectedId: null,
  showAll: false,
  textSource: environment === "stage"
    ? "generated"
    : canChooseTextSource && savedTextSource === "generated"
      ? "generated"
      : "actual",
  locale: supportedLocales.has(savedLocale)
    ? savedLocale
    : supportedLocales.has(browserLocale)
      ? browserLocale
      : siteConfig.defaultLocale,
};

function activeTextConfig() {
  return state.textSource === "generated" ? placeholderConfig.text : siteConfig.text;
}

function text(key) {
  const config = activeTextConfig();
  return config[state.locale]?.[key] ?? config[siteConfig.defaultLocale]?.[key] ?? key;
}

function tabText(tab) {
  if (state.textSource === "generated") {
    return placeholderConfig.tabs[tab.id]?.[state.locale]
      ?? placeholderConfig.tabs[tab.id]?.[siteConfig.defaultLocale];
  }
  return tab.text[state.locale] ?? tab.text[siteConfig.defaultLocale] ?? Object.values(tab.text)[0];
}

function formatText(key, values) {
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, value),
    text(key),
  );
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.title = text("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = text(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = text(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", text(element.dataset.i18nAriaLabel));
  });

  elements.language.setAttribute("aria-label", text("languageLabel"));
  elements.language.value = state.locale;
  elements.textSource.querySelector('[value="actual"]').textContent = text("actualTextOption");
  elements.textSource.querySelector('[value="generated"]').textContent = text("generatedTextOption");
  elements.textSource.setAttribute("aria-label", text("textSourceLabel"));
  elements.textSource.value = state.textSource;
  elements.collectionDescription.textContent = state.activeTab
    ? tabText(state.activeTab).description
    : text("searchDefaultDescription");
  renderResults();
  setResultsExpanded(elements.resultsToggle.getAttribute("aria-expanded") === "true");
}

export function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function searchableText(item) {
  return normalizeSearchValue(
    [item.title, item.kruti, item.krutiKn, item.ankita, item.ankitaKn, ...item.searchTags].join(" "),
  );
}

function resultCard(item) {
  const button = document.createElement("button");
  button.className = "result-card";
  button.type = "button";
  button.dataset.id = item.id;
  button.setAttribute("aria-label", `${text("readingLabel")}: ${item.title}`);

  const title = document.createElement("span");
  title.className = "result-title";
  title.textContent = item.title;

  const divider = document.createElement("span");
  divider.className = "card-divider";
  divider.setAttribute("aria-hidden", "true");

  const author = document.createElement("span");
  author.className = "result-author";
  author.textContent = item.krutiKn || item.kruti || text("unknownAuthor");

  const ankita = document.createElement("span");
  ankita.className = "result-ankita";
  ankita.textContent = item.ankitaKn || item.ankita;

  const arrow = document.createElement("span");
  arrow.className = "card-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";

  button.append(title, divider, author, ankita, arrow);
  button.addEventListener("click", () => selectItem(item));
  return button;
}

function renderResults() {
  const query = normalizeSearchValue(elements.search.value);
  const terms = query.split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? state.items.filter((item) => terms.every((term) => searchableText(item).includes(term)))
    : state.items;

  const isSearching = terms.length > 0;
  const visibleItems = isSearching || state.showAll ? matches : matches.slice(0, 6);
  elements.resultGrid.replaceChildren(...visibleItems.map(resultCard));
  elements.emptyResults.textContent = text("noResults");
  elements.emptyResults.hidden = matches.length > 0;
  elements.resultCount.textContent = formatText("showingResults", {
    shown: visibleItems.length,
    total: matches.length,
  });
  elements.showAll.hidden = isSearching || matches.length <= 6;
  elements.showAll.textContent = state.showAll
    ? text("showLess")
    : formatText("showAll", { total: matches.length });
}

function setResultsExpanded(expanded) {
  elements.resultsBody.hidden = !expanded;
  elements.resultsToggle.setAttribute("aria-expanded", String(expanded));
  const label = text(expanded ? "collapseResults" : "expandResults");
  elements.resultsToggle.setAttribute("aria-label", label);
  elements.resultsToggle.querySelector(".toggle-label").textContent = label;
}

async function selectItem(item) {
  state.selectedId = item.id;
  history.replaceState(null, "", `#${item.id}`);
  setResultsExpanded(false);
  elements.contentSection.hidden = false;
  elements.contentHeading.textContent = item.title;
  elements.literatureContent.replaceChildren();
  elements.contentLoading.hidden = false;

  document.querySelectorAll(".result-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === item.id);
  });

  try {
    const contentLoader = contentDocuments[`./generated/${state.activeTab.id}/${item.contentFile}`];
    if (!contentLoader) throw new Error(`Generated content not found: ${item.contentFile}`);
    elements.literatureContent.innerHTML = await contentLoader();
  } catch (error) {
    elements.literatureContent.textContent = text("contentLoadError");
    console.error(error);
  } finally {
    elements.contentLoading.hidden = true;
    document.title = `${item.title} | ${text("pageTitle")}`;
    elements.contentSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function backToResults() {
  state.selectedId = null;
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.title = text("documentTitle");
  elements.contentSection.hidden = true;
  elements.literatureContent.replaceChildren();
  setResultsExpanded(true);
  document.querySelector(".results-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

function activateTab(tab) {
  state.activeTab = tab;
  state.selectedId = null;
  state.showAll = false;
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.title = text("documentTitle");
  elements.collectionView.hidden = !tab.available;
  elements.unavailableState.hidden = tab.available;
  elements.contentSection.hidden = true;
  elements.literatureContent.replaceChildren();
  elements.collectionDescription.textContent = tabText(tab).description;

  if (!tab.available) return;

  elements.search.value = "";
  setResultsExpanded(true);

  const catalog = catalogs[`./generated/${tab.id}/index.json`];
  if (catalog) {
    state.items = catalog.items;
    renderResults();
    elements.search.focus();
  } else {
    state.items = [];
    renderResults();
    elements.emptyResults.textContent = text("catalogLoadError");
    elements.emptyResults.hidden = false;
  }
}

function initialize() {
  if (canChooseTextSource) {
    elements.textSourcePicker.hidden = false;
  } else {
    elements.textSourcePicker.remove();
  }
  elements.language.replaceChildren(
    ...siteConfig.locales.map(({ code, label }) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = label;
      return option;
    }),
  );

  if (!state.tabs.length) {
    elements.collectionView.hidden = true;
    elements.unavailableState.hidden = false;
    elements.unavailableState.querySelector("h2").textContent = text("libraryLoadErrorTitle");
    elements.unavailableState.querySelector("p").textContent = text("libraryLoadErrorDescription");
    return;
  }

  state.activeTab = state.tabs[0];
  applyTranslations();
  activateTab(state.activeTab);
}

elements.search.addEventListener("input", () => {
  setResultsExpanded(true);
  renderResults();
});
elements.resultsToggle.addEventListener("click", () => {
  setResultsExpanded(elements.resultsToggle.getAttribute("aria-expanded") !== "true");
});
elements.showAll.addEventListener("click", () => {
  state.showAll = !state.showAll;
  renderResults();
});
elements.backToResults.addEventListener("click", backToResults);
elements.language.addEventListener("change", () => {
  state.locale = elements.language.value;
  localStorage.setItem("library-locale", state.locale);
  applyTranslations();
});
elements.textSource.addEventListener("change", () => {
  state.textSource = elements.textSource.value;
  localStorage.setItem("library-text-source", state.textSource);
  applyTranslations();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== elements.search) {
    event.preventDefault();
    elements.search.focus();
  }
});

initialize();
