"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  approveVolunteer,
  revokeVolunteer,
  verifyVolunteer,
  updateVolunteerPhoto,
  updateVolunteerSocials,
  deleteVolunteer,
  createVolunteerDirect,
  bulkImportVolunteers,
  bulkGenerateVolunteers,
  updateVolunteerStatusDirect,
  bulkDeleteVolunteers,
  bulkUpdateVolunteerRole,
  bulkUpdateVolunteerStatus,
  bulkUpdateVolunteers,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import DownloadQrButton from "@/components/ui/DownloadQrButton";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

export interface VolunteerItem {
  id: string;
  volunteerId: string | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  preferredRole: string;
  assignedRole: string | null;
  experience: string | null;
  socialLink: string | null;
  photo: string | null;
  status: string;
  appliedAt: Date | string;
  event: { id?: string; name: string; date?: Date | string | null };
}

export interface EventOption {
  id: string;
  name: string;
  date: Date | string | null;
  status?: string;
}

interface VolunteerManagerProps {
  volunteers: VolunteerItem[];
  events?: EventOption[];
}

const ROLE_PRESETS = [
  "Stage Operations & Backstage",
  "Crowd Control & Guest Safety",
  "Guest Services & VIP Hospitality",
  "Photography & Videography",
  "Sound & Audio Engineering",
  "Lighting & Visual FX",
  "Box Office, Entry & Ticketing",
  "Logistics & Artist Liaison",
  "General Crew & Production Runner",
  "Assigning Soon",
];

// Helper to trigger client-side CSV downloads
function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Robust client-side CSV parser supporting quotes, commas, CRLF
function parseCsv(text: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  function splitRow(rowStr: string): string[] {
    const fields: string[] = [];
    let field = "";
    let insideQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];

      if (c === '"') {
        if (insideQuotes && nc === '"') {
          field += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (c === "," && !insideQuotes) {
        fields.push(field.trim());
        field = "";
      } else {
        field += c;
      }
    }
    fields.push(field.trim());
    return fields;
  }

  const rawHeaders = splitRow(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    if (values.every((v) => !v)) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    results.push(row);
  }

  return results;
}

