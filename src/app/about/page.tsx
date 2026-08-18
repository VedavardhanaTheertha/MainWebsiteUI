import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About | Shri Shiroor Matha, Udupi",
  description:
    "The founding story, history, and Guru Parampara of Shri Shiroor Matha — an 800+ year lineage of devotion in Udupi.",
};

// TODO: Replace with verified Guru Parampara names from management (30+ names)
const guruParampara = [
  "Sri Madhwacharya (1238–1317)",
  "Sri Padmanabha Theertha",
  "Sri Narahari Theertha",
  "Sri Madhava Theertha",
  "Sri Akshobhya Theertha",
  "Sri Jaya Theertha",
  "Sri Vidyadhiraja Theertha",
  "Sri Kavindra Theertha",
  "Sri Vageesha Theertha",
  "Sri Ramachandra Theertha",
  "Sri Vidyanidhi Theertha",
  "Sri Rajendra Theertha",
  "Sri Vijayndra Theertha",
  "Sri Sudhindra Theertha",
  "Sri Raghavendra Swami",
  "Sri Yogindra Theertha",
  "Sri Surottama Theertha",
  "Sri Veerendraindra Theertha",
  "Sri Sumathindra Theertha",
  "Sri Upendra Theertha",
  "Sri Satyananda Theertha",
  "Sri Vishnu Theertha (Shiroor lineage begins)",
  "Sri Narayana Theertha",
  "Sri Lakshmi Narayana Theertha",
  "Sri Satya Prajña Theertha",
  "Sri Vidyavallabesha Theertha I",
  "Sri Sudhindra Theertha II",
  "Sri Lakshmivara Theertha",
  "Sri Vidyasagara Theertha",
  "Sri Vidyavallabesha Theertha (Current Swamiji)",
  // TODO: Confirm complete list and dates from management — this is a placeholder
];

export default function AboutPage() {
  return (
    <>
      {/* Page hero */}
      <div className="relative bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/gopura.png"
            alt=""
            fill
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
            Our Heritage
          </p>
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-6xl mb-4">
            Shri Shiroor Matha
          </h1>
          <p className="font-body text-[var(--color-text-brand)]/75 text-lg max-w-2xl mx-auto">
            Over 800 years. 30+ generations. One unbroken flame of devotion to Lord Krishna.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* Founding Story */}
        <section aria-labelledby="founding-heading" className="mb-16 lg:mb-20">
          <h2
            id="founding-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-6"
          >
            The Founding Story
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/5 shrink-0">
              <div className="rounded-[18px] overflow-hidden">
                <Image
                  src="/Madhwacharya-new.jpg"
                  alt="Sri Madhwacharya — founder of Dvaita Vedanta and the Ashta Mathas of Udupi"
                  width={500}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
              <p className="font-body text-xs text-[var(--color-text-secondary)] text-center mt-2">
                Sri Madhwacharya (1238–1317 CE)
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {/* TODO: Replace with approved historical content from management */}
              <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
                Sri Madhwacharya, the philosopher-saint who systematised the Dvaita (dualist) school of
                Vedanta, established eight monasteries (Ashta Mathas) in Udupi to ensure the perpetual
                worship of Lord Krishna. Each Matha was entrusted with a unique set of duties and a portion
                of the temple worship — a system of rotating stewardship called Paryaya.
              </p>
              <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
                Shri Shiroor Matha is one of these eight sacred institutions. Its lineage — the Guru
                Parampara — runs in an unbroken chain from Sri Madhwacharya himself to the current Swamiji,
                spanning over thirty generations and eight centuries of living tradition.
              </p>
              <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
                The Paryaya system, unique in the world of Hindu monasticism, means that every twelve years,
                Shri Shiroor Matha assumes the role of presiding institution at the Udupi Sri Krishna
                Temple — a responsibility involving the complete management of temple worship, Annadaana, and
                spiritual programming for two full years.
              </p>
              <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
                The 2026–2028 Paryaya is that sacred moment — and devotees worldwide are invited to
                participate, support, and witness.
              </p>
            </div>
          </div>
        </section>

        {/* Swamiji Bio */}
        <section aria-labelledby="swamiji-bio-heading" className="mb-16 lg:mb-20 bg-white rounded-[20px] p-8 shadow-[0_4px_18px_rgba(60,7,83,0.10)]">
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            <div className="rounded-2xl overflow-hidden w-32 h-40 shrink-0 bg-[var(--color-saffron-100)]">
              <Image
                src="/swamiji.png"
                alt="His Holiness Swamiji — current pontiff of Shri Shiroor Matha"
                width={128}
                height={160}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="inline-block font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold bg-[var(--color-saffron-100)] rounded-full px-3 py-1 mb-2">
                Current Pontiff
              </span>
              {/* TODO: Confirm Swamiji's full name and title from management */}
              <h2
                id="swamiji-bio-heading"
                className="font-display font-bold text-[var(--color-text-primary)] text-2xl lg:text-3xl mb-1"
              >
                His Holiness Shri Vidyavallabesha Theertha Swamiji
              </h2>
              <p className="font-body text-[var(--color-text-secondary)] text-sm">
                30th in the Guru Parampara · Paryaya 2026–2028
              </p>
            </div>
          </div>

          {/* TODO: Replace with real biographical content from management */}
          <div className="space-y-4">
            <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
              His Holiness was initiated into Sanyasa in the sacred tradition of Sri Madhwacharya, receiving
              the monastic name and lineage that places him in direct spiritual succession from the founder
              of Dvaita Vedanta. Under his guidance, Shri Shiroor Matha has experienced a renaissance of
              Vedic learning, expanded Annadaana programs, and deepened outreach to devotees worldwide.
            </p>
            <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
              Renowned for his scholarship in Sanskrit, Vedanta, and Kannada literature, Swamiji has
              authored numerous texts on Madhwa philosophy. He is equally known for his accessibility —
              welcoming devotees of all backgrounds who seek guidance, solace, or simply the blessing of his
              presence.
            </p>
            <p className="font-body text-[var(--color-text-secondary)] leading-relaxed">
              The Paryaya 2026–2028 is the culmination of decades of preparation — and an opportunity for
              devotees to witness, support, and participate in a tradition that has endured for eight
              unbroken centuries.
            </p>
          </div>
        </section>

        {/* Guru Parampara */}
        <section aria-labelledby="parampara-heading">
          <h2
            id="parampara-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-4"
          >
            The Guru Parampara
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] mb-8">
            An unbroken lineage of 30+ Swamijis, each carrying forward the flame from Sri Madhwacharya to the present day.
            {/* TODO: Complete and verify all names and dates with management */}
          </p>

          <div className="relative pl-6 border-l-2 border-[var(--color-saffron-600)] space-y-0">
            {guruParampara.map((name, i) => (
              <div key={i} className="relative pb-6">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                    i === guruParampara.length - 1
                      ? "border-[var(--color-saffron-600)] bg-[var(--color-saffron-600)]"
                      : "border-[var(--color-saffron-600)] bg-[var(--color-paper)]"
                  }`}
                  aria-hidden="true"
                />
                <p
                  className={`font-body text-sm leading-relaxed ${
                    i === guruParampara.length - 1
                      ? "text-[var(--color-text-brand)] font-semibold"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span className="text-[var(--color-text-brand)] mr-2 text-xs">{String(i + 1).padStart(2, "0")}.</span>
                  {name}
                  {i === guruParampara.length - 1 && " ✦ Current Pontiff"}
                </p>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-[var(--color-text-secondary)]/50 mt-4 italic">
            * Placeholder Parampara — to be verified and completed with management before launch.
          </p>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
