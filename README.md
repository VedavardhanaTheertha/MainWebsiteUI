# Shri Shiroor Matha — Website

The open-source website for Shri Shiroor Matha, a Madhwa religious institute in Udupi,
Karnataka. Mobile-first, bilingual, and published as a static site.

---

## 👀 Just want to look at it?

**You do not need to install anything.**

| | Link |
|---|---|
| **Development site** (preview) | https://vedavardhanatheertha.github.io/MainWebsiteUI/ |
| **Build status** | [Actions tab](../../actions) |

Every push rebuilds and republishes the development site automatically. Open the link,
look at the site — that is the whole review process.

> ### ⚠️ Why the development site shows "content goes here"
>
> The preview site deliberately shows **placeholder text** instead of the real wording,
> like `en·hero title — content goes here`. **This is intentional, not a bug.**
>
> - It keeps the preview out of Google, so it can never compete with the real site or
>   confuse someone searching for the Matha.
> - It proves the design is separate from the wording. Any real text appearing here means
>   somebody hardcoded it by mistake — the build reports those automatically.
>
> **Review the layout, spacing, images, colours and navigation here.** The real wording
> lives in [`content/languages/en.json`](content/languages/en.json) and can be read
> directly. Images are real in the preview, only text is substituted.

---

## What this project is

| | |
|---|---|
| **Languages** | English and Kannada, with more addable by dropping in one file |
| **Pages** | 36 |
| **Hosting** | GitHub Pages (preview) · Cloudflare Pages (live, not yet connected) |
| **Built with** | Next.js 16, React 19, Tailwind CSS 4 — exported as plain static files |

### The one idea behind the whole thing

**Content is data. Code is structure.** No page or component contains the words shown on
screen, or a list of languages, or a list of articles. The build scans folders and finds
them.

A contributor's entire job is to **put a file in the right folder**:

| To do this | Add this | Touch any code? |
|---|---|---|
| Add a language | `content/languages/<code>.json` | No |
| Add an article | `content/blog/<slug>/` | No |
| Change wording | edit `content/languages/en.json` | No |

---

## Documentation

| Document | Read it for |
|---|---|
| [docs/STATUS.md](docs/STATUS.md) | **Requirements, what is built, what is left** |
| [docs/KT.md](docs/KT.md) | How to run it and make changes |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How it is designed, and why |

---

## For developers

```bash
npm install
npm run dev
```

Then open **http://localhost:3000/MainWebsiteUI/** — note the path; it mirrors the
deployed preview exactly.

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build:dev` | Full preview build + verification, into `out/` |
| `npm run build:prod` | Full production build + verification |

See [docs/KT.md](docs/KT.md) for everything else.

---

## Licence

See [LICENSE](LICENSE).
