export default function KaaviDivider() {
  return (
    <div className="kaavi-line-wrap flex flex-col items-center gap-[5px] py-[16px] pb-[14px]" aria-hidden="true">
      <style>{`
        .kaavi-line-wrap { animation: kaaviPulse 6.5s ease-in-out infinite; }
        @keyframes kaaviPulse { 0%, 100% { opacity: .72; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .kaavi-line-wrap { animation: none; }
        }
      `}</style>
      <span className="h-[2px] rounded-full" style={{ width: 62, opacity: 0.55, background: "#9c3d20" }} />
      <span className="h-[2px] rounded-full" style={{ width: 38, opacity: 0.42, background: "#9c3d20" }} />
      <span className="h-[2px] rounded-full" style={{ width: 18, opacity: 0.3, background: "#9c3d20" }} />
    </div>
  );
}
