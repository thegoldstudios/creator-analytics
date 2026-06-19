// Consistent colour per creator based on name hash — no broken image requests
const PALETTE = [
  { bg: "#e8f5e9", text: "#2e7d32" },
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#fce4ec", text: "#ad1457" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#f3e5f5", text: "#6a1b9a" },
  { bg: "#e0f7fa", text: "#00695c" },
  { bg: "#fff8e1", text: "#f57f17" },
  { bg: "#fbe9e7", text: "#bf360c" },
  { bg: "#e8eaf6", text: "#283593" },
  { bg: "#f9fbe7", text: "#558b2f" },
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface Props {
  name: string;
  initials: string;
  size?: "sm" | "lg";
  className?: string;
}

export default function CreatorAvatar({ name, initials, size = "sm", className = "" }: Props) {
  const { bg, text } = colorFor(name);
  const dim = size === "lg" ? "w-14 h-14 rounded-2xl text-base" : "w-10 h-10 rounded-full text-xs";
  return (
    <div
      className={`${dim} flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {initials}
    </div>
  );
}
