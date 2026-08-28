import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

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

const sanitizeOptions = {
  allowedTags: [
    "a", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3",
    "h4", "h5", "h6", "hr", "li", "ol", "p", "pre", "s", "strong", "ul",
  ],
  allowedAttributes: { a: ["href", "title"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attributes) => {
      if (attributes.href && !hasSafeHref(attributes.href)) delete attributes.href;
      return { tagName, attribs: attributes };
    },
  },
};

/** Converts repository Markdown to explicitly allowlisted, sanitized HTML. */
export function renderMarkdown(source) {
  if (typeof source !== "string") throw new TypeError("Markdown source must be a string.");
  return sanitizeHtml(markdown.render(source), sanitizeOptions);
}