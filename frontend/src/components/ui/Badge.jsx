export default function Badge({ children, color = "#2563EB", variant = "soft" }) {
  if (variant === "solid") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
        {children}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
