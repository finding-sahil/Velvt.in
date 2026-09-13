"use client";

import { useState } from "react";
import { submitSponsorInquiry } from "@/app/actions";

interface SponsorInquiryFormProps {
  deckUrl?: string | null;
}

export function SponsorInquiryForm({ deckUrl }: SponsorInquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await submitSponsorInquiry(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrors(result.errors || {});
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-red/40 bg-gradient-to-b from-red/10 via-black to-black p-8 sm:p-12 text-center space-y-6 shadow-[0_0_40px_rgba(200,16,46,0.2)]">
        <div className="w-16 h-16 rounded-full bg-red-dim border border-red-glow mx-auto flex items-center justify-center text-2xl text-red">
          ✓
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Inquiry Dispatched
          </h3>
          <p className="text-sm text-g5 max-w-md mx-auto leading-relaxed">
            Thank you for your interest in partnering with VELVT. Our executive production desk will review your brand profile and reach out within 24–48 hours.
          </p>
        </div>

        {deckUrl && (
          <div className="pt-2">
            <a
              href={deckUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all"
            >
              <span>Download Official Deck (PDF)</span>
              <span>↓</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.6)] space-y-6"
    >
      {/* Anti-spam honeypot */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      {errors._form && (
        <div className="p-4 rounded-xl border border-red/40 bg-red/10 text-red text-xs font-mono">
          {errors._form[0]}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Company / Brand Name *
          </label>
          <input
            type="text"
            name="companyName"
            required
            placeholder="e.g. Red Bull, Monster, Local Brand"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          />
          {errors.companyName && (
            <p className="text-[11px] font-mono text-red mt-1">{errors.companyName[0]}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Contact Person &amp; Designation *
          </label>
          <input
            type="text"
            name="contactPerson"
            required
            placeholder="e.g. Jane Doe, Brand Lead"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          />
          {errors.contactPerson && (
            <p className="text-[11px] font-mono text-red mt-1">{errors.contactPerson[0]}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Official Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="partner@company.com"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          />
          {errors.email && (
            <p className="text-[11px] font-mono text-red mt-1">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Phone / WhatsApp Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Sponsorship Interest *
          </label>
          <select
            name="sponsorshipInterest"
            required
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          >
            <option value="Title Partner">Title / Headline Partner</option>
            <option value="Co-Powered By">Co-Powered By Partner</option>
            <option value="Beverage & Hospitality">Beverage &amp; Hospitality Partner</option>
            <option value="Experiential Activation">Experiential Zone / Interactive Booth</option>
            <option value="Media & Press Partner">Media, PR &amp; Press Partner</option>
            <option value="Sound & Light Partner">Sound, Stage &amp; Technical Partner</option>
            <option value="Custom Collaboration">Custom Creative Collaboration</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
            Estimated Budget Range
          </label>
          <select
            name="budgetRange"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors"
          >
            <option value="Under ₹25,000">Under ₹25,000</option>
            <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
            <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
            <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
            <option value="₹2,50,000+">₹2,50,000+ (Headline)</option>
            <option value="Product / In-Kind Sponsorship">Product / In-Kind Sponsorship</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1.5">
          Collaboration Vision &amp; Message *
        </label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Tell us about your brand, what you envision activating at VELVT, or specific goals you want to achieve..."
          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none transition-colors leading-relaxed"
        />
        {errors.message && (
          <p className="text-[11px] font-mono text-red mt-1">{errors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_25px_var(--red-glow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Transmitting Inquiry...</span>
          </>
        ) : (
          <>
            <span>Submit Brand Partnership Inquiry</span>
            <span>&rarr;</span>
          </>
        )}
      </button>
    </form>
  );
}
