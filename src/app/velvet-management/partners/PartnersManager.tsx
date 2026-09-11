"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPartner,
  togglePartnerActive,
  deletePartner,
  createPressMention,
  togglePressPublish,
  deletePressMention,
} from "@/app/actions";

interface PartnersManagerProps {
  partners: any[];
  pressMentions: any[];
  events: any[];
}

export function PartnersManager({ partners, pressMentions, events }: PartnersManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"partners" | "press">("partners");
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showPressModal, setShowPressModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Partner Form State
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    logo: "",
    website: "",
    type: "partner",
    eventId: "",
    isActive: true,
  });

  // Press Form State
  const [pressForm, setPressForm] = useState({
    title: "",
    publication: "",
    url: "",
    excerpt: "",
    isPublished: true,
  });

  async function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("name", partnerForm.name);
    fd.append("logo", partnerForm.logo);
    fd.append("website", partnerForm.website);
    fd.append("type", partnerForm.type);
    fd.append("eventId", partnerForm.eventId);
    fd.append("isActive", String(partnerForm.isActive));

    const res = await createPartner(fd);
    setLoading(false);

    if (res.success) {
      setShowPartnerModal(false);
      setPartnerForm({ name: "", logo: "", website: "", type: "partner", eventId: "", isActive: true });
      router.refresh();
    } else {
      alert(res.error || "Failed to create partner");
    }
  }

  async function handleCreatePress(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("title", pressForm.title);
    fd.append("publication", pressForm.publication);
    fd.append("url", pressForm.url);
    fd.append("excerpt", pressForm.excerpt);
    fd.append("isPublished", String(pressForm.isPublished));

    const res = await createPressMention(fd);
    setLoading(false);

    if (res.success) {
      setShowPressModal(false);
      setPressForm({ title: "", publication: "", url: "", excerpt: "", isPublished: true });
      router.refresh();
    } else {
      alert(res.error || "Failed to create press mention");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
            Ecosystem &amp; Media
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Partners &amp; Press
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage institutional collaborators, sponsors, and editorial media coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "partners" ? (
            <button
              onClick={() => setShowPartnerModal(true)}
              className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full bg-primary text-white font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.4)]"
            >
              + Add Partner
            </button>
          ) : (
            <button
              onClick={() => setShowPressModal(true)}
              className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full bg-primary text-white font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.4)]"
            >
              + Add Press Mention
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/[0.08] text-xs font-mono">
        <button
          onClick={() => setActiveTab("partners")}
          className={`pb-3 uppercase tracking-wider font-bold transition-colors cursor-pointer ${activeTab === "partners" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}
        >
          Partners &amp; Sponsors ({partners.length})
        </button>
        <button
          onClick={() => setActiveTab("press")}
          className={`pb-3 uppercase tracking-wider font-bold transition-colors cursor-pointer ${activeTab === "press" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}
        >
          Press Mentions ({pressMentions.length})
        </button>
      </div>

      {/* Partners Tab */}
      {activeTab === "partners" && (
        <div className="grid gap-4">
          {partners.length === 0 ? (
            <div className="p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl font-mono text-xs text-muted">
              No partners registered yet.
            </div>
          ) : (
            partners.map((p) => (
              <div
                key={p.id}
                className="p-5 border border-white/10 bg-white/[0.03] rounded-2xl flex items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="w-8 h-8 rounded bg-white/[0.05] flex items-center justify-center font-bold text-white text-xs">
                      {p.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] uppercase text-muted-foreground">
                        {p.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${p.isActive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-red-950/40 text-red-400 border border-red-900/40"}`}>
                        {p.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    {p.website && <a href={p.website} target="_blank" className="text-[11px] text-muted-foreground hover:text-primary font-mono">{p.website}</a>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      await togglePartnerActive(p.id, !p.isActive);
                      setLoading(false);
                      router.refresh();
                    }}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-white/10 text-muted-foreground hover:text-white cursor-pointer"
                  >
                    {p.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this partner?")) return;
                      setLoading(true);
                      await deletePartner(p.id);
                      setLoading(false);
                      router.refresh();
                    }}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Press Tab */}
      {activeTab === "press" && (
        <div className="grid gap-4">
          {pressMentions.length === 0 ? (
            <div className="p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl font-mono text-xs text-muted">
              No press mentions found.
            </div>
          ) : (
            pressMentions.map((pm) => (
              <div
                key={pm.id}
                className="p-5 border border-white/10 bg-white/[0.03] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white text-base">{pm.title}</span>
                    <span className="text-primary font-semibold">— {pm.publication}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${pm.isPublished ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-red-950/40 text-red-400 border border-red-900/40"}`}>
                      {pm.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  {pm.excerpt && <p className="text-xs text-muted-foreground max-w-xl line-clamp-1">{pm.excerpt}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      await togglePressPublish(pm.id, !pm.isPublished);
                      setLoading(false);
                      router.refresh();
                    }}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-white/10 text-muted-foreground hover:text-white cursor-pointer"
                  >
                    {pm.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this press mention?")) return;
                      setLoading(true);
                      await deletePressMention(pm.id);
                      setLoading(false);
                      router.refresh();
                    }}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-display text-2xl text-white font-bold uppercase tracking-wider">Add Partner / Sponsor</h3>
              <button onClick={() => setShowPartnerModal(false)} className="text-muted hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. Pioneer Audio"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Logo URL</label>
                <input
                  type="text"
                  value={partnerForm.logo}
                  onChange={(e) => setPartnerForm({ ...partnerForm, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Website</label>
                <input
                  type="url"
                  value={partnerForm.website}
                  onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                  placeholder="https://pioneer.com"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Type</label>
                  <select
                    value={partnerForm.type}
                    onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                  >
                    <option value="partner">Partner</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="media">Media Partner</option>
                  </select>
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={partnerForm.isActive}
                      onChange={(e) => setPartnerForm({ ...partnerForm, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold rounded bg-primary text-white hover:bg-red-700"
                >
                  {loading ? "Adding..." : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Press Modal */}
      {showPressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-display text-2xl text-white font-bold uppercase tracking-wider">Add Press Mention</h3>
              <button onClick={() => setShowPressModal(false)} className="text-muted hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreatePress} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={pressForm.title}
                  onChange={(e) => setPressForm({ ...pressForm, title: e.target.value })}
                  placeholder="e.g. VELVT Redefines Experiential Nightlife"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Publication Name *</label>
                <input
                  type="text"
                  required
                  value={pressForm.publication}
                  onChange={(e) => setPressForm({ ...pressForm, publication: e.target.value })}
                  placeholder="e.g. Rolling Stone India"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Article URL</label>
                <input
                  type="url"
                  value={pressForm.url}
                  onChange={(e) => setPressForm({ ...pressForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={pressForm.excerpt}
                  onChange={(e) => setPressForm({ ...pressForm, excerpt: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={pressForm.isPublished}
                    onChange={(e) => setPressForm({ ...pressForm, isPublished: e.target.checked })}
                  />
                  Publish to Press page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPressModal(false)}
                  className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold rounded bg-primary text-white hover:bg-red-700"
                >
                  {loading ? "Adding..." : "Add Press Mention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
