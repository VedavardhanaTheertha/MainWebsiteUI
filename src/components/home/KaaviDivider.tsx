export default function KaaviDivider() {
  return (
    <div className="kaavi-line-wrap flex flex-col items-center gap-[3px] py-0.5 sm:py-1" aria-hidden="true">
      <span className="h-[2px] rounded-full" style={{ width: 62, opacity: 0.55, background: "#9c3d20" }} />
      <span className="h-[2px] rounded-full" style={{ width: 38, opacity: 0.42, background: "#9c3d20" }} />
      <span className="h-[2px] rounded-full" style={{ width: 18, opacity: 0.3, background: "#9c3d20" }} />
    </div>
  );
}
