import { readFileSync } from "node:fs";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItTaskLists from "markdown-it-task-lists";
import sanitizeHtml from "sanitize-html";

let cachedPolicy = null;
function getPolicy() {
  if (cachedPolicy) return cachedPolicy;
  try {
    cachedPolicy = JSON.parse(
      readFileSync(new URL("../settings/image_policy.json", import.meta.url), "utf8"),
    );
  } catch {
    cachedPolicy = {
      unoptimized: true,
      remotePatterns: [
        { protocol: "https", hostname: "shiroormatha.org", pathname: "/**" },
        { protocol: "https", hostname: "www.shiroormatha.org", pathname: "/**" },
        { protocol: "https", hostname: "pub-*.r2.dev", pathname: "/**" },
      ],
    };
  }
  return cachedPolicy;
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})
  .use(markdownItFootnote)
  .use(markdownItTaskLists, { enabled: false, label: true });

function hasSafeHref(href) {
  let decoded = href.trim();
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return false;
  }
  decoded = decoded.replace(/[\u0000-\u0020\u007f]+/g, "");
  if (decoded.startsWith("//")) return false;
  if (decoded.startsWith("/") || decoded.startsWith("#")) return true;
  const scheme = decoded.match(/^([a-z][a-z\d+.-]*):/iu)?.[1]?.toLowerCase();
  return scheme ? ["http", "https", "mailto"].includes(scheme) : true;
}

function matchPatternSegment(pattern, actual) {
  if (pattern === "**") return true;
  const escaped = pattern
    .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
    .replace(/\\\*/g, "[^/]*");
  return new RegExp("^" + escaped + "$").test(actual);
}

function isAllowedImageSrc(src) {
  if (typeof src !== "string") return false;
  let decoded = src.trim();
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return false;
  }
  decoded = decoded.replace(/[\u0000-\u0020\u007f]+/g, "");
  if (decoded.startsWith("//")) return false;
  if (decoded.startsWith("/")) {
    return !decoded.split(/[/?#]/).includes("..");
  }

  let parsed;
  try {
    parsed = new URL(decoded);
  } catch {
    return false;
  }

  if (parsed.username || parsed.password) return false;

  const policy = getPolicy();
  const patterns = policy.remotePatterns || [];
  return patterns.some((pattern) => {
    if (pattern.protocol && `${pattern.protocol}:` !== parsed.protocol) return false;
    if (pattern.port && pattern.port !== parsed.port) return false;
    if (pattern.hostname && !matchPatternSegment(pattern.hostname, parsed.hostname)) return false;
    if (pattern.pathname) {
      if (pattern.pathname === "/**") return true;
      const pathPattern = pattern.pathname.startsWith("/") ? pattern.pathname : `/${pattern.pathname}`;
      if (!matchPatternSegment(pathPattern, parsed.pathname)) return false;
    }
    return true;
  });
}

function isAllowedAudioSrc(src) {
  return isAllowedImageSrc(src);
}

function isAllowedIframeSrc(src) {
  if (typeof src !== "string") return false;
  let parsed;
  try {
    parsed = new URL(src.trim());
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  const allowedHosts = new Set(["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"]);
  if (!allowedHosts.has(host)) return false;
  if (host.includes("youtube") && !parsed.pathname.startsWith("/embed/")) return false;
  if (host.includes("vimeo") && !parsed.pathname.startsWith("/video/")) return false;
  return true;
}

const sanitizeOptions = {
  allowedTags: [
    "a", "abbr", "audio", "b", "blockquote", "br", "caption", "cite", "code", "dd",
    "del", "details", "dfn", "dl", "dt", "em", "h1", "h2", "h3", "h4",
    "h5", "h6", "hr", "i", "iframe", "img", "input", "kbd", "label", "li", "mark", "ol",
    "p", "pre", "rp", "rt", "ruby", "s", "section", "small", "source", "strong", "sub",
    "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "u", "ul",
  ],
  allowedAttributes: {
    a: ["href", "title", "id", "class"],
    abbr: ["title"],
    audio: ["controls", "preload", "class"],
    details: ["open", "class"],
    dfn: ["title"],
    iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "sandbox", "loading", "class"],
    img: ["src", "alt", "title", "loading", "decoding", "class"],
    input: ["type", "disabled", "checked", "class"],
    label: ["class"],
    li: ["id", "class"],
    ol: ["class"],
    section: ["class"],
    source: ["src", "type"],
    sup: ["id", "class"],
    td: ["align", "colspan", "rowspan", "class"],
    th: ["align", "colspan", "rowspan", "scope", "class"],
    time: ["datetime"],
    ul: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attributes) => {
      if (attributes.href && !hasSafeHref(attributes.href)) delete attributes.href;
      return { tagName, attribs: attributes };
    },
    img: (tagName, attributes) => {
      if (!attributes.src || !isAllowedImageSrc(attributes.src)) {
        return { tagName: "", attribs: {} };
      }
      return {
        tagName: "img",
        attribs: {
          ...attributes,
          loading: "lazy",
          decoding: "async",
        },
      };
    },
    audio: (tagName, attributes) => {
      if (attributes.src && !isAllowedAudioSrc(attributes.src)) {
        return { tagName: "", attribs: {} };
      }
      return {
        tagName: "audio",
        attribs: {
          ...attributes,
          controls: "",
          preload: "none",
        },
      };
    },
    source: (tagName, attributes) => {
      if (attributes.src && !isAllowedAudioSrc(attributes.src)) {
        return { tagName: "", attribs: {} };
      }
      return { tagName, attribs: attributes };
    },
    iframe: (tagName, attributes) => {
      if (!attributes.src || !isAllowedIframeSrc(attributes.src)) {
        return { tagName: "", attribs: {} };
      }
      return {
        tagName: "iframe",
        attribs: {
          ...attributes,
          loading: "lazy",
          sandbox: "allow-scripts allow-same-origin allow-presentation",
        },
      };
    },
    input: (tagName, attributes) => {
      if (attributes.type !== "checkbox") {
        return { tagName: "", attribs: {} };
      }
      return {
        tagName: "input",
        attribs: {
          type: "checkbox",
          disabled: "",
          ...(attributes.checked !== undefined ? { checked: "" } : {}),
          ...(attributes.class ? { class: attributes.class } : {}),
        },
      };
    },
  },
};


/** Converts repository Markdown to explicitly allowlisted, sanitized HTML. */
export function renderMarkdown(source) {
  if (typeof source !== "string") throw new TypeError("Markdown source must be a string.");
  return sanitizeHtml(markdown.render(source), sanitizeOptions);
}
