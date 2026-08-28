import SiteFooter from "@/components/SiteFooter";
import ImageListCards from "@/components/ImageListCards";

export default function LearnPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative w-full flex items-center justify-center" style={{ background: "var(--color-parchment)", minHeight: "200px" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, var(--color-saffron-600) 0%, transparent 60%), radial-gradient(circle at 80% 50%, var(--color-saffron-600) 0%, transparent 60%)" }} />
        <div className="relative text-center px-4 py-10">
          <p className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">KNOWLEDGE CENTER</p>
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-2xl lg:text-4xl mb-3">Learn with Us</h1>
          <p className="font-body text-[var(--color-text-brand)] text-base max-w-xl mx-auto">Study the scriptures, language and music of the tradition — guided by the scholars of the Matha.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12">
        <ImageListCards contentKey="learn" />
      </div>
      <SiteFooter />
    </>
  );
}
