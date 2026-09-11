// UNTOLDSURI Style Section Heading Component

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accentLine?: boolean;
  className?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  accentLine = true,
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={`mb-8 md:mb-12 ${isCenter ? "text-center" : "text-left"} ${className}`}>
      {/* Clean Category Label */}
      {label && (
        <p className="text-[11px] font-mono tracking-[0.2em] text-red uppercase mb-2 font-medium">
          {label}
        </p>
      )}

      {/* Main Display Title */}
      <h2 className="section-title">
        {title}
      </h2>

      {/* Glowing Crimson Rule */}
      {accentLine && (
        <div className={`red-rule ${isCenter ? "center" : ""}`} />
      )}

      {/* Subtitle / Intro Description */}
      {subtitle && (
        <p className={`section-intro ${isCenter ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
