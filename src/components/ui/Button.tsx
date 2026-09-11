// UNTOLDSURI Glassmorphic Button Component
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "ember";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-red hover:bg-[#a50d25] text-white border-red shadow-[0_0_20px_rgba(200,16,46,0.45)] hover:shadow-[0_0_28px_rgba(200,16,46,0.6)] active:scale-[0.98]",
  secondary:
    "bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/[0.12] hover:border-red/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-white/[0.06] text-g6 hover:text-white border-transparent",
  outline:
    "bg-transparent hover:bg-red/10 text-white border-red/40 hover:border-red shadow-[0_0_12px_rgba(200,16,46,0.15)] active:scale-[0.98]",
  danger:
    "bg-red/20 hover:bg-red/40 text-white border-red/40",
  ember:
    "bg-gradient-to-r from-red to-ember text-white border-transparent shadow-[0_0_24px_rgba(224,90,43,0.4)] hover:shadow-[0_0_32px_rgba(224,90,43,0.6)] active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-[0.72rem] tracking-[0.14em] font-bold",
  md: "px-6 py-2.5 text-[0.78rem] tracking-[0.16em] font-bold",
  lg: "px-7 py-3 text-[0.82rem] tracking-[0.18em] font-extrabold",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  loading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `
    inline-flex items-center justify-center gap-2
    font-display uppercase rounded-full border
    transition-all duration-200 ease-smooth cursor-pointer
    focus-visible:outline-2 focus-visible:outline-red focus-visible:outline-offset-2
    disabled:opacity-40 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
