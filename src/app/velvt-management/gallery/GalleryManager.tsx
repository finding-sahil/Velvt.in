"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createGalleryItem,
  toggleGalleryPublish,
  deleteGalleryItem,
} from "@/app/actions";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface GalleryManagerProps {
  items: any[];
  events: any[];
}

export function GalleryManager({ items, events }: GalleryManagerProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    caption: "",
    type: "image",
    year: new Date().getFullYear(),
    eventId: "",
    displayOrder: 0,
    isPublished: true,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("url", formData.url);
    fd.append("caption", formData.caption);
    fd.append("type", formData.type);
    fd.append("year", String(formData.year));
    fd.append("eventId", formData.eventId);
    fd.append("displayOrder", String(formData.displayOrder));
    fd.append("isPublished", String(formData.isPublished));

    const res = await createGalleryItem(fd);
    setLoading(false);

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        url: "",
        caption: "",
        type: "image",
        year: new Date().getFullYear(),
        eventId: "",
        displayOrder: 0,
        isPublished: true,
      });
      router.refresh();
    } else {
      alert(res.error || "Failed to add media item");
    }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    setLoading(true);
    await toggleGalleryPublish(id, !current);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    setLoading(true);
    await deleteGalleryItem(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
            Visual Documentation
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Gallery &amp; Media Archive
          </h1>
          <p className="text-xs text-muted mt-1">
            Curate photography, video recordings, and event highlights for public display.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full bg-primary text-white font-bold hover:bg-red-700 transition-colors cursor-pointer self-start sm:self-auto shadow-[0_0_15px_rgba(200,16,46,0.4)]"
        >
          + Add Media Item
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl font-mono text-xs text-muted">
            No gallery items found. Click &quot;+ Add Media Item&quot; to upload or link event photography.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 bg-white/[0.03] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors"
            >
              <div className="aspect-video relative bg-black/60 overflow-hidden">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.caption || "Gallery"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs">
                    No Preview
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${item.isPublished ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40" : "bg-red-950/80 text-red-400 border border-red-900/40"}`}>
                    {item.isPublished ? "Published" : "Hidden"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 text-xs font-mono">
                <p className="text-white font-medium line-clamp-1">{item.caption || "Untitled Media"}</p>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Year: {item.year || "—"}</span>
                  <span>{item.event?.name || "General"}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleTogglePublish(item.id, item.isPublished)}
                    className="text-[11px] text-muted-foreground hover:text-white cursor-pointer"
                  >
                    {item.isPublished ? "Hide from Gallery" : "Publish to Gallery"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-display text-2xl text-white font-bold uppercase tracking-wider">Add Media Item</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <ImageUploader
                value={formData.url}
                onChange={(url) => setFormData({ ...formData, url })}
                label="Image / Media Artwork"
                recommendedText="Upload event photography (JPG, PNG, WebP up to 8MB)"
                aspectRatio="auto"
              />

              <div>
                <label className="block text-muted-foreground mb-1">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g. Stage lighting installation at Velvt Curse"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Associated Event</label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  >
                    <option value="">General Archive</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || new Date().getFullYear() })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  Publish Immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold rounded bg-primary text-white hover:bg-red-700"
                >
                  {loading ? "Adding..." : "Add to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