export function VolunteerManager({ volunteers, events = [] }: VolunteerManagerProps) {
  const router = useRouter();
  const [volunteerList, setVolunteerList] = useState<VolunteerItem[]>(volunteers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Defaults
  const defaultEvent = events.find((e) => e.status === "upcoming") || events[0];
  const defaultYear = defaultEvent?.date
    ? new Date(defaultEvent.date).getFullYear()
    : new Date().getFullYear();

  // Add Volunteer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addPhotoUploading, setAddPhotoUploading] = useState(false);
  const [addIsOtherRole, setAddIsOtherRole] = useState(false);
  const [addCustomRoleText, setAddCustomRoleText] = useState("");
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Silchar",
    preferredRole: ROLE_PRESETS[0],
    assignedRole: ROLE_PRESETS[0],
    year: defaultYear,
    eventId: defaultEvent?.id || "",
    status: "verified",
    photo: "",
    socialLink: "",
    adminNotes: "",
  });

  // Bulk CSV Import Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<Array<any>>([]);
  const [csvDefaultYear, setCsvDefaultYear] = useState<number>(defaultYear);
  const [csvDefaultEventId, setCsvDefaultEventId] = useState<string>(defaultEvent?.id || "");
  const [csvImporting, setCsvImporting] = useState(false);

  // Edit Socials Modal State (replaces browser prompt popups)
  const [editingSocials, setEditingSocials] = useState<{
    id: string;
    fullName: string;
    instagram: string;
    linkedin: string;
    phone: string;
  } | null>(null);
  const [savingSocials, setSavingSocials] = useState(false);

  // Mass Volunteer Generator Modal State
  const [showMassVolunteerModal, setShowMassVolunteerModal] = useState(false);
  const [isBulkGeneratingVolunteers, setIsBulkGeneratingVolunteers] = useState(false);
  const [massVolMode, setMassVolMode] = useState<"sheet" | "quick">("sheet");
  const [massVolForm, setMassVolForm] = useState({
    eventId: defaultEvent?.id || "",
    year: defaultYear,
    role: ROLE_PRESETS[0],
    quantity: "10",
    status: "verified",
    namePrefix: "Crew Member",
  });

  // Google Sheet-like tabular input rows for Volunteers
  const [volSheetRows, setVolSheetRows] = useState<Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    city: string;
  }>>([
    { id: "vrow-1", fullName: "", email: "", phone: "", role: ROLE_PRESETS[0], city: "Silchar" },
    { id: "vrow-2", fullName: "", email: "", phone: "", role: ROLE_PRESETS[0], city: "Silchar" },
    { id: "vrow-3", fullName: "", email: "", phone: "", role: ROLE_PRESETS[0], city: "Silchar" },
  ]);
  const [isVolPasteOpen, setIsVolPasteOpen] = useState(false);
  const [volPasteRaw, setVolPasteRaw] = useState("");

  // Multi-Selection State
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [bulkSelectedRole, setBulkSelectedRole] = useState(ROLE_PRESETS[0]);
  const [bulkCustomRoleText, setBulkCustomRoleText] = useState("");
  const [bulkIsOtherRole, setBulkIsOtherRole] = useState(false);

  // Mass Edit Grid Modal State
  const [showMassEditModal, setShowMassEditModal] = useState(false);
  const [massEditSearch, setMassEditSearch] = useState("");
  const [massEditRows, setMassEditRows] = useState<Array<{
    id: string;
    volunteerId: string | null;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    city: string;
    status: string;
    eventId: string;
  }>>([]);
  const [isSavingMassEdit, setIsSavingMassEdit] = useState(false);

  const handleAddVolRow = () => {
    setVolSheetRows((prev) => [
      ...prev,
      {
        id: `vrow-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fullName: "",
        email: "",
        phone: "",
        role: massVolForm.role || ROLE_PRESETS[0],
        city: "Silchar",
      },
    ]);
  };

  const handleAddMultipleVolRows = (count: number) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: `vrow-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: "",
      email: "",
      phone: "",
      role: massVolForm.role || ROLE_PRESETS[0],
      city: "Silchar",
    }));
    setVolSheetRows((prev) => [...prev, ...newRows]);
  };

  const handleRemoveVolRow = (id: string) => {
    setVolSheetRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleVolRowChange = (id: string, field: string, val: string) => {
    setVolSheetRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleImportVolPastedText = () => {
    if (!volPasteRaw.trim()) return;
    const rawLines = volPasteRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    // Check if line 0 looks like a header row
    const firstLineCols = (rawLines[0].includes("\t") ? rawLines[0].split("\t") : rawLines[0].split(","))
      .map((c) => c.trim().toLowerCase());
    const isHeader = firstLineCols.some((c) =>
      c.includes("name") || c.includes("email") || c.includes("phone") || c.includes("role") || c.includes("dept") || c.includes("city")
    );

    let nameIdx = 0, emailIdx = 1, phoneIdx = 2, roleIdx = 3, cityIdx = 4;
    let dataLines = rawLines;
    if (isHeader) {
      dataLines = rawLines.slice(1);
      firstLineCols.forEach((col, idx) => {
        if (col.includes("name")) nameIdx = idx;
        else if (col.includes("email") || col.includes("mail")) emailIdx = idx;
        else if (col.includes("phone") || col.includes("contact") || col.includes("mobile")) phoneIdx = idx;
        else if (col.includes("role") || col.includes("dept") || col.includes("department") || col.includes("designation")) roleIdx = idx;
        else if (col.includes("city") || col.includes("location")) cityIdx = idx;
      });
    }

    const parsedRows = dataLines.map((line, idx) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      const fullName = (parts[nameIdx] || "").trim();
      const email = (parts[emailIdx] || "").trim();
      const phone = (parts[phoneIdx] || "").trim();
      // Take the role as it was written in the sheet
      const rawRole = (parts[roleIdx] || "").trim();
      const role = rawRole || massVolForm.role || ROLE_PRESETS[0];
      const city = (parts[cityIdx] || "").trim() || "Silchar";
      return {
        id: `vrow-${Date.now()}-${idx}`,
        fullName,
        email,
        phone,
        role,
        city,
      };
    }).filter((r) => r.fullName.length > 0 || r.email.length > 0 || r.phone.length > 0 || r.role.length > 0);

    if (parsedRows.length > 0) {
      setVolSheetRows(parsedRows);
      setIsVolPasteOpen(false);
      setVolPasteRaw("");
      setToast({ message: `Imported ${parsedRows.length} crew rows with exact roles preserved!`, type: "success" });
    }
  };

  useEffect(() => {
    setVolunteerList(volunteers);
  }, [volunteers]);

  // Filtered Volunteers List
  const filteredVolunteers = useMemo(() => {
    return volunteerList.filter((v) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.fullName.toLowerCase().includes(q);
        const matchesEmail = v.email.toLowerCase().includes(q);
        const matchesPhone = v.phone.toLowerCase().includes(q);
        const matchesId = v.volunteerId?.toLowerCase().includes(q);
        const matchesRole = (v.assignedRole || v.preferredRole).toLowerCase().includes(q);
        const matchesEvent = v.event?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId && !matchesRole && !matchesEvent) {
          return false;
        }
      }

      // Year Filter
      if (filterYear !== "all") {
        const hasYearInId = v.volunteerId?.includes(`-${filterYear}-`);
        const appliedYear = new Date(v.appliedAt).getFullYear().toString();
        const eventYear = v.event?.date ? new Date(v.event.date).getFullYear().toString() : "";
        if (!hasYearInId && appliedYear !== filterYear && eventYear !== filterYear) {
          return false;
        }
      }

      // Status Filter
      if (filterStatus !== "all") {
        if (v.status !== filterStatus) return false;
      }

      return true;
    });
  }, [volunteerList, searchQuery, filterYear, filterStatus]);

  // ─── CSV Export & Template Handlers ─────────────────────────────────────────

  function handleDownloadTemplateCsv() {
    const csv = [
      `fullName,email,phone,city,role,year,status,instagram,adminNotes,credentialId`,
      `"Arjun Sharma","arjun@velvt.in","+91 98765 43210","Silchar","Stage Operations & Backstage",2026,"verified","@arjun_sharma","Main stage lead coordinator",""`,
      `"Rhea Sen","rhea@velvt.in","+91 91234 56789","Silchar","Photography & Videography",2025,"verified","@rhea.raw","2025 past event media crew","VEL-2025-00014"`,
      `"Vikram Das","vikram@velvt.in","+91 98300 11223","Silchar","Crowd Control & Guest Safety",2026,"approved","@vikram_das","VIP entry coordination",""`,
    ].join("\r\n");

    downloadCsvFile("velvt_volunteers_template.csv", csv);
    setToast({ message: "Downloaded volunteer CSV template", type: "success" });
  }

  function handleExportAllCsv() {
    const rows = [
      `credentialId,fullName,email,phone,city,assignedRole,preferredRole,status,event,appliedDate,socials`,
    ];

    volunteerList.forEach((v) => {
      let instagram = "";
      if (v.socialLink) {
        try {
          const p = JSON.parse(v.socialLink);
          instagram = p.instagram || "";
        } catch {
          instagram = v.socialLink;
        }
      }

      const cols = [
        `"${v.volunteerId || ""}"`,
        `"${(v.fullName || "").replace(/"/g, '""')}"`,
        `"${(v.email || "").replace(/"/g, '""')}"`,
        `"${(v.phone || "").replace(/"/g, '""')}"`,
        `"${(v.city || "").replace(/"/g, '""')}"`,
        `"${(v.assignedRole || v.preferredRole || "").replace(/"/g, '""')}"`,
        `"${(v.preferredRole || "").replace(/"/g, '""')}"`,
        `"${v.status || ""}"`,
        `"${(v.event?.name || "").replace(/"/g, '""')}"`,
        `"${v.appliedAt ? new Date(v.appliedAt).toISOString().split("T")[0] : ""}"`,
        `"${instagram.replace(/"/g, '""')}"`,
      ];
      rows.push(cols.join(","));
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadCsvFile(`velvt_volunteers_export_${dateStr}.csv`, rows.join("\r\n"));
    setToast({ message: `Exported ${volunteerList.length} volunteers to CSV`, type: "success" });
  }

  // Handle CSV file selection and parsing
  async function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    try {
      const text = await file.text();
      const rawRows = parseCsv(text);

      const parsed = rawRows.map((row) => {
        const fullName = row.fullname || row.name || row.volunteername || "";
        const email = row.email || row.emailaddress || "";
        const phone = row.phone || row.phonenumber || row.contact || row.mobile || "";
        const city = row.city || row.location || "Silchar";
        const role =
          row.role ||
          row.assignedrole ||
          row.preferredrole ||
          row.department ||
          "General Crew & Operations";
        const year = parseInt(row.year || row.timeline || "", 10) || undefined;
        const status = (row.status || "verified").toLowerCase();
        const volunteerId = row.credentialid || row.volunteerid || row.id || "";
        const instagram = row.instagram || row.social || row.sociallink || "";
        const adminNotes = row.adminnotes || row.notes || "";

        return {
          fullName,
          email,
          phone,
          city,
          preferredRole: role,
          assignedRole: role,
          year,
          status,
          volunteerId,
          socialLink: instagram ? JSON.stringify({ instagram }) : undefined,
          adminNotes,
        };
      });

      setCsvPreviewRows(parsed);
      setToast({ message: `Detected ${parsed.length} rows in CSV file`, type: "info" });
    } catch (err: any) {
      setToast({ message: "Failed to parse CSV: " + err.message, type: "error" });
    }
  }

  async function handleConfirmBulkCsvImport() {
    if (!csvPreviewRows || csvPreviewRows.length === 0) {
      setToast({ message: "No rows found in CSV to import", type: "error" });
      return;
    }

    setCsvImporting(true);

    try {
      const recordsToImport = csvPreviewRows.map((r) => ({
        ...r,
        year: r.year || csvDefaultYear,
        eventId: csvDefaultEventId || undefined,
      }));

      const res = await bulkImportVolunteers(recordsToImport);

      if (res.success) {
        setShowCsvModal(false);
        setCsvFile(null);
        setCsvPreviewRows([]);
        setToast({
          message: `CSV Imported: ${res.createdCount} created, ${res.updatedCount} updated (${res.totalProcessed} total)`,
          type: "success",
        });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to bulk import CSV", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Bulk import error: " + err.message, type: "error" });
    } finally {
      setCsvImporting(false);
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string, name: string) {
    const prevList = volunteerList;
    setVolunteerList((prev) => prev.filter((v) => v.id !== id));

    setToast({
      message: `Volunteer application for "${name}" deleted`,
      type: "success",
      actionLabel: "Undo",
      onAction: () => setVolunteerList(prevList),
    });

    try {
      const res = await deleteVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete volunteer", type: "error" });
        setVolunteerList(prevList);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete volunteer", type: "error" });
      setVolunteerList(prevList);
    }
  }

  async function handleBulkGenerateVolunteers(e: React.FormEvent) {
    e.preventDefault();
    setIsBulkGeneratingVolunteers(true);
    try {
      if (massVolMode === "sheet") {
        const validRows = volSheetRows
          .map((r) => ({
            fullName: r.fullName.trim(),
            email: r.email.trim(),
            phone: r.phone.trim(),
            role: r.role.trim() || massVolForm.role || ROLE_PRESETS[0],
            city: r.city.trim() || "Silchar",
          }))
          .filter((r) => r.fullName.length > 0);

        if (validRows.length === 0) {
          setToast({ message: "Please enter at least one crew member name in the sheet.", type: "error" });
          setIsBulkGeneratingVolunteers(false);
          return;
        }

        const res = await bulkGenerateVolunteers({
          eventId: massVolForm.eventId || undefined,
          year: Number(massVolForm.year) || 2026,
          role: massVolForm.role,
          status: massVolForm.status,
          records: validRows,
        });

        if (res.success && res.volunteers) {
          setVolunteerList((prev) => [...(res.volunteers as any), ...prev]);
          setToast({
            message: `Registered ${res.count} crew members with official IDs!`,
            type: "success",
          });
          setShowMassVolunteerModal(false);
          router.refresh();
        } else {
          setToast({ message: res.error || "Failed to register volunteers", type: "error" });
        }
      } else {
        const qty = parseInt(massVolForm.quantity, 10) || 10;
        const res = await bulkGenerateVolunteers({
          eventId: massVolForm.eventId || undefined,
          year: Number(massVolForm.year) || 2026,
          role: massVolForm.role,
          quantity: qty,
          status: massVolForm.status,
          namePrefix: massVolForm.namePrefix,
        });

        if (res.success && res.volunteers) {
          setVolunteerList((prev) => [...(res.volunteers as any), ...prev]);
          setToast({
            message: `Generated ${res.count} volunteers with auto-assigned official IDs!`,
            type: "success",
          });
          setShowMassVolunteerModal(false);
          router.refresh();
        } else {
          setToast({ message: res.error || "Failed to generate volunteers", type: "error" });
        }
      }
    } catch (err: any) {
      setToast({ message: err?.message || "An error occurred", type: "error" });
    } finally {
      setIsBulkGeneratingVolunteers(false);
    }
  }

  async function handleDirectStatusChange(volunteerId: string, newStatus: string) {
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === volunteerId ? { ...v, status: newStatus } : v))
    );
    try {
      const res = await updateVolunteerStatusDirect(volunteerId, newStatus);
      if (res.success && res.volunteer) {
        setVolunteerList((prev) =>
          prev.map((v) =>
            v.id === volunteerId
              ? { ...v, volunteerId: res.volunteer.volunteerId, status: newStatus }
              : v
          )
        );
        setToast({ message: `Status updated to ${newStatus.toUpperCase()}`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to update status", type: "error" });
        setVolunteerList(volunteers);
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update status", type: "error" });
      setVolunteerList(volunteers);
    }
  }

  async function handleApprove(id: string, currentRole: string) {
    setLoadingId(id);
    setVolunteerList((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "approved", assignedRole: currentRole } : v
      )
    );
    setToast({ message: "Volunteer approved & Credential issued", type: "success" });

    try {
      const res = await approveVolunteer(id, currentRole);
      if (!res.success) {
        setToast({ message: res.error || "Failed to approve volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to approve volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleVerify(id: string) {
    setLoadingId(id);
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "verified" } : v))
    );
    setToast({ message: "Volunteer marked as verified", type: "success" });

    try {
      const res = await verifyVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to verify volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to verify volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRevoke(id: string) {
    setLoadingId(id);
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "revoked" } : v))
    );
    setToast({ message: "Volunteer credential revoked", type: "info" });

    try {
      const res = await revokeVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to revoke volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to revoke volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  function openSocialsModal(vol: VolunteerItem) {
    let instagram = "";
    let linkedin = "";
    let phone = vol.phone || "";
    if (vol.socialLink) {
      try {
        const parsed = JSON.parse(vol.socialLink);
        instagram = parsed.instagram || "";
        linkedin = parsed.linkedin || "";
        if (parsed.phone) phone = parsed.phone;
      } catch {
        instagram = vol.socialLink;
      }
    }

    setEditingSocials({
      id: vol.id,
      fullName: vol.fullName,
      instagram,
      linkedin,
      phone,
    });
  }

  async function handleSaveSocials(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSocials) return;

    setSavingSocials(true);
    const soc: Record<string, string> = {};
    if (editingSocials.instagram.trim()) soc.instagram = editingSocials.instagram.trim();
    if (editingSocials.linkedin.trim()) soc.linkedin = editingSocials.linkedin.trim();
    if (editingSocials.phone.trim()) soc.phone = editingSocials.phone.trim();

    const jsonStr = JSON.stringify(soc);
    const targetId = editingSocials.id;

    setVolunteerList((prev) =>
      prev.map((v) =>
        v.id === targetId ? { ...v, socialLink: jsonStr, phone: editingSocials.phone } : v
      )
    );
    setToast({ message: "Social handles updated successfully", type: "success" });
    setEditingSocials(null);

    try {
      await updateVolunteerSocials(targetId, jsonStr);
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update socials", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setSavingSocials(false);
    }
  }

  async function handlePhotoUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setVolunteerList((prev) =>
          prev.map((v) => (v.id === id ? { ...v, photo: data.url } : v))
        );
        await updateVolunteerPhoto(id, data.url);
        setToast({ message: "Badge photo uploaded successfully", type: "success" });
        router.refresh();
      } else {
        setToast({ message: data.error || "Failed to upload image", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Upload failed: " + err.message, type: "error" });
    } finally {
      setUploadingId(null);
    }
  }

  async function handleAddPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAddForm((prev) => ({ ...prev, photo: data.url }));
        setToast({ message: "Badge photo uploaded", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to upload photo", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Upload error: " + err.message, type: "error" });
    } finally {
      setAddPhotoUploading(false);
    }
  }

  async function handleCreateVolunteer(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.phone.trim()) {
      setToast({ message: "Please fill in Name, Email, and Phone number", type: "error" });
      return;
    }

    if (addIsOtherRole && !addForm.preferredRole.trim()) {
      setToast({ message: "Please enter your custom department / role", type: "error" });
      return;
    }

    setAddLoading(true);

    try {
      const res = await createVolunteerDirect({
        fullName: addForm.fullName,
        email: addForm.email,
        phone: addForm.phone,
        city: addForm.city,
        preferredRole: addForm.preferredRole,
        assignedRole: addForm.assignedRole || addForm.preferredRole,
        year: Number(addForm.year),
        eventId: addForm.eventId,
        status: addForm.status,
        photo: addForm.photo || undefined,
        socialLink: addForm.socialLink
          ? JSON.stringify({ instagram: addForm.socialLink })
          : undefined,
        adminNotes: addForm.adminNotes || undefined,
      });

      if (res.success && res.volunteer) {
        setShowAddModal(false);
        setAddIsOtherRole(false);
        setAddCustomRoleText("");
        setVolunteerList((prev) => [res.volunteer as any, ...prev]);
        setToast({
          message: `Volunteer "${res.volunteer.fullName}" registered directly with ID ${res.volunteer.volunteerId || "created"}`,
          type: "success",
        });
        setAddForm({
          fullName: "",
          email: "",
          phone: "",
          city: "Silchar",
          preferredRole: ROLE_PRESETS[0],
          assignedRole: ROLE_PRESETS[0],
          year: defaultYear,
          eventId: defaultEvent?.id || "",
          status: "verified",
          photo: "",
          socialLink: "",
          adminNotes: "",
        });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to register volunteer", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to register volunteer", type: "error" });
    } finally {
      setAddLoading(false);
    }
  }

  // Multi-Selection Logic
  const isAllFilteredSelected =
    filteredVolunteers.length > 0 &&
    filteredVolunteers.every((v) => selectedVolunteerIds.has(v.id));

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedVolunteerIds((prev) => {
        const next = new Set(prev);
        filteredVolunteers.forEach((v) => next.delete(v.id));
        return next;
      });
    } else {
      setSelectedVolunteerIds((prev) => {
        const next = new Set(prev);
        filteredVolunteers.forEach((v) => next.add(v.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedVolunteerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedVolunteerIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected volunteer(s)? This action cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const res = await bulkDeleteVolunteers(ids);
      if (res.success) {
        setVolunteerList((prev) => prev.filter((v) => !selectedVolunteerIds.has(v.id)));
        setSelectedVolunteerIds(new Set());
        setToast({ message: `Successfully deleted ${ids.length} volunteer(s)!`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to delete volunteers", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete volunteers", type: "error" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Update Role
  const handleBulkAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = Array.from(selectedVolunteerIds);
    if (ids.length === 0) return;

    const targetRole = bulkIsOtherRole ? bulkCustomRoleText.trim() : bulkSelectedRole;
    if (!targetRole) {
      setToast({ message: "Please specify the role to assign.", type: "error" });
      return;
    }

    setBulkActionLoading(true);
    try {
      const res = await bulkUpdateVolunteerRole(ids, targetRole);
      if (res.success) {
        setVolunteerList((prev) =>
          prev.map((v) =>
            selectedVolunteerIds.has(v.id)
              ? { ...v, assignedRole: targetRole, preferredRole: targetRole }
              : v
          )
        );
        setShowBulkRoleModal(false);
        setSelectedVolunteerIds(new Set());
        setBulkIsOtherRole(false);
        setBulkCustomRoleText("");
        setToast({ message: `Assigned "${targetRole}" to ${ids.length} volunteer(s)!`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to update roles", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update roles", type: "error" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Update Status
  const handleBulkStatusChange = async (status: string) => {
    const ids = Array.from(selectedVolunteerIds);
    if (ids.length === 0) return;

    setBulkActionLoading(true);
    try {
      const res = await bulkUpdateVolunteerStatus(ids, status);
      if (res.success) {
        setVolunteerList((prev) =>
          prev.map((v) =>
            selectedVolunteerIds.has(v.id)
              ? { ...v, status }
              : v
          )
        );
        setSelectedVolunteerIds(new Set());
        setToast({ message: `Updated status to "${status.toUpperCase()}" for ${ids.length} volunteer(s)!`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to update statuses", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update statuses", type: "error" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Open Mass Edit Grid Modal
  const openMassEditModal = () => {
    const rows = (filteredVolunteers.length > 0 ? filteredVolunteers : volunteerList).map((v) => ({
      id: v.id,
      volunteerId: v.volunteerId,
      fullName: v.fullName,
      email: v.email,
      phone: v.phone,
      role: v.assignedRole || v.preferredRole || ROLE_PRESETS[0],
      city: v.city || "Silchar",
      status: v.status,
      eventId: v.event.id || events[0]?.id || "",
    }));
    setMassEditRows(rows);
    setMassEditSearch("");
    setShowMassEditModal(true);
  };

  const handleMassEditRowChange = (id: string, field: string, value: string) => {
    setMassEditRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveMassEdit = async () => {
    if (massEditRows.length === 0) return;
    setIsSavingMassEdit(true);
    try {
      const res = await bulkUpdateVolunteers(
        massEditRows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          email: r.email,
          phone: r.phone,
          assignedRole: r.role,
          preferredRole: r.role,
          city: r.city,
          status: r.status,
          eventId: r.eventId,
        }))
      );

      if (res.success) {
        setVolunteerList((prev) =>
          prev.map((v) => {
            const updated = massEditRows.find((r) => r.id === v.id);
            if (updated) {
              const matchedEvent = events.find((e) => e.id === updated.eventId);
              return {
                ...v,
                fullName: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                assignedRole: updated.role,
                preferredRole: updated.role,
                city: updated.city,
                status: updated.status,
                event: matchedEvent
                  ? { id: matchedEvent.id, name: matchedEvent.name, date: matchedEvent.date }
                  : v.event,
              };
            }
            return v;
          })
        );
        setShowMassEditModal(false);
        setToast({ message: `Successfully updated ${massEditRows.length} volunteer records!`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to save mass edits", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to save mass edits", type: "error" });
    } finally {
      setIsSavingMassEdit(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Team &amp; Operations
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Volunteer Management
          </h1>
          <p className="text-xs text-g5 mt-1">
            Add team members, bulk import/update via CSV, export credentials, and manage verified passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-xs font-mono text-g5 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10">
            Total: <span className="text-white font-bold">{volunteerList.length}</span>
          </div>

          {/* Download Sample CSV Template */}
          <button
            type="button"
            onClick={handleDownloadTemplateCsv}
            className="px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-white/[0.05] text-white border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
            title="Download formatted CSV template for Google Sheets / Excel"
          >
            <span>📋</span>
            <span>Template CSV</span>
          </button>

          {/* Export All to CSV */}
          <button
            type="button"
            onClick={handleExportAllCsv}
            className="px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-white/[0.05] text-white border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
            title="Export all currently registered volunteers as CSV"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          {/* Mass Edit Grid Modal Button */}
          <button
            type="button"
            onClick={openMassEditModal}
            className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-blue-950/80 text-blue-300 border border-blue-700/60 hover:bg-blue-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)] font-bold"
            title="Open Google Sheets-style interactive full grid editor for all volunteers"
          >
            <span>📊</span>
            <span>Mass Edit Grid</span>
          </button>

          {/* Bulk Import / Update CSV */}
          <button
            type="button"
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold"
          >
            <span>📤</span>
            <span>Bulk CSV Upload</span>
          </button>

          {/* Add Volunteer Directly */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.35)] flex items-center gap-1.5"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Add Volunteer</span>
          </button>

          {/* Mass Volunteer Generator */}
          <button
            type="button"
            onClick={() => setShowMassVolunteerModal(true)}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold hover:bg-primary/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.2)] flex items-center gap-1.5"
          >
            <span>⚡ Mass Crew Generator</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, credential ID, email, role, or event..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Timelines / Years</option>
            <option value="2026">2026 (Current Timeline)</option>
            <option value="2025">2025 (Previous Year)</option>
            <option value="2024">2024 (Archive)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified (Official Pass)</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* ─── Volunteer Table / Empty State ─── */}
      {filteredVolunteers.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-12 text-center rounded-2xl space-y-3">
          <p className="font-display font-bold text-xl text-white uppercase">No Volunteer Records Found</p>
          <p className="text-xs text-g5">
            {volunteerList.length === 0
              ? "No volunteers registered yet. Click '+ Add Volunteer' or 'Bulk CSV Upload' above to onboard crew members."
              : "No records match your active search or filters. Try resetting the search or filter options above."}
          </p>
          {volunteerList.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterYear("all");
                setFilterStatus("all");
              }}
              className="mt-2 text-xs font-mono text-primary underline underline-offset-4 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-g5 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white/20 bg-black/60 text-primary accent-primary cursor-pointer align-middle"
                      title="Select All Filtered Volunteers"
                    />
                  </th>
                  <th className="py-3.5 px-3 min-w-[140px] whitespace-nowrap">Credential ID</th>
                  <th className="py-3.5 px-3 min-w-[200px]">Volunteer Details</th>
                  <th className="py-3.5 px-3 min-w-[170px] whitespace-nowrap">Contact (Private)</th>
                  <th className="py-3.5 px-3 min-w-[170px]">Event &amp; Role</th>
                  <th className="py-3.5 px-3 min-w-[120px] whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-3 min-w-[100px] whitespace-nowrap">Registered</th>
                  <th className="py-3.5 px-3 text-right min-w-[230px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredVolunteers.map((vol) => {
                  const isLoading = loadingId === vol.id;
                  const isUploading = uploadingId === vol.id;
                  const effectiveRole = vol.assignedRole || vol.preferredRole;
                  const isSelected = selectedVolunteerIds.has(vol.id);

                  return (
                    <tr
                      key={vol.id}
                      className={`transition-colors ${
                        isSelected ? "bg-red-950/20 hover:bg-red-950/30" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(vol.id)}
                          className="w-4 h-4 rounded border-white/20 bg-black/60 text-primary accent-primary cursor-pointer align-middle"
                        />
                      </td>

                      {/* Credential ID: Non-wrapping elegant badge */}
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        {vol.volunteerId ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {vol.volunteerId}
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                            Pending ID
                          </span>
                        )}
                      </td>

                      {/* Volunteer Details */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {vol.photo ? (
                            <img
                              src={vol.photo}
                              alt={vol.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner">
                              {vol.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs tracking-wide truncate">{vol.fullName}</p>
                            <p className="text-zinc-400 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                              <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                              {vol.city || "Silchar"}
                            </p>
                            {vol.socialLink && (
                              <span className="text-primary/90 text-[10px] font-mono mt-0.5 inline-flex items-center gap-1">
                                🔗 Socials linked
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <p className="text-zinc-300 font-medium hover:text-white transition-colors">{vol.email}</p>
                        <p className="text-zinc-400 mt-0.5">{vol.phone}</p>
                      </td>

                      {/* Event & Role */}
                      <td className="py-3 px-3">
                        <p className="text-white font-medium text-xs truncate max-w-[160px]">{vol.event.name}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            effectiveRole.toLowerCase().includes("assigning soon")
                              ? "text-amber-300 bg-amber-950/60 border-amber-500/40"
                              : "text-red bg-red-dim border-red-glow"
                          }`}
                        >
                          {effectiveRole}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={vol.status}
                          onChange={(e) => handleDirectStatusChange(vol.id, e.target.value)}
                          className={`text-[10px] font-mono font-bold uppercase rounded-lg px-2.5 py-1.5 border transition-colors cursor-pointer focus:outline-none ${
                            vol.status === "verified"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                              : vol.status === "approved"
                              ? "bg-blue-950/80 text-blue-400 border-blue-500/40"
                              : vol.status === "pending"
                              ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                              : vol.status === "rejected"
                              ? "bg-red-950/80 text-red-400 border-red-500/40"
                              : "bg-zinc-900 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="verified">Verified Pass</option>
                          <option value="revoked">Revoked</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Registered */}
                      <td className="py-3 px-3 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        {formatDateShort(vol.appliedAt)}
                      </td>

                      {/* Actions: Clean single horizontal row */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {vol.status === "pending" && (
                            <button
                              onClick={() => handleApprove(vol.id, effectiveRole)}
                              disabled={isLoading}
                              className="h-7 px-2.5 text-[10px] font-mono uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/25 transition-all cursor-pointer font-bold inline-flex items-center gap-1"
                              title="Approve and Issue Credential ID"
                            >
                              <span>✓</span>
                              <span>Approve</span>
                            </button>
                          )}

                          {vol.status === "approved" && (
                            <button
                              onClick={() => handleVerify(vol.id)}
                              disabled={isLoading}
                              className="h-7 px-2.5 text-[10px] font-mono uppercase tracking-wider rounded-md bg-red-dim text-white border border-red-glow hover:bg-red/30 transition-all cursor-pointer font-bold inline-flex items-center gap-1"
                              title="Mark Verified Pass"
                            >
                              <span>★</span>
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Photo Button */}
                          <label
                            className={`h-7 px-2 text-[10px] font-mono uppercase tracking-wider rounded-md border cursor-pointer transition-colors inline-flex items-center gap-1 ${
                              vol.photo
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-700/40 hover:border-emerald-500"
                                : "bg-white/[0.04] text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
                            }`}
                            title={vol.photo ? "Change Badge Photo (Photo Present)" : "Upload Badge Photo"}
                          >
                            <span>📷</span>
                            <span>{isUploading ? "..." : vol.photo ? "Photo ✓" : "Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(vol.id, e)}
                            />
                          </label>

                          {/* Socials Modal Button */}
                          <button
                            onClick={() => openSocialsModal(vol)}
                            disabled={isLoading}
                            className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider rounded-md bg-white/[0.04] text-zinc-400 border border-white/10 hover:border-white/30 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"
                            title="Edit Social Links & WhatsApp"
                          >
                            <span>🔗</span>
                            <span>Socials</span>
                          </button>

                          {/* Public Badge link */}
                          {(vol.volunteerId || vol.status === "approved" || vol.status === "verified") && (
                            <>
                              <a
                                href={`/verify/${encodeURIComponent(vol.volunteerId || vol.id)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider rounded-md bg-white/[0.04] text-zinc-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors inline-flex items-center gap-0.5"
                                title="Open Public Digital Badge"
                              >
                                <span>Badge</span>
                                <span className="text-[9px]">↗</span>
                              </a>

                              <DownloadQrButton
                                data={`/verify/${encodeURIComponent(vol.volunteerId || vol.id)}`}
                                filename={`VELVT-Volunteer-${vol.volunteerId || vol.id}-Pass.png`}
                                title={vol.fullName || "VELVT VOLUNTEER"}
                                subtitle={`ID: ${vol.volunteerId || vol.id} • ${effectiveRole}`}
                                badgeText="OFFICIAL CREDENTIAL"
                                label="QR"
                                variant="pill"
                              />
                            </>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(vol.id, vol.fullName)}
                            className="h-7 w-7 rounded-md bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/25 hover:border-red-500/50 transition-colors cursor-pointer inline-flex items-center justify-center text-xs"
                            title="Delete Volunteer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── FLOATING BULK ACTIONS BAR ─── */}
      {selectedVolunteerIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#121216]/95 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-white/15">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs text-white font-bold">
              {selectedVolunteerIds.size} Selected
            </span>
          </div>

          {/* Bulk Assign Role */}
          <button
            type="button"
            onClick={() => setShowBulkRoleModal(true)}
            disabled={bulkActionLoading}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xl bg-white/[0.08] text-white border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🏷️</span>
            <span>Assign Role</span>
          </button>

          {/* Bulk Verify Pass */}
          <button
            type="button"
            onClick={() => handleBulkStatusChange("verified")}
            disabled={bulkActionLoading}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span>★</span>
            <span>Verify All</span>
          </button>

          {/* Bulk Approve */}
          <button
            type="button"
            onClick={() => handleBulkStatusChange("approved")}
            disabled={bulkActionLoading}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓</span>
            <span>Approve All</span>
          </button>

          {/* Bulk Delete */}
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkActionLoading}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span>🗑️</span>
            <span>Delete Selected</span>
          </button>

          {/* Deselect All */}
          <button
            type="button"
            onClick={() => setSelectedVolunteerIds(new Set())}
            className="p-1.5 text-xs font-mono text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear selection"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── BULK ASSIGN ROLE MODAL ─── */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  Bulk Operation
                </span>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  Assign Role to {selectedVolunteerIds.size} Volunteer(s)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkRoleModal(false)}
                className="text-white/40 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkAssignRoleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-white mb-1.5 uppercase text-[10px]">
                  Select Role Preset *
                </label>
                <select
                  value={bulkIsOtherRole ? "Other" : bulkSelectedRole}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      if (!bulkIsOtherRole) setBulkIsOtherRole(true);
                    } else {
                      setBulkIsOtherRole(false);
                      setBulkSelectedRole(val);
                    }
                  }}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {ROLE_PRESETS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Role)...</option>
                </select>

                {bulkIsOtherRole && (
                  <div className="mt-2.5">
                    <label className="block text-primary text-[10px] uppercase mb-1">
                      Type Custom Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={bulkCustomRoleText}
                      onChange={(e) => setBulkCustomRoleText(e.target.value)}
                      placeholder="e.g. Stage Management Lead"
                      className="w-full bg-black/80 border border-primary/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBulkRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkActionLoading}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase hover:bg-red-700 transition-colors cursor-pointer"
                >
                  {bulkActionLoading ? "Updating..." : "Apply Role to Selected"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MASS EDIT GRID MODAL (Google Sheet-like Full Editor) ─── */}
      {showMassEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-hidden">
          <div className="bg-[#0c0c0f] border border-white/15 rounded-2xl w-full max-w-[96vw] h-[92vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold text-base">📊</span>
                  <h2 className="font-display font-bold text-xl text-white uppercase tracking-wider">
                    Mass Edit Grid (Spreadsheet Editor)
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Edit volunteers directly inline. Changes are applied in batch when you click Save.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={massEditSearch}
                  onChange={(e) => setMassEditSearch(e.target.value)}
                  placeholder="Filter rows by name, email, role..."
                  className="px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
                />
                <button
                  type="button"
                  onClick={handleSaveMassEdit}
                  disabled={isSavingMassEdit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>💾</span>
                  <span>{isSavingMassEdit ? "Saving Changes..." : `Save All (${massEditRows.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMassEditModal(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 font-mono text-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Grid Table Container */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="sticky top-0 z-20 bg-[#121216] border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider shadow">
                  <tr>
                    <th className="p-2 w-10 text-center">#</th>
                    <th className="p-2 min-w-[130px]">Credential ID</th>
                    <th className="p-2 min-w-[180px]">Full Name *</th>
                    <th className="p-2 min-w-[180px]">Email Address</th>
                    <th className="p-2 min-w-[130px]">Phone Number</th>
                    <th className="p-2 min-w-[180px]">Role / Department</th>
                    <th className="p-2 min-w-[110px]">City</th>
                    <th className="p-2 min-w-[120px]">Status</th>
                    <th className="p-2 min-w-[150px]">Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {massEditRows
                    .filter((row) => {
                      if (!massEditSearch.trim()) return true;
                      const q = massEditSearch.toLowerCase();
                      return (
                        row.fullName.toLowerCase().includes(q) ||
                        row.email.toLowerCase().includes(q) ||
                        row.role.toLowerCase().includes(q) ||
                        (row.volunteerId && row.volunteerId.toLowerCase().includes(q))
                      );
                    })
                    .map((row, idx) => (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className="p-2 text-center text-zinc-500 select-none text-[11px]">{idx + 1}</td>
                        <td className="p-1.5 whitespace-nowrap">
                          {row.volunteerId ? (
                            <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                              {row.volunteerId}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[11px] italic">Pending</span>
                          )}
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.fullName}
                            onChange={(e) => handleMassEditRowChange(row.id, "fullName", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="email"
                            value={row.email}
                            onChange={(e) => handleMassEditRowChange(row.id, "email", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="tel"
                            value={row.phone}
                            onChange={(e) => handleMassEditRowChange(row.id, "phone", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <div className="space-y-1">
                            <select
                              value={ROLE_PRESETS.includes(row.role) ? row.role : "__custom__"}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "__custom__") {
                                  if (ROLE_PRESETS.includes(row.role)) {
                                    handleMassEditRowChange(row.id, "role", "");
                                  }
                                } else {
                                  handleMassEditRowChange(row.id, "role", val);
                                }
                              }}
                              className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                              {ROLE_PRESETS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                              <option value="__custom__">
                                {row.role && !ROLE_PRESETS.includes(row.role)
                                  ? `Custom: ${row.role}`
                                  : "Other (Type Custom)..."}
                              </option>
                            </select>
                            {(!ROLE_PRESETS.includes(row.role) || row.role === "") && (
                              <input
                                type="text"
                                value={row.role}
                                onChange={(e) => handleMassEditRowChange(row.id, "role", e.target.value)}
                                placeholder="Type role..."
                                className="w-full bg-black/80 border border-blue-500/60 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                autoFocus={row.role === ""}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.city}
                            onChange={(e) => handleMassEditRowChange(row.id, "city", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <select
                            value={row.status}
                            onChange={(e) => handleMassEditRowChange(row.id, "status", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="verified">Verified</option>
                            <option value="revoked">Revoked</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <select
                            value={row.eventId}
                            onChange={(e) => handleMassEditRowChange(row.id, "eventId", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            {events.map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                {ev.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 bg-white/[0.02]">
              <span>Showing {massEditRows.length} total crew records</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMassEditModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-white hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveMassEdit}
                  disabled={isSavingMassEdit}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                >
                  {isSavingMassEdit ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK CSV UPLOAD & UPDATE MODAL ─── */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Bulk Operations
                </span>
                <h2 className="font-display font-bold text-2xl text-white uppercase">
                  Bulk Upload &amp; Update Volunteers (CSV)
                </h2>
                <p className="text-xs text-g5 mt-0.5">
                  Upload a CSV file to add new volunteers in bulk or update existing volunteers by email / ID.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCsvModal(false);
                  setCsvFile(null);
                  setCsvPreviewRows([]);
                }}
                className="text-white/40 hover:text-white text-xl p-1 font-mono transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Template Download & Format Info */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-white text-xs font-mono font-bold uppercase">
                    CSV Format Specification
                  </h4>
                  <p className="text-[11px] text-g5 font-mono">
                    Must include headers. Column names are flexible and case-insensitive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplateCsv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>📋 Download Template CSV</span>
                </button>
              </div>

              {/* Format Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase">
                      <th className="py-1 pr-3">Header Name</th>
                      <th className="py-1 pr-3">Required?</th>
                      <th className="py-1 pr-3">Description</th>
                      <th className="py-1">Example Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-white/80">
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">fullName</td>
                      <td className="py-1.5 pr-3 text-red-400">Yes</td>
                      <td className="py-1.5 pr-3">Full name of volunteer</td>
                      <td className="py-1.5 text-g5">Arjun Sharma</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">email</td>
                      <td className="py-1.5 pr-3 text-red-400">Yes</td>
                      <td className="py-1.5 pr-3">Used to match &amp; update if exists</td>
                      <td className="py-1.5 text-g5">arjun@velvt.in</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">phone</td>
                      <td className="py-1.5 pr-3 text-red-400">Yes</td>
                      <td className="py-1.5 pr-3">Contact / WhatsApp number</td>
                      <td className="py-1.5 text-g5">+91 98765 43210</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">role</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">Department or crew title</td>
                      <td className="py-1.5 text-g5">Stage Operations</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">year</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">Timeline year (2026 or 2025)</td>
                      <td className="py-1.5 text-g5">2026</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">status</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">verified, approved, or pending</td>
                      <td className="py-1.5 text-g5">verified</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">city</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">Location / Region</td>
                      <td className="py-1.5 text-g5">Silchar</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">credentialId</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">Leave blank to auto-generate</td>
                      <td className="py-1.5 text-g5">VEL-2026-00001</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-bold text-white">instagram</td>
                      <td className="py-1.5 pr-3 text-white/50">Optional</td>
                      <td className="py-1.5 pr-3">Social media handle</td>
                      <td className="py-1.5 text-g5">@arjun_sharma</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fallback Event & Year for rows without year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10 text-xs font-mono">
              <div>
                <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                  Fallback Timeline Year
                </label>
                <input
                  type="number"
                  value={csvDefaultYear}
                  onChange={(e) =>
                    setCsvDefaultYear(parseInt(e.target.value, 10) || new Date().getFullYear())
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Applied to rows in the CSV where year is omitted
                </p>
              </div>

              <div>
                <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                  Fallback Event Link
                </label>
                <select
                  value={csvDefaultEventId}
                  onChange={(e) => setCsvDefaultEventId(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {events.length > 0 ? (
                    events.map((ev) => {
                      const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                      return (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} {yr ? `(${yr})` : ""}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">Default Operations Event</option>
                  )}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Default event connection for imported rows
                </p>
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-white font-bold mb-1.5 uppercase text-[11px] font-mono">
                Select CSV File to Upload
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-500/60 transition-colors bg-white/[0.01]">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                  <div className="text-3xl">📄</div>
                  <p className="text-white font-bold text-xs font-mono">
                    {csvFile ? `Selected: ${csvFile.name}` : "Click to select .CSV file"}
                  </p>
                  <p className="text-muted-foreground text-[10px] font-mono">
                    Supports Microsoft Excel, Google Sheets, and Apple Numbers CSV exports
                  </p>
                </label>
              </div>
            </div>

            {/* Parsed Rows Preview */}
            {csvPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    ✓ {csvPreviewRows.length} Volunteer Records Detected
                  </span>
                  <span className="text-white/40 text-[11px]">
                    Previewing first {Math.min(5, csvPreviewRows.length)} rows
                  </span>
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 text-[11px] font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] text-white/50 text-[10px] uppercase">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Year</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {csvPreviewRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-medium text-white">{row.fullName || "—"}</td>
                          <td className="py-2 px-3 text-g6">{row.email || "—"}</td>
                          <td className="py-2 px-3 text-g5">{row.phone || "—"}</td>
                          <td className="py-2 px-3 text-white/80">{row.assignedRole || "—"}</td>
                          <td className="py-2 px-3 text-gold">{row.year || csvDefaultYear}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              {row.status || "verified"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Submit Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowCsvModal(false);
                  setCsvFile(null);
                  setCsvPreviewRows([]);
                }}
                disabled={csvImporting}
                className="px-4 py-2 text-xs font-mono rounded-lg bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkCsvImport}
                disabled={csvImporting || csvPreviewRows.length === 0}
                className="px-5 py-2 text-xs font-mono font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {csvImporting
                  ? `Importing ${csvPreviewRows.length} Volunteers...`
                  : `Confirm & Bulk Update (${csvPreviewRows.length} Volunteers)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD VOLUNTEER DIRECT MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  Direct Admin Registry
                </span>
                <h2 className="font-display font-bold text-2xl text-white uppercase">
                  Add Volunteer / Crew Member
                </h2>
                <p className="text-xs text-g5 mt-0.5">
                  Directly onboard crew members and assign year, event timeline &amp; credential role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-xl p-1 font-mono transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateVolunteer} className="space-y-4 text-xs font-mono">
              {/* 1. Basic Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  1. Basic Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sen"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="rahul@velvt.in"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={addForm.city}
                      onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                      placeholder="Silchar"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Timeline & Event Assignment */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  2. Timeline &amp; Event Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                      Assign Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={addForm.year}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value, 10) || new Date().getFullYear();
                        setAddForm((prev) => ({ ...prev, year: yr }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Sets credential ID format (e.g. VEL-{addForm.year}-XXXXX)
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                      Connect to Event (Dropdown) *
                    </label>
                    <select
                      value={addForm.eventId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const ev = events.find((item) => item.id === selId);
                        setAddForm((prev) => ({
                          ...prev,
                          eventId: selId,
                          ...(ev?.date ? { year: new Date(ev.date).getFullYear() } : {}),
                        }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {events.length > 0 ? (
                        events.map((ev) => {
                          const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                          const isCurrent = ev.status === "upcoming" || yr === new Date().getFullYear();
                          return (
                            <option key={ev.id} value={ev.id}>
                              {ev.name} {yr ? `(${yr})` : ""} {isCurrent ? "— [Current Timeline]" : "— [Previous Year]"}
                            </option>
                          );
                        })
                      ) : (
                        <option value="">Default Operations Event</option>
                      )}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Links volunteer badge to the event database
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Role & Credential Status */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  3. Role &amp; Credential Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Department / Role *
                    </label>
                    <select
                      value={addIsOtherRole ? "Other" : (ROLE_PRESETS.includes(addForm.preferredRole) ? addForm.preferredRole : "Other")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                          setAddIsOtherRole(true);
                          setAddForm((prev) => ({
                            ...prev,
                            preferredRole: addCustomRoleText,
                            assignedRole: prev.assignedRole === prev.preferredRole ? addCustomRoleText : prev.assignedRole,
                          }));
                        } else {
                          setAddIsOtherRole(false);
                          setAddForm((prev) => ({
                            ...prev,
                            preferredRole: val,
                            assignedRole: prev.assignedRole === prev.preferredRole ? val : (prev.assignedRole || val),
                          }));
                        }
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {ROLE_PRESETS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Role)...</option>
                    </select>

                    {(addIsOtherRole || (!ROLE_PRESETS.includes(addForm.preferredRole) && addForm.preferredRole !== "")) && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="block text-primary text-[10px] uppercase font-mono mb-1">
                          Specify Custom Role / Department *
                        </label>
                        <input
                          type="text"
                          required
                          value={addIsOtherRole ? addCustomRoleText : addForm.preferredRole}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAddCustomRoleText(val);
                            setAddForm((prev) => ({
                              ...prev,
                              preferredRole: val,
                              assignedRole: prev.assignedRole === prev.preferredRole ? val : (prev.assignedRole || val),
                            }));
                          }}
                          placeholder="e.g. Stage Management / Host"
                          className="w-full bg-black/80 border border-primary/60 rounded-lg p-2.5 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Assigned Title / Specialization
                    </label>
                    <input
                      type="text"
                      value={addForm.assignedRole}
                      onChange={(e) => setAddForm({ ...addForm, assignedRole: e.target.value })}
                      placeholder="e.g. Lead Sound Engineer"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Initial Status *
                    </label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="verified">Verified (Official Pass Live)</option>
                      <option value="approved">Approved (Pending Live Check-in)</option>
                      <option value="pending">Pending Application</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Photo & Social Links */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  4. Badge Photo &amp; Social Profile (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Badge ID Headshot Photo
                    </label>
                    <div className="flex items-center gap-3">
                      {addForm.photo ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                          <img src={addForm.photo} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <label className="flex-1 px-3 py-2 border border-white/15 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-center cursor-pointer transition-colors">
                        <span className="text-[11px] text-white">
                          {addPhotoUploading
                            ? "Uploading photo..."
                            : addForm.photo
                            ? "Change Photo ✓"
                            : "+ Upload Badge Headshot"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddPhotoUpload}
                          className="hidden"
                          disabled={addPhotoUploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Instagram / Social Profile
                    </label>
                    <input
                      type="text"
                      value={addForm.socialLink}
                      onChange={(e) => setAddForm({ ...addForm, socialLink: e.target.value })}
                      placeholder="@username or profile URL"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Internal Admin Notes */}
              <div>
                <label className="block text-white/60 mb-1 uppercase text-[10px]">
                  Internal Admin Notes
                </label>
                <input
                  type="text"
                  value={addForm.adminNotes}
                  onChange={(e) => setAddForm({ ...addForm, adminNotes: e.target.value })}
                  placeholder="e.g. Added directly by Sahil for VIP backstage operations"
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                  className="px-4 py-2 text-xs rounded-lg bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.35)]"
                >
                  {addLoading ? "Registering..." : "Add Volunteer to Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT SOCIALS MODAL (Replaces browser prompt popups) ─── */}
      {editingSocials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  Update Contact
                </span>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  {editingSocials.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSocials(null)}
                className="text-white/40 hover:text-white text-xl p-1 font-mono transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSocials} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  Instagram Handle / Profile URL
                </label>
                <input
                  type="text"
                  value={editingSocials.instagram}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, instagram: e.target.value })
                  }
                  placeholder="@username or https://instagram.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={editingSocials.linkedin}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={editingSocials.phone}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSocials(null)}
                  className="px-4 py-2 text-xs rounded-lg bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSocials}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-red-700 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.3)]"
                >
                  {savingSocials ? "Saving..." : "Save Handles"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal / Sheet: Mass Volunteer Generator (Spreadsheet & Bulk) ─────────────────────── */}
      {showMassVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full ${
              massVolMode === "sheet" ? "max-w-5xl" : "max-w-xl"
            } rounded-2xl bg-[#0c0c0e] border border-primary/30 shadow-[0_16px_50px_rgba(0,0,0,0.9)] p-5 md:p-7 relative max-h-[92vh] overflow-y-auto transition-all duration-300`}
          >
            <button
              onClick={() => setShowMassVolunteerModal(false)}
              className="absolute top-4 right-4 text-g5 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-red uppercase">
                  Batch Generator &bull; Sequential Official IDs (VEL-2026-XXXXX)
                </span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl uppercase tracking-wider text-white mt-1">
                Mass Volunteer &amp; Crew Generator
              </h2>
              <p className="text-xs text-g4 mt-1">
                Enter crew details directly using the Google Sheet table or import from clipboard. Sequential official IDs (<span className="text-white font-mono font-bold">VEL-2026-XXXXX</span>) are generated automatically.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-4 w-fit">
              <button
                type="button"
                onClick={() => setMassVolMode("sheet")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  massVolMode === "sheet"
                    ? "bg-red text-white shadow-[0_0_12px_rgba(200,16,46,0.4)]"
                    : "text-g5 hover:text-white"
                }`}
              >
                <span>📊</span>
                <span>Google Sheet Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setMassVolMode("quick")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  massVolMode === "quick"
                    ? "bg-red text-white shadow-[0_0_12px_rgba(200,16,46,0.4)]"
                    : "text-g5 hover:text-white"
                }`}
              >
                <span>⚡</span>
                <span>Numbered Auto-ID Batch</span>
              </button>
            </div>

            <form onSubmit={handleBulkGenerateVolunteers} className="space-y-4 font-mono text-xs">
              {/* Event & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-g4 uppercase text-[10px] mb-1">
                    Assigned Event
                  </label>
                  <select
                    value={massVolForm.eventId}
                    onChange={(e) => setMassVolForm({ ...massVolForm, eventId: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">General Crew Pool</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-g4 uppercase text-[10px] mb-1">
                    Status / Access Tier
                  </label>
                  <select
                    value={massVolForm.status}
                    onChange={(e) => setMassVolForm({ ...massVolForm, status: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="verified">Verified (Official Active Pass)</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {massVolMode === "sheet" ? (
                /* ── TAB 1: Google Sheet Table Mode ─────────────────────── */
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                        Crew Members Spreadsheet
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-amber-400 border border-amber-500/20">
                        {volSheetRows.filter((r) => r.fullName.trim()).length} of {volSheetRows.length} valid
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddVolRow}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-white/[0.06] text-white hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                      >
                        + Add Row
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddMultipleVolRows(5)}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-white/[0.06] text-white hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                      >
                        + 5 Rows
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVolPasteOpen(!isVolPasteOpen)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                          isVolPasteOpen
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-950/70"
                        }`}
                      >
                        <span>📋</span>
                        <span>{isVolPasteOpen ? "Close Paste Box" : "Paste from Sheets / Excel"}</span>
                      </button>
                      {volSheetRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setVolSheetRows([
                              { id: "vrow-1", fullName: "", email: "", phone: "", role: ROLE_PRESETS[0], city: "Silchar" },
                            ]);
                          }}
                          className="px-2 py-1 text-xs font-mono text-g5 hover:text-red transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Paste Box Drawer */}
                  {isVolPasteOpen && (
                    <div className="p-3.5 rounded-xl bg-[#141418] border border-purple-500/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                          Paste Data from Google Sheets or Excel
                        </span>
                        <span className="text-[10px] text-g5">Tab or Comma separated</span>
                      </div>
                      <textarea
                        rows={4}
                        value={volPasteRaw}
                        onChange={(e) => setVolPasteRaw(e.target.value)}
                        placeholder={`Name\tEmail\tPhone\tRole\tCity\nRohit Das\trohit@example.com\t9876543210\tStage & Sound\tSilchar\nPooja Roy\tpooja@example.com\t9876543211\tGate & Ticketing\tSilchar`}
                        className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-xs font-mono text-white placeholder:text-g6 focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsVolPasteOpen(false);
                            setVolPasteRaw("");
                          }}
                          className="px-3 py-1 text-xs font-mono text-g5 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleImportVolPastedText}
                          className="px-4 py-1 text-xs font-mono font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                        >
                          ⚡ Import Rows into Spreadsheet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* The Spreadsheet Grid */}
                  <div className="rounded-xl border border-white/15 bg-black/40 overflow-x-auto max-h-[42vh] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse min-w-[760px]">
                      <thead>
                        <tr className="bg-white/[0.04] text-[10px] text-g5 uppercase tracking-wider border-b border-white/10 sticky top-0 z-10">
                          <th className="p-2 text-center w-10">#</th>
                          <th className="p-2 min-w-[170px]">Full Name *</th>
                          <th className="p-2 min-w-[170px]">Email Address</th>
                          <th className="p-2 min-w-[130px]">Phone Number</th>
                          <th className="p-2 min-w-[170px]">Department / Role</th>
                          <th className="p-2 min-w-[110px]">City</th>
                          <th className="p-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {volSheetRows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-white/[0.02]">
                            <td className="p-2 text-center text-g5 text-[11px] select-none">{idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.fullName}
                                onChange={(e) => handleVolRowChange(row.id, "fullName", e.target.value)}
                                placeholder="Full Name"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="email"
                                value={row.email}
                                onChange={(e) => handleVolRowChange(row.id, "email", e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red placeholder:text-g6"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="tel"
                                value={row.phone}
                                onChange={(e) => handleVolRowChange(row.id, "phone", e.target.value)}
                                placeholder="+91..."
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5">
                              <div className="space-y-1">
                                <select
                                  value={ROLE_PRESETS.includes(row.role) ? row.role : "__custom__"}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "__custom__") {
                                      if (ROLE_PRESETS.includes(row.role)) {
                                        handleVolRowChange(row.id, "role", "");
                                      }
                                    } else {
                                      handleVolRowChange(row.id, "role", val);
                                    }
                                  }}
                                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red cursor-pointer"
                                >
                                  {ROLE_PRESETS.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                  <option value="__custom__">
                                    {row.role && !ROLE_PRESETS.includes(row.role)
                                      ? `Custom: ${row.role}`
                                      : "Other / Custom Role..."}
                                  </option>
                                </select>
                                {(!ROLE_PRESETS.includes(row.role) || row.role === "") && (
                                  <input
                                    type="text"
                                    value={row.role}
                                    onChange={(e) => handleVolRowChange(row.id, "role", e.target.value)}
                                    placeholder="Type custom role..."
                                    className="w-full bg-black/80 border border-primary/60 rounded px-2 py-1 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                                    autoFocus={row.role === ""}
                                  />
                                )}
                              </div>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.city}
                                onChange={(e) => handleVolRowChange(row.id, "city", e.target.value)}
                                placeholder="Silchar"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVolRow(row.id)}
                                disabled={volSheetRows.length <= 1}
                                className="text-g5 hover:text-red transition-colors p-1 cursor-pointer disabled:opacity-20"
                                title="Remove row"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ── TAB 2: Numbered Auto-ID Batch ─────────────────────── */
                <div className="space-y-4">
                  {/* Role Preset */}
                  <div>
                    <label className="block text-g4 uppercase text-[10px] mb-1">
                      Department / Assigned Role <span className="text-red">*</span>
                    </label>
                    <select
                      value={ROLE_PRESETS.includes(massVolForm.role) ? massVolForm.role : "Other"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                          setMassVolForm({ ...massVolForm, role: "" });
                        } else {
                          setMassVolForm({ ...massVolForm, role: val });
                        }
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {ROLE_PRESETS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Role)...</option>
                    </select>
                    {!ROLE_PRESETS.includes(massVolForm.role) && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="block text-primary text-[10px] uppercase font-mono mb-1">
                          Specify Custom Role / Department *
                        </label>
                        <input
                          type="text"
                          required
                          value={massVolForm.role}
                          onChange={(e) => setMassVolForm({ ...massVolForm, role: e.target.value })}
                          placeholder="e.g. Production Coordinator"
                          className="w-full bg-black/80 border border-primary/60 rounded-lg p-2.5 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-primary"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Quantity with quick chips */}
                  <div>
                    <label className="block text-g4 uppercase text-[10px] mb-1">
                      Quantity to Generate <span className="text-red">*</span>
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      {["5", "10", "20", "35", "50"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMassVolForm({ ...massVolForm, quantity: num })}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                            massVolForm.quantity === num
                              ? "bg-red text-white border-red"
                              : "bg-white/[0.05] text-g4 border-white/10 hover:border-white/30"
                          }`}
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={massVolForm.quantity}
                      onChange={(e) => setMassVolForm({ ...massVolForm, quantity: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Timeline / Year */}
                  <div>
                    <label className="block text-g4 uppercase text-[10px] mb-1">
                      Timeline / Year
                    </label>
                    <input
                      type="number"
                      value={massVolForm.year}
                      onChange={(e) => setMassVolForm({ ...massVolForm, year: Number(e.target.value) || 2026 })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Name Prefix */}
                  <div>
                    <label className="block text-g4 uppercase text-[10px] mb-1">
                      Volunteer Name Label Prefix
                    </label>
                    <input
                      type="text"
                      value={massVolForm.namePrefix}
                      onChange={(e) => setMassVolForm({ ...massVolForm, namePrefix: e.target.value })}
                      placeholder="e.g. Crew Member, Volunteer, Stage Hand"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                    <span className="text-[10px] text-g5 mt-1 block">
                      Generated crew will be named &ldquo;{massVolForm.namePrefix} 01&rdquo;, &ldquo;{massVolForm.namePrefix} 02&rdquo; with sequential credentials.
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMassVolunteerModal(false)}
                  className="px-4 py-2 text-xs rounded-lg bg-white/[0.05] text-g4 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isBulkGeneratingVolunteers ||
                    (massVolMode === "sheet" && volSheetRows.filter((r) => r.fullName.trim()).length === 0)
                  }
                  className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary hover:bg-red-700 text-white shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isBulkGeneratingVolunteers ? (
                    <span>Generating Crew Members...</span>
                  ) : massVolMode === "sheet" ? (
                    <span>👥 Register {volSheetRows.filter((r) => r.fullName.trim()).length || 0} Volunteers</span>
                  ) : (
                    <span>⚡ Generate {massVolForm.quantity || "0"} Volunteers</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
