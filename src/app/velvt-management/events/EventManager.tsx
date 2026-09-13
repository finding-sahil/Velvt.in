"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createEvent,
  updateEvent,
  archiveEvent,
  deleteEvent,
  createTicketType,
  toggleTicketType,
  deleteTicketType,
  createEventFAQ,
  updateEventFAQ,
  deleteEventFAQ,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  clearScheduleItems,
  populateTemplateSchedule,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort, formatPrice } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

interface EventManagerProps {
  events: any[];
}

export function EventManager({ events }: EventManagerProps) {
  const router = useRouter();
  const [eventList, setEventList] = useState(events);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [managingTicketsFor, setManagingTicketsFor] = useState<any | null>(null);
  const [managingScheduleFor, setManagingScheduleFor] = useState<any | null>(null);
  const [editingScheduleItem, setEditingScheduleItem] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    time: "7:00 PM",
    title: "",
    description: "",
    displayOrder: 1,
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [managingFaqsFor, setManagingFaqsFor] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    displayOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    setEventList(events);
    if (managingTicketsFor) {
      const updated = events.find((e) => e.id === managingTicketsFor.id);
      if (updated) {
        setManagingTicketsFor(updated);
      }
    }
    if (managingScheduleFor) {
      const updated = events.find((e) => e.id === managingScheduleFor.id);
      if (updated) {
        setManagingScheduleFor(updated);
      }
    }
    if (managingFaqsFor) {
      const updated = events.find((e) => e.id === managingFaqsFor.id);
      if (updated) {
        setManagingFaqsFor(updated);
      }
    }
  }, [events]);

  // Form states for creating event
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    theme: "",
    coverImage: "",
    dressCode: "",
    ageRestriction: "18+ only. Valid ID required at entry.",
    entryInfo: "Entry is by ticket only. No re-entry allowed.",
    date: "",
    time: "7:00 PM onwards",
    status: "upcoming",
    venueName: "",
    venueCity: "Silchar",
    venueAddress: "Silchar, Assam, India",
    venueMapLink: "",
    venueAccessInfo: "",
    venueParkingInfo: "",
    isFeatured: false,
  });

  // Form states for adding ticket tier
  const [ticketForm, setTicketForm] = useState({
    name: "",
    priceInRupees: 499,
    totalQuantity: 100,
    bookingUrl: "",
    isActive: true,
  });

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append(
      "slug",
      formData.slug ||
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
    );
    fd.append("description", formData.description);
    fd.append("theme", formData.theme);
    fd.append("coverImage", formData.coverImage);
    fd.append("dressCode", formData.dressCode);
    fd.append("ageRestriction", formData.ageRestriction);
    fd.append("entryInfo", formData.entryInfo);
    fd.append("date", formData.date);
    fd.append("time", formData.time);
    fd.append("status", formData.status);
    fd.append("venueName", formData.venueName);
    fd.append("venueCity", formData.venueCity);
    fd.append("venueAddress", formData.venueAddress);
    fd.append("venueMapLink", formData.venueMapLink);
    fd.append("venueAccessInfo", formData.venueAccessInfo);
    fd.append("venueParkingInfo", formData.venueParkingInfo);
    fd.append("isFeatured", String(formData.isFeatured));

    const res = await createEvent(fd);
    setLoading(false);

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        theme: "",
        coverImage: "",
        dressCode: "",
        ageRestriction: "18+ only. Valid ID required at entry.",
        entryInfo: "Entry is by ticket only. No re-entry allowed.",
        date: "",
        time: "7:00 PM onwards",
        status: "upcoming",
        venueName: "",
        venueCity: "Silchar",
        venueAddress: "Silchar, Assam, India",
        venueMapLink: "",
        venueAccessInfo: "",
        venueParkingInfo: "",
        isFeatured: false,
      });
      router.refresh();
    } else {
      setError(res.error || "Failed to create event");
    }
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("name", editingEvent.name);
    fd.append("slug", editingEvent.slug);
    fd.append("description", editingEvent.description);
    fd.append("theme", editingEvent.theme || "");
    fd.append("coverImage", editingEvent.coverImage || "");
    fd.append("dressCode", editingEvent.dressCode || "");
    fd.append("ageRestriction", editingEvent.ageRestriction || "");
    fd.append("entryInfo", editingEvent.entryInfo || "");
    const dateStr =
      editingEvent.date instanceof Date
        ? editingEvent.date.toISOString().split("T")[0]
        : typeof editingEvent.date === "string" && editingEvent.date.includes("T")
        ? editingEvent.date.split("T")[0]
        : editingEvent.date || "";
    fd.append("date", dateStr);
    fd.append("time", editingEvent.time || "");
    fd.append("status", editingEvent.status);
    fd.append("venueName", editingEvent.venue?.name || "");
    fd.append("venueCity", editingEvent.venue?.city || "Silchar");
    fd.append("venueAddress", editingEvent.venue?.address || "");
    fd.append("venueMapLink", editingEvent.venue?.mapLink || "");
    fd.append("venueAccessInfo", editingEvent.venue?.accessInfo || "");
    fd.append("venueParkingInfo", editingEvent.venue?.parkingInfo || "");
    fd.append("isFeatured", String(editingEvent.isFeatured));

    const res = await updateEvent(editingEvent.id, fd);
    setLoading(false);

    if (res.success) {
      setEditingEvent(null);
      router.refresh();
    } else {
      setError(res.error || "Failed to update event");
    }
  }

  async function handleArchive(eventId: string) {
    // Instant optimistic update (0ms)
    setEventList((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "archived" } : e))
    );
    setToast({ message: "Event marked as archived", type: "info" });

    try {
      const res = await archiveEvent(eventId);
      if (!res.success) {
        setToast({ message: res.error || "Failed to archive event", type: "error" });
        setEventList(events);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to archive event", type: "error" });
      setEventList(events);
    }
  }

  async function handleDelete(eventId: string) {
    // Instant optimistic deletion from UI (0ms)
    const prevEvents = eventList;
    setEventList((prev) => prev.filter((e) => e.id !== eventId));

    // Bottom notification overlay (no popups)
    setToast({
      message: "Event and ticket tiers deleted",
      type: "success",
      actionLabel: "Undo",
      onAction: () => {
        setEventList(prevEvents);
      },
    });

    try {
      const res = await deleteEvent(eventId);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete event", type: "error" });
        setEventList(prevEvents); // revert on failure
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete event", type: "error" });
      setEventList(prevEvents);
    }
  }

  async function handleAddTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!managingTicketsFor) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("name", ticketForm.name);
    fd.append("eventId", managingTicketsFor.id);
    fd.append("priceInPaise", String(Math.round(ticketForm.priceInRupees * 100)));
    fd.append("totalQuantity", String(ticketForm.totalQuantity));
    fd.append("bookingUrl", ticketForm.bookingUrl);
    fd.append("isActive", String(ticketForm.isActive));

    const res = await createTicketType(fd);
    setLoading(false);

    if (res.success && (res as any).ticket) {
      const newTicket = (res as any).ticket;
      setTicketForm({
        name: "",
        priceInRupees: 499,
        totalQuantity: 100,
        bookingUrl: "",
        isActive: true,
      });
      // Instant optimistic UI update
      setManagingTicketsFor((prev: any) =>
        prev
          ? {
              ...prev,
              ticketTypes: [...(prev.ticketTypes || []), newTicket],
            }
          : prev
      );
      setEventList((prev) =>
        prev.map((e) =>
          e.id === managingTicketsFor.id
            ? {
                ...e,
                ticketTypes: [...(e.ticketTypes || []), newTicket],
              }
            : e
        )
      );
      setToast({ message: `Ticket tier "${newTicket.name}" added`, type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to add ticket tier", type: "error" });
    }
  }

  async function handleToggleTicket(ticketId: string, current: boolean) {
    // Instant optimistic UI update
    setManagingTicketsFor((prev: any) =>
      prev
        ? {
            ...prev,
            ticketTypes: (prev.ticketTypes || []).map((t: any) =>
              t.id === ticketId ? { ...t, isActive: !current } : t
            ),
          }
        : prev
    );
    setEventList((prev) =>
      prev.map((e) =>
        e.id === managingTicketsFor?.id
          ? {
              ...e,
              ticketTypes: (e.ticketTypes || []).map((t: any) =>
                t.id === ticketId ? { ...t, isActive: !current } : t
              ),
            }
          : e
      )
    );
    setToast({
      message: !current ? "Ticket tier activated" : "Ticket tier disabled",
      type: "info",
    });

    try {
      await toggleTicketType(ticketId, !current);
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update ticket tier", type: "error" });
    }
  }

  async function handleDeleteTicket(ticketId: string) {
    // Instant optimistic UI update (0ms, no popups)
    setManagingTicketsFor((prev: any) =>
      prev
        ? {
            ...prev,
            ticketTypes: (prev.ticketTypes || []).filter((t: any) => t.id !== ticketId),
          }
        : prev
    );
    setEventList((prev) =>
      prev.map((e) =>
        e.id === managingTicketsFor?.id
          ? {
              ...e,
              ticketTypes: (e.ticketTypes || []).filter((t: any) => t.id !== ticketId),
            }
          : e
      )
    );

    setToast({ message: "Ticket tier deleted", type: "success" });

    try {
      const res = await deleteTicketType(ticketId);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete ticket tier", type: "error" });
      }
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete ticket tier", type: "error" });
    }
  }

  // ─── FAQ Handlers ────────────────────────────────────────────────────────────

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!managingFaqsFor) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("question", faqForm.question);
    fd.append("answer", faqForm.answer);
    fd.append("displayOrder", String(faqForm.displayOrder));
    fd.append("eventId", managingFaqsFor.id);

    let res;
    if (editingFaq) {
      res = await updateEventFAQ(editingFaq.id, fd);
    } else {
      res = await createEventFAQ(fd);
    }
    setLoading(false);

    if (res.success && res.faq) {
      const savedFaq = res.faq;
      setManagingFaqsFor((prev: any) => {
        if (!prev) return prev;
        const faqs = prev.faqs || [];
        const updated = editingFaq
          ? faqs.map((f: any) => (f.id === editingFaq.id ? savedFaq : f))
          : [...faqs, savedFaq];
        return { ...prev, faqs: updated };
      });
      setEventList((prev) =>
        prev.map((e) => {
          if (e.id !== managingFaqsFor.id) return e;
          const faqs = e.faqs || [];
          const updated = editingFaq
            ? faqs.map((f: any) => (f.id === editingFaq.id ? savedFaq : f))
            : [...faqs, savedFaq];
          return { ...e, faqs: updated };
        })
      );
      setToast({
        message: editingFaq ? "FAQ updated successfully" : "New FAQ created",
        type: "success",
      });
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", displayOrder: 0 });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to save FAQ", type: "error" });
    }
  }

  async function handleDeleteFaq(faqId: string) {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    setManagingFaqsFor((prev: any) =>
      prev
        ? {
            ...prev,
            faqs: (prev.faqs || []).filter((f: any) => f.id !== faqId),
          }
        : prev
    );
    setEventList((prev) =>
      prev.map((e) =>
        e.id === managingFaqsFor?.id
          ? {
              ...e,
              faqs: (e.faqs || []).filter((f: any) => f.id !== faqId),
            }
          : e
      )
    );
    setToast({ message: "FAQ removed", type: "info" });

    try {
      const res = await deleteEventFAQ(faqId);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete FAQ", type: "error" });
      }
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete FAQ", type: "error" });
    }
  }

  function handleEditFaq(faq: any) {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder || 0,
    });
  }

  // ─── Schedule Handlers ──────────────────────────────────────────────────────
  function handleEditScheduleItem(item: any) {
    setEditingScheduleItem(item);
    setScheduleForm({
      time: item.time,
      title: item.title,
      description: item.description || "",
      displayOrder: item.displayOrder || 1,
    });
  }

  async function handleSaveScheduleItem(e: React.FormEvent) {
    e.preventDefault();
    if (!managingScheduleFor || !scheduleForm.title || !scheduleForm.time) return;
    setScheduleLoading(true);

    try {
      if (editingScheduleItem) {
        const res = await updateScheduleItem(editingScheduleItem.id, {
          time: scheduleForm.time,
          title: scheduleForm.title,
          description: scheduleForm.description,
          displayOrder: scheduleForm.displayOrder,
        });

        if (res.success && res.item) {
          const updatedItem = res.item;
          setManagingScheduleFor((prev: any) => ({
            ...prev,
            scheduleItems: (prev?.scheduleItems || []).map((s: any) =>
              s.id === editingScheduleItem.id ? updatedItem : s
            ),
          }));
          setEventList((prev) =>
            prev.map((ev) =>
              ev.id === managingScheduleFor.id
                ? {
                    ...ev,
                    scheduleItems: (ev.scheduleItems || []).map((s: any) =>
                      s.id === editingScheduleItem.id ? updatedItem : s
                    ),
                  }
                : ev
            )
          );
          setEditingScheduleItem(null);
          setScheduleForm({
            time: "8:00 PM",
            title: "",
            description: "",
            displayOrder: (managingScheduleFor.scheduleItems?.length || 0) + 1,
          });
          setToast({ message: "Schedule item updated", type: "success" });
          router.refresh();
        } else {
          setToast({ message: res.error || "Failed to update schedule item", type: "error" });
        }
      } else {
        const res = await createScheduleItem({
          eventId: managingScheduleFor.id,
          time: scheduleForm.time,
          title: scheduleForm.title,
          description: scheduleForm.description,
          displayOrder: scheduleForm.displayOrder || (managingScheduleFor.scheduleItems?.length || 0) + 1,
        });

        if (res.success && res.item) {
          const newItem = res.item;
          setManagingScheduleFor((prev: any) => ({
            ...prev,
            scheduleItems: [...(prev?.scheduleItems || []), newItem],
          }));
          setEventList((prev) =>
            prev.map((ev) =>
              ev.id === managingScheduleFor.id
                ? {
                    ...ev,
                    scheduleItems: [...(ev.scheduleItems || []), newItem],
                  }
                : ev
            )
          );
          setScheduleForm({
            time: "8:00 PM",
            title: "",
            description: "",
            displayOrder: (managingScheduleFor.scheduleItems?.length || 0) + 2,
          });
          setToast({ message: "Schedule item added to timeline", type: "success" });
          router.refresh();
        } else {
          setToast({ message: res.error || "Failed to add schedule item", type: "error" });
        }
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Error saving schedule item", type: "error" });
    } finally {
      setScheduleLoading(false);
    }
  }

  async function handleDeleteScheduleItem(itemId: string) {
    setScheduleLoading(true);
    try {
      const res = await deleteScheduleItem(itemId);
      if (res.success) {
        setManagingScheduleFor((prev: any) => ({
          ...prev,
          scheduleItems: (prev?.scheduleItems || []).filter((s: any) => s.id !== itemId),
        }));
        setToast({ message: "Schedule item removed", type: "info" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to delete schedule item", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Error deleting item", type: "error" });
    } finally {
      setScheduleLoading(false);
    }
  }

  async function handleClearSchedule(eventId: string) {
    if (!window.confirm("Set schedule to 'Announcing Soon'? This will clear current timeline items.")) return;
    setScheduleLoading(true);
    try {
      const res = await clearScheduleItems(eventId);
      if (res.success) {
        setManagingScheduleFor((prev: any) => ({ ...prev, scheduleItems: [] }));
        setToast({ message: "Schedule set to 'Announcing Soon'", type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to clear schedule", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Error", type: "error" });
    } finally {
      setScheduleLoading(false);
    }
  }

  async function handleLoadTemplateSchedule(eventId: string) {
    setScheduleLoading(true);
    try {
      const res = await populateTemplateSchedule(eventId);
      if (res.success) {
        setToast({ message: "Loaded default festival schedule", type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to load template", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Error", type: "error" });
    } finally {
      setScheduleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Production Management
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Events &amp; Ticket Tiers
          </h1>
          <p className="text-xs text-g5 mt-1">
            Create nocturnal experiences, upload event poster art, manage ticket tiers, and set event statuses.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full bg-red text-white font-bold hover:bg-red/80 transition-all cursor-pointer self-start sm:self-auto shadow-[0_0_20px_rgba(200,16,46,0.4)]"
        >
          + Create New Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid gap-5">
        {eventList.length === 0 ? (
          <div className="p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl">
            <p className="text-g5 text-sm font-mono">
              No events found. Click &quot;+ Create New Event&quot; to begin.
            </p>
          </div>
        ) : (
          eventList.map((event) => (
            <div
              key={event.id}
              className="border border-white/10 bg-white/[0.03] p-5 sm:p-6 rounded-2xl space-y-5 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  {/* Event Poster Thumbnail with Quick Upload/Change */}
                  {event.coverImage ? (
                    <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border border-white/15 bg-black flex-shrink-0 group shadow-lg">
                      <img
                        src={event.coverImage}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingEvent(event)}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-mono text-white transition-opacity uppercase tracking-wider cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="w-16 sm:w-20 aspect-[3/4] rounded-xl border-2 border-dashed border-white/15 hover:border-red/60 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center text-center p-1.5 transition-all flex-shrink-0 cursor-pointer group"
                      title="Upload Event Poster"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">
                        📸
                      </span>
                      <span className="text-[8px] font-mono text-g5 group-hover:text-red mt-1 uppercase tracking-tight">
                        + Poster
                      </span>
                    </button>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={event.status} />
                      {event.isFeatured && (
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-dim text-red border border-red-glow">
                          Featured
                        </span>
                      )}
                      {event.theme && (
                        <span className="text-[10px] font-mono text-g5 uppercase tracking-wider">
                          • {event.theme}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wide">
                      {event.name}
                    </h2>
                    <p className="text-xs text-g5 max-w-2xl leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-white/15 bg-white/[0.04] text-g5 hover:text-white transition-colors"
                  >
                    View Live ↗
                  </Link>
                  <button
                    onClick={() => setManagingTicketsFor(event)}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-red-glow bg-red-dim text-white hover:bg-red/20 transition-colors cursor-pointer"
                  >
                    Tickets ({event.ticketTypes?.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      setManagingScheduleFor(event);
                      setEditingScheduleItem(null);
                      setScheduleForm({
                        time: "7:00 PM",
                        title: "",
                        description: "",
                        displayOrder: (event.scheduleItems?.length || 0) + 1,
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    Schedule ({event.scheduleItems?.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      setManagingFaqsFor(event);
                      setEditingFaq(null);
                      setFaqForm({
                        question: "",
                        answer: "",
                        displayOrder: (event.faqs?.length || 0) + 1,
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    FAQs ({event.faqs?.length || 0})
                  </button>
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-white/15 bg-white/[0.05] text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Edit / Details
                  </button>
                  {event.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(event.id)}
                      className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid sm:grid-cols-5 gap-4 pt-4 border-t border-white/[0.06] text-xs font-mono">
                <div>
                  <span className="text-g5 block text-[10px] uppercase">
                    Date &amp; Time
                  </span>
                  <p className="text-white mt-0.5">
                    {formatDateShort(event.date)} • {event.time || "TBA"}
                  </p>
                </div>
                <div>
                  <span className="text-g5 block text-[10px] uppercase">
                    Venue &amp; City
                  </span>
                  <p className="text-white mt-0.5 truncate">
                    {event.venue?.name || "TBA"} ({event.venue?.city || "Silchar"})
                  </p>
                </div>
                <div>
                  <span className="text-g5 block text-[10px] uppercase">
                    Tickets &amp; Passes
                  </span>
                  <p className="text-white mt-0.5">
                    {event.ticketTypes?.length || 0} active tiers
                  </p>
                </div>
                <div>
                  <span className="text-g5 block text-[10px] uppercase">
                    Timeline Slots
                  </span>
                  <p className="text-white mt-0.5">
                    {event.scheduleItems?.length ? `${event.scheduleItems.length} slots` : "Announcing Soon"}
                  </p>
                </div>
                <div>
                  <span className="text-g5 block text-[10px] uppercase">
                    Visual Archive
                  </span>
                  <p className="text-white mt-0.5">
                    {event._count?.galleryItems ? `${event._count.galleryItems} photos` : event.coverImage ? "✓ Cover uploaded" : "No media"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
                Create New Event
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-g5 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-xs text-red font-mono bg-red-dim border border-red-glow p-2.5 rounded-lg">
                ✕ {error}
              </p>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-mono">
              {/* Event Poster Upload Component */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                <ImageUploader
                  value={formData.coverImage}
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                  label="Event Poster / Cover Artwork"
                  recommendedText="Upload portrait artwork (PNG, JPG, WebP up to 8MB)"
                  aspectRatio="poster"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Event Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VELVT CURSE 3.O"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. velvt-curse-3-o (auto-generated if blank)"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the experience..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-g5 uppercase">Theme / Concept</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: "Cinematic Halloween Experience" })}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-g4 hover:text-white"
                    >
                      Halloween
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: "To Be Announced" })}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      Announcing Soon
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g. Gothic Masquerade or Dark Immersive Set"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Doors / Event Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 7:00 PM onwards"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Venue Name</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="e.g. Biva Hotel or Venue To Be Announced"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">City</label>
                  <input
                    type="text"
                    value={formData.venueCity}
                    onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                    placeholder="Silchar"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Full Venue Address</label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  placeholder="e.g. Club Road, Silchar, Assam, India"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Google Maps Link</label>
                  <input
                    type="url"
                    value={formData.venueMapLink}
                    onChange={(e) => setFormData({ ...formData, venueMapLink: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Age Restriction</label>
                  <input
                    type="text"
                    value={formData.ageRestriction}
                    onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value })}
                    placeholder="18+ only. Valid ID required."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-g5 uppercase">Masquerade &amp; Dress Code</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dressCode: "Dark formal, gothic, masquerade costumes encouraged." })}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-g4 hover:text-white"
                    >
                      Gothic
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dressCode: "Dress code announcing soon." })}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      Announcing Soon
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="e.g. Dark formal, masquerade masks encouraged"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Entry Guidelines / Info</label>
                <textarea
                  rows={2}
                  value={formData.entryInfo}
                  onChange={(e) => setFormData({ ...formData, entryInfo: e.target.value })}
                  placeholder="e.g. Entry is by ticket only. Gates open at 7:00 PM. No re-entry allowed."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Venue Access / Directions</label>
                  <input
                    type="text"
                    value={formData.venueAccessInfo}
                    onChange={(e) => setFormData({ ...formData, venueAccessInfo: e.target.value })}
                    placeholder="Directions will be shared prior to event"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Parking Information</label>
                  <input
                    type="text"
                    value={formData.venueParkingInfo}
                    onChange={(e) => setFormData({ ...formData, venueParkingInfo: e.target.value })}
                    placeholder="Valet and on-site parking available"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-white/10 bg-black/50"
                    />
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-red text-white hover:bg-red/80 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.4)]"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal with Image Upload */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
                Edit Event &amp; Artwork
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-g5 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-xs text-red font-mono bg-red-dim border border-red-glow p-2.5 rounded-lg">
                ✕ {error}
              </p>
            )}

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs font-mono">
              {/* Event Poster Upload */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                <ImageUploader
                  value={editingEvent.coverImage || ""}
                  onChange={(url) => setEditingEvent({ ...editingEvent, coverImage: url })}
                  label="Event Poster / Cover Artwork"
                  recommendedText="Upload portrait artwork (PNG, JPG, WebP up to 8MB)"
                  aspectRatio="poster"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Event Name *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-g5 uppercase">Theme / Concept</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, theme: "Cinematic Halloween Experience" })}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-g4 hover:text-white"
                    >
                      Halloween
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, theme: "To Be Announced" })}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      Announcing Soon
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={editingEvent.theme || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, theme: e.target.value })}
                  placeholder="e.g. Gothic Masquerade or Dark Immersive Set"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Date *</label>
                  <input
                    type="date"
                    required
                    value={
                      editingEvent.date
                        ? new Date(editingEvent.date).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Doors / Event Time</label>
                  <input
                    type="text"
                    value={editingEvent.time || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    placeholder="e.g. 7:00 PM onwards"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Venue Name</label>
                  <input
                    type="text"
                    value={editingEvent.venue?.name || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: { ...editingEvent.venue, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Biva Hotel or Venue To Be Announced"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">City</label>
                  <input
                    type="text"
                    value={editingEvent.venue?.city || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: { ...editingEvent.venue, city: e.target.value },
                      })
                    }
                    placeholder="Silchar"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Full Venue Address</label>
                <input
                  type="text"
                  value={editingEvent.venue?.address || ""}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      venue: { ...editingEvent.venue, address: e.target.value },
                    })
                  }
                  placeholder="e.g. Club Road, Silchar, Assam, India"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Google Maps Link</label>
                  <input
                    type="url"
                    value={editingEvent.venue?.mapLink || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: { ...editingEvent.venue, mapLink: e.target.value },
                      })
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Age Restriction</label>
                  <input
                    type="text"
                    value={editingEvent.ageRestriction || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, ageRestriction: e.target.value })
                    }
                    placeholder="18+ only. Valid ID required."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-g5 uppercase">Masquerade &amp; Dress Code</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, dressCode: "Dark formal, gothic, masquerade costumes encouraged." })}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 text-g4 hover:text-white"
                    >
                      Gothic
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, dressCode: "Dress code announcing soon." })}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      Announcing Soon
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={editingEvent.dressCode || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, dressCode: e.target.value })}
                  placeholder="e.g. Dark formal, masquerade masks encouraged"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Entry Guidelines / Info</label>
                <textarea
                  rows={2}
                  value={editingEvent.entryInfo || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, entryInfo: e.target.value })}
                  placeholder="e.g. Entry is by ticket only. Gates open at 7:00 PM. No re-entry allowed."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Venue Access / Directions</label>
                  <input
                    type="text"
                    value={editingEvent.venue?.accessInfo || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: { ...editingEvent.venue, accessInfo: e.target.value },
                      })
                    }
                    placeholder="Directions will be shared prior to event"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Parking Information</label>
                  <input
                    type="text"
                    value={editingEvent.venue?.parkingInfo || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue: { ...editingEvent.venue, parkingInfo: e.target.value },
                      })
                    }
                    placeholder="Valet and on-site parking available"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Status</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editingEvent.isFeatured}
                      onChange={(e) =>
                        setEditingEvent({ ...editingEvent, isFeatured: e.target.checked })
                      }
                      className="rounded border-white/10 bg-black/50"
                    />
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 text-xs rounded bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-red text-white hover:bg-red/80 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.4)]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Management Drawer / Modal */}
      {managingTicketsFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
                  Ticket Tiers — {managingTicketsFor.name}
                </h3>
                <p className="text-[11px] font-mono text-g5 mt-0.5">
                  Manage admission passes, prices, and booking links.
                </p>
              </div>
              <button
                onClick={() => setManagingTicketsFor(null)}
                className="text-g5 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Current Ticket Tiers List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Configured Tiers
              </h4>
              {managingTicketsFor.ticketTypes?.length === 0 ? (
                <p className="text-xs text-g5 font-mono italic">
                  No ticket tiers created for this event yet.
                </p>
              ) : (
                managingTicketsFor.ticketTypes?.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono"
                  >
                    <div>
                      <p className="text-white font-bold">{t.name}</p>
                      <p className="text-g5 text-[11px]">
                        {formatPrice(t.priceInPaise)} • {t.totalQuantity} total qty
                      </p>
                      {t.bookingUrl && (
                        <span className="text-[10px] text-emerald-400">
                          External Booking Configured ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTicket(t.id, t.isActive)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold cursor-pointer ${
                          t.isActive
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                            : "bg-white/[0.05] text-g5"
                        }`}
                      >
                        {t.isActive ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="p-1 text-red hover:underline text-[11px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Tier Form */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                + Add Ticket Tier
              </h4>
              <form onSubmit={handleAddTicket} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Tier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Backstage All Hallows Pass"
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-g5 mb-1 uppercase">Price (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={ticketForm.priceInRupees}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          priceInRupees: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-g5 mb-1 uppercase">Total Quantity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={ticketForm.totalQuantity}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          totalQuantity: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">
                    Direct Booking URL (Optional / External Gateway)
                  </label>
                  <input
                    type="url"
                    placeholder="https://insider.in/event/... or https://bookmyshow.com/..."
                    value={ticketForm.bookingUrl}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, bookingUrl: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                  <p className="text-[10px] text-g5 mt-1">
                    If blank, the public card renders an &quot;Opens Soon&quot; notice safely.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold rounded-full bg-red text-white hover:bg-red/80 cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.4)]"
                  >
                    {loading ? "Adding..." : "Add Tier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Event FAQs Modal */}
      {managingFaqsFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide flex items-center gap-2">
                  <span>Frequently Asked Questions</span>
                  <span className="text-xs text-purple-400 font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/60">
                    {managingFaqsFor.name}
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-g5 mt-0.5">
                  Add, edit, or remove attendee questions displayed on the event page.
                </p>
              </div>
              <button
                onClick={() => {
                  setManagingFaqsFor(null);
                  setEditingFaq(null);
                  setFaqForm({ question: "", answer: "", displayOrder: 0 });
                }}
                className="text-g5 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Existing FAQs list */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center justify-between">
                <span>Configured Questions ({managingFaqsFor.faqs?.length || 0})</span>
                {editingFaq && (
                  <span className="text-[10px] text-amber-400 font-normal">
                    Editing Mode Active
                  </span>
                )}
              </h4>

              {(!managingFaqsFor.faqs || managingFaqsFor.faqs.length === 0) ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-1">
                  <p className="text-xs text-g5 font-mono italic">
                    No FAQs added for this event yet.
                  </p>
                  <p className="text-[10px] text-g5/60 font-mono">
                    Add dress code, entry rules, age limits, parking, and venue questions below.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {managingFaqsFor.faqs.map((faq: any, idx: number) => (
                    <div
                      key={faq.id || idx}
                      className={`p-3.5 rounded-xl border transition-all text-xs font-mono space-y-2 ${
                        editingFaq?.id === faq.id
                          ? "border-purple-500 bg-purple-950/30"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-g5 font-bold">
                              #{faq.displayOrder || idx + 1}
                            </span>
                            <p className="text-white font-bold text-xs">{faq.question}</p>
                          </div>
                          <p className="text-g5 text-[11px] leading-relaxed line-clamp-2 pl-6">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditFaq(faq)}
                            className="px-2 py-1 rounded text-[10px] uppercase font-mono font-bold bg-white/[0.06] text-purple-300 hover:bg-purple-950 hover:text-purple-200 cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="px-2 py-1 rounded text-[10px] uppercase font-mono font-bold bg-red-950/40 text-red hover:bg-red-950 hover:text-red-300 cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add / Edit FAQ Form */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  {editingFaq ? "✏️ Edit Question" : "+ Add New Question"}
                </h4>
                {editingFaq && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(null);
                      setFaqForm({ question: "", answer: "", displayOrder: 0 });
                    }}
                    className="text-[10px] font-mono text-g5 hover:text-white underline cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveFaq} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Question *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What is the dress code for VELVT Curse?"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white placeholder:text-g5/40 focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">Answer *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. All black / thematic attire is strictly encouraged..."
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white placeholder:text-g5/40 focus:outline-none focus:border-purple-500 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={faqForm.displayOrder}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, displayOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-32 bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                  <span className="text-[10px] text-g5 ml-2">Lower numbers appear first</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold rounded-full bg-purple-600 text-white hover:bg-purple-500 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                  >
                    {loading ? "Saving..." : editingFaq ? "Update FAQ" : "Add FAQ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Event Schedule Modal */}
      {managingScheduleFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide flex items-center gap-2">
                  <span>Event Schedule &amp; Timeline</span>
                  <span className="text-xs text-blue-400 font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60">
                    {managingScheduleFor.name}
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-g5 mt-0.5">
                  Control the night timeline displayed on the event page. If empty on upcoming events, &quot;Schedule Announcing Soon&quot; will display safely.
                </p>
              </div>
              <button
                onClick={() => {
                  setManagingScheduleFor(null);
                  setEditingScheduleItem(null);
                  setScheduleForm({ time: "7:00 PM", title: "", description: "", displayOrder: 1 });
                }}
                className="text-g5 hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Template Actions */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 justify-between">
              <span className="text-[11px] font-mono text-g5 uppercase tracking-wider">Quick Actions:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={scheduleLoading}
                  onClick={() => handleLoadTemplateSchedule(managingScheduleFor.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 cursor-pointer transition-all disabled:opacity-50"
                >
                  ⚡ Load 5-Point Template
                </button>
                <button
                  type="button"
                  disabled={scheduleLoading}
                  onClick={() => handleClearSchedule(managingScheduleFor.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  Clear / Announcing Soon
                </button>
              </div>
            </div>

            {/* Current Schedule Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center justify-between">
                <span>Timeline Itinerary ({managingScheduleFor.scheduleItems?.length || 0} Slots)</span>
                {editingScheduleItem && (
                  <span className="text-[10px] text-amber-400 font-normal">
                    Editing Slot Active
                  </span>
                )}
              </h4>

              {(!managingScheduleFor.scheduleItems || managingScheduleFor.scheduleItems.length === 0) ? (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                  <span className="text-2xl">⏳</span>
                  <p className="text-xs text-g5 font-mono italic">
                    No schedule slots added yet.
                  </p>
                  <p className="text-[10px] text-g5/70 font-mono max-w-md mx-auto">
                    Public site will render &quot;Schedule Announcing Soon&quot; for upcoming events, or hide schedule for completed events. Click &quot;Load 5-Point Template&quot; above to instantly populate default festival hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {managingScheduleFor.scheduleItems.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex items-start justify-between gap-3 ${
                        editingScheduleItem?.id === item.id
                          ? "border-blue-500 bg-blue-950/30"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-red-dim border border-red-glow text-white text-[10px] font-bold">
                            {item.time}
                          </span>
                          <span className="text-white font-bold text-xs">{item.title}</span>
                          <span className="text-[10px] text-g5">#{item.displayOrder || idx + 1}</span>
                        </div>
                        {item.description && (
                          <p className="text-g5 text-[11px] leading-relaxed pl-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditScheduleItem(item)}
                          className="px-2 py-1 rounded text-[10px] uppercase font-mono font-bold bg-white/[0.06] text-blue-300 hover:bg-blue-950 hover:text-blue-200 cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScheduleItem(item.id)}
                          className="px-2 py-1 rounded text-[10px] uppercase font-mono font-bold bg-red-950/40 text-red hover:bg-red-950 hover:text-red-300 cursor-pointer transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add / Edit Schedule Form */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  {editingScheduleItem ? "✏️ Edit Timeline Slot" : "+ Add Timeline Slot"}
                </h4>
                {editingScheduleItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScheduleItem(null);
                      setScheduleForm({ time: "8:00 PM", title: "", description: "", displayOrder: 1 });
                    }}
                    className="text-[10px] font-mono text-g5 hover:text-white underline cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveScheduleItem} className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-g5 mb-1 uppercase">Time Slot *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7:00 PM"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white placeholder:text-g5/40 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-g5 mb-1 uppercase">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Immersive Experience Begins"
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white placeholder:text-g5/40 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore themed installations and atmospheric zones..."
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white placeholder:text-g5/40 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-g5 uppercase">Order:</label>
                    <input
                      type="number"
                      min={0}
                      value={scheduleForm.displayOrder}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, displayOrder: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-20 bg-black/50 border border-white/10 rounded-lg p-1.5 text-white font-mono text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scheduleLoading}
                    className="px-5 py-2 text-xs font-bold rounded-full bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
                  >
                    {scheduleLoading ? "Saving..." : editingScheduleItem ? "Update Slot" : "Add Slot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
