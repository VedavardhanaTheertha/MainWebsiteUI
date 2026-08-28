import Link from "next/link";
import { content, defaultLang } from "@/gen/content";

const detected = content[defaultLang].pages.detected;

// TODO: Replace placeholder copy with approved content from management
const blocks = [
  {
    id: "annadaana",
    tag: "Annadaana",
    title: "The Gift That Never Diminishes",
    image: "/vittala.png",
    imageAlt: "Devotees receiving prasada at the Bhojana Shala",
    body: [
      detected.significance_annadaana,
      `The tradition traces to the teaching of Sri Madhwacharya himself, who saw Annadaana not as charity but as the highest form of worship. When you feed a human being, you are feeding the Divine seated within them. There is no return expected, no prayer required of the recipient. The act is complete in itself.`,
      detected.significance_paryaya,
    ],
    cta: { label: "Support Annadaana", href: "/sevas?category=Bhojana+Shala" },
  },
  {
    id: "founding",
    tag: "Our Story",
    title: "An Unbroken Flame Since the 13th Century",
    image: "/Madhwacharya-new.jpg",
    imageAlt: "Sri Madhwacharya, the founder of the Dvaita Vedanta tradition",
    body: [
      detected.significance_founding,
      detected.significance_lineage,
      `The Matha's legacy extends beyond ritual: it has been a centre of Sanskrit learning, Vedic preservation, and social welfare for centuries. To visit is to step into a tradition older than most nations on earth.`,
    ],
    cta: { label: "Read the Full History", href: "/about" },
  },
  {
    id: "poojas",
    tag: "Individual Poojas",
    title: "Each Pooja, a Universe of Meaning",
    image: "/lord-vitthala.jpeg",
    imageAlt: "Sacred pooja being performed at the main sannidhi",
    body: [
      `A pooja is not a transaction — it is a conversation with the infinite. Each element of a traditional pooja — the water, the flowers, the incense, the flame, the food — represents one of the five elements, and through them, the worshipper is symbolically offering back to God the world He has given us.`,
      detected.significance_poojas,
      `When you sponsor a pooja, you are not simply paying for a service. You are weaving your intention, your prayer, and your love into a sacred act that has been performed identically for generations. Your name is announced before the deity. Your family is prayed for. You become, briefly and beautifully, part of the ritual.`,
    ],
    cta: { label: "Offer a Pooja", href: "/sevas?category=Krishna+Sannidhi" },
  },
];

export default function SignificanceSection() {
  return (
    <section className="py-16 lg:py-24 bg-[var(--color-cream)]" aria-labelledby="significance-heading">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="mb-12 lg:mb-16">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">
            The Living Tradition
          </p>
          <h2
            id="significance-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl lg:text-5xl"
          >
            Why This Matters
          </h2>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {blocks.map((block, index) => (
            <article
              key={block.id}
              className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-start`}
              aria-labelledby={`sig-${block.id}-title`}
            >
              {/* Image */}
              <div className="w-full lg:w-2/5 shrink-0">
                <div className="rounded-[20px] overflow-hidden aspect-[4/3] bg-[var(--color-saffron-600)]">
                  <img
                    src={block.image}
                    alt={block.imageAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <span className="inline-block font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold bg-[var(--color-saffron-100)] rounded-full px-3 py-1 mb-4">
                  {block.tag}
                </span>
                <h3
                  id={`sig-${block.id}-title`}
                  className="font-display font-bold text-[var(--color-text-primary)] text-2xl sm:text-3xl lg:text-4xl mb-5 leading-tight"
                >
                  {block.title}
                </h3>
                <div className="space-y-4">
                  {block.body.map((para, i) => (
                    <p key={i} className="font-body text-[var(--color-text-secondary)] text-base leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                <Link
                  href={block.cta.href}
                  className="inline-flex items-center gap-2 mt-7 font-body font-semibold text-[var(--color-text-brand)] text-sm hover:gap-3 transition-all focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
                >
                  {block.cta.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
