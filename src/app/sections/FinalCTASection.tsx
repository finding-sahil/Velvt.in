import { Button } from "@/components/ui/Button";

interface FinalCTASectionProps {
  title?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function FinalCTASection({
  title = "Let's Create What's Next.",
  buttonText = "Collaborate With Us",
  buttonHref = "/contact",
}: FinalCTASectionProps) {
  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="container-narrow relative text-center space-y-5">
        <h2 className="section-title">
          {title}
        </h2>
        <div className="red-rule center" />

        <p className="text-xs sm:text-sm text-g5 leading-relaxed max-w-sm mx-auto">
          Open for artist collaborations, venue takeovers, and strategic brand partnerships in Kolkata.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button href={buttonHref} variant="primary" size="md">
            {buttonText}
          </Button>
          <Button href="/volunteers/register" variant="secondary" size="md">
            Join As Volunteer
          </Button>
          <Button href="/contact" variant="outline" size="md">
            Direct Inquiry
          </Button>
        </div>
      </div>
    </section>
  );
}

