"use client";

import { useEffect, useState } from "react";
import { useVolunteerModal } from "@/hooks/useVolunteerModal";

const serviceOptions = [
  "Logistics",
  "Digital & Media",
  "Annadana Support",
  "Guest Services",
];

export default function VolunteerModal() {
  const { isOpen, closeVolunteerModal } = useVolunteerModal();
  const [form, setForm] = useState({
    name: "", phone: "", location: "", email: "",
    occupation: "", service: "", availableFrom: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    closeVolunteerModal();
    setTimeout(() => setSubmitted(false), 400);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-[var(--color-ink-900)]/70 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog" aria-modal="true" aria-label="Volunteer Registration"
    >
      <div
        className="relative bg-[var(--color-paper)] rounded-t-[22px] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 rounded-full bg-[var(--color-line-strong)] mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] px-6 py-5">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <p className="font-body text-[11px] tracking-widest uppercase text-white/70 font-semibold mb-0.5">Paryaya 2026–2028</p>
          <h2 className="font-display font-bold text-white text-2xl">Volunteer Registration</h2>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-saffron-600)]/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-saffron-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-2">Registered! 🙏</h3>
            <p className="font-body text-[var(--color-text-secondary)] text-sm">Thank you for offering your Seva. We&apos;ll reach out shortly.</p>
            <button onClick={handleClose} className="mt-6 font-body text-sm font-semibold text-white bg-[var(--color-saffron-600)] px-6 py-2.5 rounded-full hover:bg-[var(--color-saffron-700)] transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Full Name <span className="text-[var(--color-text-brand)]">*</span></label>
              <input required value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Your full name"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            {/* Phone */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Phone Number <span className="text-[var(--color-text-brand)]">*</span></label>
              <input required value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX" type="tel"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            {/* Location */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Location (City / Town) <span className="text-[var(--color-text-brand)]">*</span></label>
              <input required value={form.location} onChange={e => set("location", e.target.value)}
                placeholder="e.g. Udupi, Mangalore, Bangalore"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            {/* Email */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Email <span className="text-[var(--color-text-secondary)]/50 font-normal">(optional)</span></label>
              <input value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="your@email.com" type="email"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            {/* Occupation */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Occupation</label>
              <input value={form.occupation} onChange={e => set("occupation", e.target.value)}
                placeholder="e.g. Student, Teacher, Engineer"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            {/* Service */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Area of Service</label>
              <select value={form.service} onChange={e => set("service", e.target.value)}
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors">
                <option value="">Select a service area</option>
                {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Available From */}
            <div>
              <label className="font-body text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 block">Available From</label>
              <input value={form.availableFrom} onChange={e => set("availableFrom", e.target.value)}
                type="date"
                className="w-full border border-[var(--color-saffron-600)] rounded-lg px-3 py-2.5 font-body text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-saffron-600)] transition-colors" />
            </div>
            <button type="submit"
              className="w-full mt-2 bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] text-white font-body font-semibold text-[14px] py-3 rounded-full hover:shadow-lg hover:scale-[1.01] transition-all">
              Register for Seva 🙏
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
