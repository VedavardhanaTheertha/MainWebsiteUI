import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

const { completed, ongoing, upcoming } = content[defaultLang].pages.projects;

export default function ProjectsPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12">
        <p className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">{content[defaultLang].pages.projects.eyebrow}</p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-2xl lg:text-4xl mb-3">Sacred Projects</h1>
        <p className="font-body text-[var(--color-text-secondary)] text-base mb-10 max-w-2xl">Building for eternity  every project is an act of devotion to Shri Krishna and service to the community.</p>

        <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4" id="completed">Completed Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {completed.map((p) => (
            <div key={p.name} className="rounded-xl p-5 border" style={{ background: "#FDF0DC", borderColor: "#D4A056" }}>
              <span className="font-body text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#6B3A10", background: "#F5D5A0" }}>{p.year} — Completed</span>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-[16px] mt-2 mb-1">{p.name}</h3>
              <p className="font-body text-[var(--color-text-secondary)] text-sm">{p.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4" id="ongoing">On-going Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {ongoing.map((p) => (
            <div key={p.name} className="rounded-xl p-5 border" style={{ background: "#FDEBD0", borderColor: "#C4720A" }}>
              <span className="font-body text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#7A3800", background: "#FFCF8B" }}>On-going</span>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-[16px] mt-2 mb-1">{p.name}</h3>
              <p className="font-body text-[var(--color-text-secondary)] text-sm mb-3">{p.desc}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#FFCF8B" }}>
                <div className="h-full bg-[var(--color-saffron-600)] rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
              <p className="font-body text-[10px] text-[var(--color-text-secondary)] mt-1">{p.progress}% complete</p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4" id="upcoming">Upcoming Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {upcoming.map((p) => (
            <div key={p.name} className="rounded-xl p-5 border" style={{ background: "#F9E8CC", borderColor: "#B8925A" }}>
              <span className="font-body text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#5C3010", background: "#EDD5A0" }}>Upcoming</span>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-[16px] mt-2 mb-1">{p.name}</h3>
              <p className="font-body text-[var(--color-text-secondary)] text-sm">{p.desc}</p>
            </div>
          ))}
        </div>

        <div id="vision" className="bg-[var(--color-paper)] rounded-2xl p-8 text-center">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-2xl mb-3">Our Vision</h2>
          <p className="font-body text-[var(--color-text-brand)]/80 text-base max-w-2xl mx-auto">{content[defaultLang].pages.projects.vision}</p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
