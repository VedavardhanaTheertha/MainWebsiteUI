"use client";

import Image from "next/image";

const gridCards = [
  {
    title: "Wanna Volunteer?",
    sub: "Be part of the sacred service during Paryaya 2026-28. Serve the divine by serving the devotees.",
    btn: "Get Involved",
    img: "/slide/KRAJ0615.JPG",
  },
  {
    title: "Krishna Mantra Lekhana Yajna",
    sub: "Write “Shri Krishnaya Namaha” and align your sankalpa with the sacred presence of Shri Krishna at Udupi.",
    btn: "Join the Yajna",
    img: "/slide/KRAJ0835.JPG",
  },
  {
    title: "Veda Parayana Seva",
    sub: "Support the sacred recitation of the Vedas at our Matha. Your offering helps sustain continuous Veda chanting and blesses the entire community.",
    btn: "Offer Seva",
    img: "/slide/KRAJ0615.JPG",
  },
  {
    title: "Paryaya Heritage Project",
    sub: "Contribute to the restoration and beautification of Shri Shiroor Matha's sacred spaces during the auspicious Paryaya 2026-28.",
    btn: "Know More",
    img: "/slide/KRAJ0835.JPG",
  },
  {
    title: "Upcoming Events",
    sub: "Rathotsava, Krishnashtami, Dvaadashastuti & more -- stay connected with all sacred events at Shri Shiroor Matha.",
    btn: "Explore Events",
    img: "/slide/KRAJ0615.JPG",
  },
  {
    title: "Go Matha Seva",
    sub: "Offer nourishment to the sacred cows at Shri Shiroor Matha. A timeless act of compassion and devotion.",
    btn: "Sponsor a Cow",
    img: "/slide/go-matha.jpg",
  },
];

export default function CardGrid() {
  return (
    <div className="w-full bg-[#E8D9C0] py-6 px-4 lg:px-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {gridCards.map((card) => (
          <div key={card.title} className={`flex flex-col group cursor-pointer${card.title === "Go Matha Seva" ? " lg:hidden" : ""}`}>
            <div className="w-full h-[150px] sm:h-[190px] lg:h-[220px] overflow-hidden relative">
              <Image
                src={card.img}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 20vw"
              />
            </div>
            <div className="flex flex-col items-center text-center px-3 pt-4 pb-2 gap-3">
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[14px] lg:text-[16px] leading-snug">{card.title}</p>
              <a
                href="#"
                className="inline-block font-body text-[12px] font-semibold text-white bg-[#C4520A] hover:bg-[#A34009] px-5 py-2.5 rounded-sm transition-colors duration-200"
              >
                {card.btn}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
