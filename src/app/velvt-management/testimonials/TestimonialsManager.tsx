"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialApproval,
} from "@/app/actions";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company?: string | null;
  avatarUrl?: string | null;
  category: string;
  rating: number;
  displayOrder: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date | string;
}

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    quote: "",
    authorName: "",
    authorRole: "",
    company: "",
    avatarUrl: "",
    category: "volunteer",
    rating: 5,
    displayOrder: 0,
    isApproved: true,
    isFeatured: false,
  });

  const filtered = items.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  function openCreate() {
    setEditingItem(null);
    setFormData({
      quote: "",
      authorName: "",
      authorRole: "",
      company: "",
      avatarUrl: "",
      category: categoryFilter === "sponsor" ? "sponsor" : "volunteer",
      rating: 5,
      displayOrder: items.length + 1,
      isApproved: true,
      isFeatured: false,
    });
    setShowModal(true);
  }

  function openEdit(item: Testimonial) {
    setEditingItem(item);
    setFormData({
      quote: item.quote,
      authorName: item.authorName,
      authorRole: item.authorRole,
      company: item.company || "",
      avatarUrl: item.avatarUrl || "",
      category: item.category,
      rating: item.rating,
      displayOrder: item.displayOrder,
      isApproved: item.isApproved,
      isFeatured: item.isFeatured,
    });
    setShowModal(true);
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("purpose", "testimonial-avatar");
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: json.url }));
        setToast({ message: "Photo uploaded", type: "success" });
      } else {
        setToast({ message: json.error || "Upload failed", type: "error" });
      }
    } catch (e: any) {
      setToast({ message: "Upload error: " + e.message, type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("quote", formData.quote);
    fd.append("authorName", formData.authorName);
    fd.append("authorRole", formData.authorRole);
    fd.append("company", formData.company);
    fd.append("avatarUrl", formData.avatarUrl);
    fd.append("category", formData.category);
    fd.append("rating", String(formData.rating));
    fd.append("displayOrder", String(formData.displayOrder));
    fd.append("isApproved", String(formData.isApproved));
    fd.append("isFeatured", String(formData.isFeatured));

    if (editingItem) {
      const res = await updateTestimonial(editingItem.id, fd);
      if (res.success && res.testimonial) {
        setItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? res.testimonial : it))
        );
        setShowModal(false);
        setToast({ message: "Testimonial updated", type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to update", type: "error" });
      }
    } else {
      const res = await createTestimonial(fd);
      if (res.success && res.testimonial) {
        setItems((prev) => [...prev, res.testimonial]);
        setShowModal(false);
        setToast({ message: "Testimonial created", type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to create", type: "error" });
      }
    }
    setLoading(false);
  }

  async function handleToggleApproval(id: string) {
    const res = await toggleTestimonialApproval(id);
    if (res.success) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isApproved: res.isApproved! } : it))
      );
      setToast({ message: "Approval status updated", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to toggle", type: "error" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const res = await deleteTestimonial(id);
    if (res.success) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      setToast({ message: "Testimonial deleted", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to delete", type: "error" });
    }
  }

  return (
    <div className="space-y-6">
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono uppercase">
          {[
            { id: "all", label: `All (${items.length})` },
            { id: "volunteer", label: `Volunteer Crew (${items.filter((i) => i.category === "volunteer").length})` },
            { id: "sponsor", label: `Sponsors & Partners (${items.filter((i) => i.category === "sponsor").length})` },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3.5 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === c.id
                  ? "bg-red text-white font-bold"
                  : "bg-white/[0.04] text-g5 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>+ Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.02] text-g5 font-mono text-xs">
          No testimonials found under this category. Click &ldquo;+ Add Testimonial&rdquo; to add one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      item.category === "sponsor"
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        : "bg-red/15 text-red border border-red/30"
                    }`}
                  >
                    {item.category}
                  </span>

                  <button
                    onClick={() => handleToggleApproval(item.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border cursor-pointer ${
                      item.isApproved
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {item.isApproved ? "Approved ✓" : "Hidden"}
                  </button>
                </div>

                <p className="font-display text-base text-white italic line-clamp-4 leading-snug">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-white/15"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-display font-bold text-white text-sm">
                      {item.authorName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm uppercase text-white truncate">
                      {item.authorName}
                    </h4>
                    <p className="text-[10px] font-mono text-g5 truncate">
                      {item.authorRole} {item.company ? `• ${item.company}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(item)}
                    className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/30 text-xs font-mono text-g5 hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2.5 py-1 rounded-lg border border-red/20 text-xs font-mono text-red hover:bg-red/10 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0a0a0d] space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                {editingItem ? "Edit Testimonial" : "New Testimonial"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-g5 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none"
                  >
                    <option value="volunteer">Volunteer / Crew</option>
                    <option value="sponsor">Sponsor / Brand Partner</option>
                    <option value="general">General Community</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Author Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="e.g. Masroor Ahmed"
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:border-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Author Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    placeholder="e.g. Head of Operations"
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:border-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Red Bull, Silchar Live"
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:border-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-g5 block mb-1">
                    Author Photo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl border border-white/15 bg-white/[0.04] text-xs font-mono text-white hover:border-red cursor-pointer whitespace-nowrap">
                      {uploading ? "..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAvatarUpload(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-g5 block mb-1">
                  Quote / Testimonial *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Share their authentic experience with VELVT..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs leading-relaxed focus:border-red focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="accent-red"
                  />
                  <span>Approved &amp; Visible on Public Site</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-red"
                  />
                  <span>Featured Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-full border border-white/15 text-xs font-mono text-g5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-full bg-red hover:bg-red-glow text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_var(--red-glow)]"
                >
                  {loading ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
