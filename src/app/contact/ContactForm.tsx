"use client";

import { useState } from "react";
import { submitContactInquiry } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const categories = [
  { value: "general", label: "General Inquiry" },
  { value: "collaboration", label: "Event Collaboration" },
  { value: "sponsorship", label: "Sponsorship" },
  { value: "media", label: "Media / Press" },
  { value: "volunteer", label: "Volunteer Support" },
  { value: "venue", label: "Venue / Business Inquiry" },
];

interface ContactFormProps {
  contactEmail?: string;
  phone?: string;
  socialInstagram?: string;
  socialWhatsapp?: string;
  location?: string;
}

export function ContactForm({
  contactEmail = "velvt.in@gmail.com",
  phone = "+91 93951 78940",
  socialInstagram = "https://www.instagram.com/velvt.in",
  socialWhatsapp = "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8",
  location = "Silchar, Assam, India",
}: ContactFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const cleanPhone = phone.replace(/\s+/g, "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await submitContactInquiry(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrors(result.errors || {});
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(200,16,46,0.2)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-dim border border-red-glow flex items-center justify-center shadow-[0_0_20px_rgba(200,16,46,0.35)]">
            <span className="text-2xl text-white">✓</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Message Sent
          </h1>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <p className="text-sm text-muted leading-relaxed">
            Thank you for reaching out to VELVT. Our team will review your message and reply promptly.
          </p>
          <div className="pt-2">
            <Button href="/" variant="primary">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
                Get In Touch.
              </h1>
              <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e]" />
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                Whether for collaboration, sponsorship, press access, venue partnerships, or general questions — we would love to hear from you.
              </p>
            </div>

            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Anti-spam honeypot */}
                <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div>
                  <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-primary mt-1">{errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
                  />
                  {errors.email && (
                    <p className="text-xs text-primary mt-1">{errors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue="general"
                    className="w-full px-5 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-primary mt-1">{errors.category[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-primary mt-1">{errors.message[0]}</p>
                  )}
                </div>

                {errors._form && (
                  <p className="text-xs text-primary">{errors._form[0]}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Details & Info */}
          <div className="space-y-8 lg:pt-20">
            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 space-y-8 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                  Event Organization
                </span>
                <p className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
                  VELVT<span className="text-primary">.in</span>
                </p>
                <p className="font-mono text-xs text-muted mt-1 uppercase tracking-wider">
                  It starts as a thought, ends as a memory.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {location}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  Phone &amp; Direct WhatsApp
                </p>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-mono text-lg text-primary hover:text-white transition-colors block"
                >
                  {phone}
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  Email
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-mono text-lg text-primary hover:text-white transition-colors block"
                >
                  {contactEmail}
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  Official Channels &amp; Community
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:border-red hover:bg-red-dim transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-red">📷</span> Instagram @velvt.in
                    </span>
                    <span className="text-muted group-hover:text-white">↗</span>
                  </a>
                  <a
                    href={socialWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:border-emerald-500 hover:bg-emerald-950/40 transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">💬</span> VELVT Updates Group
                    </span>
                    <span className="text-muted group-hover:text-white">↗</span>
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-[16px] border border-white/10 bg-white/[0.03] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-xs font-mono uppercase tracking-wider text-white">
                    General Inquiries
                  </p>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Inquiries are reviewed regularly. For immediate ticketing assistance on event days, please reach out to our WhatsApp concierge or on-site helpdesk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
