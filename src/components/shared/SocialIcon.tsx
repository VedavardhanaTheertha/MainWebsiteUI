// lucide-react intentionally ships no brand/social marks, so these four are
// small hand-drawn outline icons kept minimal to match the lucide stroke style.
const PATHS: Record<string, string> = {
  instagram:
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5ZM17.5 6.5h.01",
  facebook:
    "M14 9h3V6h-3a4 4 0 0 0-4 4v2H8v3h2v6h3v-6h2.5l.5-3H13v-2a1 1 0 0 1 1-1Z",
  youtube:
    "M21 8.5s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.2-1C14.8 5 12 5 12 5h0s-2.8 0-5.9.2c-.5.1-1.4.1-2.2 1C3.2 6.9 3 8.5 3 8.5S2.8 10.4 2.8 12.3v1.4C2.8 15.6 3 17.5 3 17.5s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.2.2 7.2.2s2.8 0 5.9-.2c.5-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4C21.2 10.4 21 8.5 21 8.5ZM10 15V9l5.2 3-5.2 3Z",
  whatsapp:
    "M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Zm4.9 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-1-.3-1.6-.6-2.8-1.2-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.5.5c-.2.2-.3.4-.1.7.1.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.4.3.1.5.1.6-.1l.7-.8c.2-.3.4-.2.7-.1l1.6.8c.2.1.4.2.4.4.1.2.1.7-.1 1.3Z",
};

export function SocialIcon({ id, className = "" }: { id: string; className?: string }) {
  const path = PATHS[id];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
