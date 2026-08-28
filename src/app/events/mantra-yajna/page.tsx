import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata = content[defaultLang].page_metadata.yajna;

export default function MantraYajnaPage() {
  return (
    <>
      {/* Hero — matches the design reference's .m-dhero */}
      <div className="relative h-[180px] lg:h-[280px]">
        <Image src="/krishna.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,17,8,.1), rgba(26,17,8,.5))" }} />
        <div className="absolute left-4 lg:left-8 bottom-4 right-4">
          <p className="text-[10px] font-bold tracking-[.16em] uppercase text-[var(--color-saffron-200)]">{content[defaultLang].pages.detected.yajna_eyebrow}</p>
          <h1 className="font-display text-[30px] lg:text-5xl text-[var(--color-cream-hi)] leading-tight mt-1">Krishna Mantra Lekhana Yajna</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">

        {/* What is it */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-3">What is Mantra Lekhana Yajna?</h2>
          <p className="font-body text-[var(--color-text-secondary)] text-base leading-relaxed mb-3">
            {content[defaultLang].pages.detected.yajna_intro}
          </p>
          <p className="font-body text-[var(--color-text-secondary)] text-base leading-relaxed">
            This is a practice rooted in the Madhwa tradition — Nama Smarana (remembrance of the divine name) is considered one of the nine forms of Bhakti. Writing the mantra aligns your mind, hand, and soul in devotion.
          </p>
        </div>

        {/* How to participate */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4">How to Participate</h2>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Register your Sankalpa", desc: "Fill in the form below with your name and the number of writings you commit to (e.g. 108, 1008, or 10,008)." },
              { step: "2", title: "Write the Mantra", desc: 'Write "Shri Krishnaya Namaha" in a clean notebook with a calm mind. You may write in Kannada, Sanskrit, or any language.' },
              { step: "3", title: "Submit your count", desc: "Once complete, note the total count and submit it. Your contribution will be added to the collective Yajna count." },
              { step: "4", title: "Receive Prasada", desc: content[defaultLang].pages.detected.yajna_step4 },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-saffron-600)] text-white font-display font-bold text-sm flex items-center justify-center">{item.step}</span>
                <div>
                  <p className="font-body font-semibold text-[var(--color-text-primary)] text-[15px]">{item.title}</p>
                  <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-700)] rounded-2xl p-6 text-white mb-6">
          <p className="font-body text-[11px] uppercase tracking-widest font-semibold opacity-80 mb-1">Collective Progress</p>
          <p className="font-display font-bold text-3xl mb-1">24,81,600</p>
          <p className="font-body text-white/80 text-sm mb-4">writings submitted so far — Goal: 1,00,00,000</p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: "24.8%" }} />
          </div>
          <p className="font-body text-white/70 text-[11px] mt-1">24.8% complete</p>
        </div>

        {/* Registration Form */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4">Register Your Sankalpa</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1">Full Name *</label>
                <input type="text" placeholder="Your name" required className="w-full px-3 py-2.5 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-saffron-600)] bg-white" />
              </div>
              <div>
                <label className="block font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1">Phone *</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" required className="w-full px-3 py-2.5 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-saffron-600)] bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1">City / Location *</label>
                <input type="text" placeholder="Your city" required className="w-full px-3 py-2.5 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-saffron-600)] bg-white" />
              </div>
              <div>
                <label className="block font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1">Sankalpa (No. of writings)</label>
                <select className="w-full px-3 py-2.5 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-saffron-600)] bg-white">
                  <option>108 writings</option>
                  <option>1,008 writings</option>
                  <option>10,008 writings</option>
                  <option>1,00,008 writings</option>
                  <option>Custom count</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1">Email (optional)</label>
              <input type="email" placeholder="For confirmation" className="w-full px-3 py-2.5 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-saffron-600)] bg-white" />
            </div>
            <button type="submit"
              className="w-full py-3 bg-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-700)] text-white font-body font-semibold text-sm rounded-xl transition-colors">
              Register Sankalpa — Shri Krishnaya Namaha
            </button>
          </form>
        </div>

      </div>
      <SiteFooter />
    </>
  );
}
