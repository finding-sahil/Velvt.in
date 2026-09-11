"use client";

import { useState, useEffect } from "react";
import { submitVolunteerApplication } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export default function VolunteerRegisterPage() {
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Fetch events and roles
    fetch("/api/public/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => {});

    fetch("/api/public/roles")
      .then((r) => r.json())
      .then((data) => setRoles(data.roles || []))
      .catch(() => {});
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "volunteer-badge");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPhotoUrl(data.url);
      } else {
        alert(data.error || "Failed to upload photo");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("consentGiven", formData.get("consentGiven") ? "true" : "false");
    if (photoUrl) {
      formData.set("photo", photoUrl);
    }

    // Serialize structured social links
    const instagram = (formData.get("instagram") as string || "").trim();
    const linkedin = (formData.get("linkedin") as string || "").trim();
    const portfolio = (formData.get("portfolio") as string || "").trim();
    const showWhatsApp = formData.get("showWhatsApp") === "on";
    const phone = (formData.get("phone") as string || "").trim();

    const socialObj: Record<string, string> = {};
    if (instagram) socialObj.instagram = instagram;
    if (linkedin) socialObj.linkedin = linkedin;
    if (portfolio) socialObj.portfolio = portfolio;
    if (showWhatsApp && phone) socialObj.phone = phone;

    if (Object.keys(socialObj).length > 0) {
      formData.set("socialLink", JSON.stringify(socialObj));
    }

    const result = await submitVolunteerApplication(formData);

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
        <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(200,16,46,0.18)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-dim border border-red-glow flex items-center justify-center shadow-[0_0_20px_rgba(200,16,46,0.35)]">
            <span className="text-2xl text-white">✓</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Application Submitted
          </h1>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <p className="text-sm text-muted leading-relaxed">
            Thank you for your interest in volunteering with VELVT. Our crew directors will review your submission. You will receive an official verifiable Volunteer ID upon confirmation.
          </p>
          <div className="pt-4">
            <Button href="/volunteers" variant="primary">
              Back to Volunteers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container-narrow">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-4">
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight">
            Volunteer With VELVT
          </h1>
          <div className="w-14 h-0.5 bg-primary shadow-[0_0_14px_#c8102e] mx-auto" />
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Step behind the curtain and help engineer the atmosphere. Fill out the application below to join our verified roster.
          </p>
        </div>

        <div className="max-w-xl mx-auto rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anti-spam honeypot */}
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <FormField
              label="Full Name"
              name="fullName"
              required
              error={errors.fullName}
            />
            <FormField
              label="Email Address"
              name="email"
              type="email"
              required
              error={errors.email}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              required
              error={errors.phone}
            />
            <FormField
              label="City"
              name="city"
              required
              error={errors.city}
            />

            {/* Event Selection */}
            <div>
              <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                Event <span className="text-primary">*</span>
              </label>
              <select
                name="eventId"
                required
                className="w-full px-5 py-3.5 bg-black/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              {errors.eventId && (
                <p className="text-xs text-primary mt-1">{errors.eventId[0]}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                Preferred Role <span className="text-primary">*</span>
              </label>
              <select
                name="preferredRole"
                required
                className="w-full px-5 py-3.5 bg-black/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.preferredRole && (
                <p className="text-xs text-primary mt-1">
                  {errors.preferredRole[0]}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                Relevant Experience
              </label>
              <textarea
                name="experience"
                rows={3}
                className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all resize-none"
                placeholder="Tell us about any relevant production, stage, or guest relations experience..."
              />
            </div>

            {/* Social & Professional Links */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-white">
                  Social Profiles &amp; Networking (Optional)
                </label>
                <p className="text-[11px] text-muted leading-relaxed mt-0.5">
                  Your social links and WhatsApp button will be embedded into your verified public volunteer credential card.
                </p>
              </div>

              <div className="space-y-3">
                <FormField
                  label="Instagram Profile / Handle"
                  name="instagram"
                  placeholder="@username or https://instagram.com/..."
                />
                <FormField
                  label="LinkedIn Profile URL"
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                />
                <FormField
                  label="Portfolio / Website URL"
                  name="portfolio"
                  type="url"
                  placeholder="https://..."
                />

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showWhatsApp"
                    defaultChecked
                    className="accent-[#c8102e]"
                  />
                  <span className="text-xs text-muted">
                    Display my WhatsApp contact button on my verified digital volunteer card
                  </span>
                </label>
              </div>
            </div>

            {/* Optional Photo Upload */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted">
                Badge Headshot / Photo (Optional)
              </label>
              <p className="text-[11px] text-muted leading-relaxed">
                Upload a photo to be printed on your official digital volunteer credential badge.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Uploaded Headshot"
                    className="w-12 h-12 rounded-xl object-cover border border-primary shadow-md"
                  />
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white cursor-pointer transition-colors text-xs font-mono">
                  <span>📷</span> {uploading ? "Uploading..." : photoUrl ? "Change Photo" : "Upload Headshot"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>

            {/* Consent */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentGiven"
                  className="mt-1 accent-[#c8102e]"
                  required
                />
                <span className="text-xs text-muted leading-relaxed">
                  I agree to share my information with the VELVT production team for
                  volunteer coordination. Personal contact details will remain confidential.
                </span>
              </label>
              {errors.consentGiven && (
                <p className="text-xs text-primary mt-1">
                  {errors.consentGiven[0]}
                </p>
              )}
            </div>

            {errors._form && (
              <p className="text-sm text-white p-3 border border-red-glow rounded-xl bg-red-dim">
                {errors._form[0]}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" variant="primary" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-5 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all"
      />
      {error && <p className="text-xs text-primary mt-1">{error[0]}</p>}
    </div>
  );
}
