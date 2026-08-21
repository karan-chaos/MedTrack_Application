import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ShieldCheck,
  FileCheck,
  Lock,
  Database,
  Terminal,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Zap,
  Globe,
  Radio,
  FileCode,
  ShieldAlert,
  Layers,
  HardDrive,
  Hash,
  GitCommit,
  Scale,
  Award,
  RefreshCw,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  ChevronRight,
  Bell,
  Fingerprint,
  Stamp,
  BookOpen,
  Link2,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Server,
  Scroll,
  Key,
  ArrowUpRight,
  ExternalLink,
  FileWarning,
  ClipboardCheck,
  BadgeCheck,
  Landmark,
  NotebookPen,
  ScanLine,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
 *  Regulatory Audit & Provenance Ledger Hub
 *
 *  A unified console for C2PA content-provenance tracking, HIPAA audit-log
 *  monitoring, immutable chain-integrity verification, and cross-framework
 *  compliance-matrix oversight — all in a single self-contained page.
 * ───────────────────────────────────────────────────────────────────────── */

const RegulatoryAuditProvenanceHub = () => {
  /* ── state ─────────────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState("c2pa");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [simTick, setSimTick] = useState(0);
  const simRef = useRef(null);
  const toastId = useRef(0);

  /* ── C2PA Provenance Assertions ────────────────────────────────────────── */
  const [c2paAssertions, setC2paAssertions] = useState([
    {
      id: "C2PA-AI-001",
      title: "AI Radiology Model — Chest X-Ray Classifier v4.2",
      type: "AI_GENERATED",
      producer: "MedTrack Biomedical AI Lab",
      tool: "C2PA Compliant Tool Manifest v2.1",
      status: "VERIFIED",
      timestamp: "2026-08-19T06:12:33Z",
      hash: "sha256:9f4e3c2a1b8d7e6f…",
      parentAssertion: null,
      signatures: 2,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "MedTrack AI Provenance Engine",
      evidentiaryLinks: [
        "FDA 510(k) Pre-Submission #2026-4421",
        "IEC 62304 Software Lifecycle",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "ISO/IEC 42001",
        "EU AI Act Art. 52",
      ],
    },
    {
      id: "C2PA-DI-002",
      title: "Pathology Slide — H&E Stained Biopsy Sample #8841",
      type: "DIGITAL_CAPTURE",
      producer: "Dr. Sarah Chen — Digital Pathology Suite",
      tool: "Hamamatsu NanoZoomer S360 + C2PA Module",
      status: "VERIFIED",
      timestamp: "2026-08-19T04:30:15Z",
      hash: "sha256:a1b2c3d4e5f6a7b8…",
      parentAssertion: null,
      signatures: 3,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "Hamamatsu C2PA Capture Module v3.1",
      evidentiaryLinks: [
        "CAP Lab Accreditation #2026-881",
        "CLIA Certification #NYC-9920",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "DICOM SR",
        "FDA 21 CFR Part 58",
      ],
    },
    {
      id: "C2PA-ED-003",
      title: "Clinical Trial Consent Form — Phase III OncoTrial",
      type: "EDITED_DOCUMENT",
      producer: "IRB Review Board — MedTrack Clinical Research",
      tool: "Adobe Acrobat C2PA Plugin v1.8",
      status: "PENDING_REVIEW",
      timestamp: "2026-08-18T22:45:09Z",
      hash: "sha256:b2c3d4e5f6a7b8c9…",
      parentAssertion: "C2PA-ED-002",
      signatures: 4,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "Adobe Acrobat C2PA Signer v1.8.2",
      evidentiaryLinks: [
        "IRB Protocol #2026-ONCO-003",
        "ICH-GCP E6(R2) Compliance",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "21 CFR Part 312",
        "ICH E6(R2)",
      ],
    },
    {
      id: "C2PA-AI-004",
      title: "Genomic Variant Caller — WGS Pipeline v7.0",
      type: "AI_GENERATED",
      producer: "MedTrack Precision Genomics Division",
      tool: "C2PA Compliant Tool Manifest v2.1",
      status: "VERIFIED",
      timestamp: "2026-08-19T01:22:44Z",
      hash: "sha256:c3d4e5f6a7b8c9d0…",
      parentAssertion: null,
      signatures: 2,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "GATK-C2PA Provenance Wrapper v1.3",
      evidentiaryLinks: [
        "CLIA Certification #PHG-7701",
        "ISO 15189:2022 Accreditation",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "ISO/IEC 42001",
        "GINA Compliance",
      ],
    },
    {
      id: "C2PA-VI-005",
      title: "Telehealth Consult Recording — Encounter #9941",
      type: "VIDEO_CAPTURE",
      producer: "Dr. Marcus Holloway — Neurology",
      tool: "MedTrack Telehealth C2PA Recorder v2.0",
      status: "REJECTED",
      timestamp: "2026-08-19T05:55:18Z",
      hash: "sha256:d4e5f6a7b8c9d0e1…",
      parentAssertion: null,
      signatures: 1,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "MedTrack Telehealth C2PA Recorder v2.0",
      evidentiaryLinks: [
        "HITRUST CSF v11 Assessment",
        "SOC 2 Type II Report",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "HIPAA §164.312",
        "HITECH Act",
      ],
    },
    {
      id: "C2PA-AI-006",
      title: "Dermatology Lesion Detector — SkinVision ML v3.1",
      type: "AI_GENERATED",
      producer: "MedTrack Dermatology AI Research",
      tool: "PyTorch C2PA Exporter v1.4",
      status: "VERIFIED",
      timestamp: "2026-08-20T02:10:05Z",
      hash: "sha256:e5f6a7b8c9d0e1f2…",
      parentAssertion: null,
      signatures: 2,
      manifestStore: "C2PA-JUMBF v2.0",
      claimGenerator: "PyTorch C2PA Exporter v1.4",
      evidentiaryLinks: [
        "FDA De Novo DEN-2026-8832",
        "EU MDR Class IIa",
      ],
      complianceFrameworks: [
        "C2PA 2.1 Specification",
        "ISO/IEC 42001",
        "FDA 510(k)",
      ],
    },
  ]);

  /* ── HIPAA Audit Logs ──────────────────────────────────────────────────── */
  const [hipaaLogs, setHipaaLogs] = useState([
    {
      id: "AUD-77102",
      timestamp: "2026-08-20T07:44:12Z",
      eventType: "PHI_ACCESS_READ",
      actor: "usr:dr_martinez_44",
      actorRole: "physician",
      resource: "urn:medtrack:patient:PT-72310:lab_results",
      outcome: "SUCCESS",
      ipAddress: "10.42.8.113",
      userAgent: "MedTrack-Web/3.2.1",
      mfaVerified: true,
      hipaaSection: "§164.312(a)(1)",
      justification: "Active treatment — same-provider access",
    },
    {
      id: "AUD-77103",
      timestamp: "2026-08-20T07:43:58Z",
      eventType: "PHI_EXPORT_PDF",
      actor: "usr:nurse_james_12",
      actorRole: "nurse",
      resource: "urn:medtrack:patient:PT-55890:discharge_summary",
      outcome: "DENIED",
      ipAddress: "10.42.5.201",
      userAgent: "MedTrack-Web/3.2.1",
      mfaVerified: true,
      hipaaSection: "§164.312(e)(1)",
      justification: "Insufficient role authorization — export not permitted",
    },
    {
      id: "AUD-77104",
      timestamp: "2026-08-20T07:42:33Z",
      eventType: "PHI_ACCESS_DECRYPT",
      actor: "svc:ehr_bridge",
      actorRole: "service_account",
      resource: "urn:medtrack:patient:PT-31022:ehr_bundle",
      outcome: "SUCCESS",
      ipAddress: "10.42.1.5",
      userAgent: "MedTrack-EHR-Bridge/2.0.0",
      mfaVerified: false,
      hipaaSection: "§164.312(e)(2)(ii)",
      justification: "Automated FHIR R4 sync — service-account mutual TLS",
    },
    {
      id: "AUD-77105",
      timestamp: "2026-08-20T07:41:19Z",
      eventType: "PHI_ACCESS_WRITE",
      actor: "usr:dr_thorne_99",
      actorRole: "physician",
      resource: "urn:medtrack:patient:PT-88219:clinical_notes",
      outcome: "SUCCESS",
      ipAddress: "10.42.8.201",
      userAgent: "MedTrack-Web/3.2.1",
      mfaVerified: true,
      hipaaSection: "§164.312(a)(2)(i)",
      justification: "Treatment documentation — provider of record",
    },
    {
      id: "AUD-77106",
      timestamp: "2026-08-20T07:40:05Z",
      eventType: "PHI_BREACH_ATTEMPT",
      actor: "usr:unknown_ip_339",
      actorRole: "unknown",
      resource: "urn:medtrack:patient:PT-10044:medications",
      outcome: "BLOCKED",
      ipAddress: "203.0.113.47",
      userAgent: "curl/8.4.0",
      mfaVerified: false,
      hipaaSection: "§164.312(a)(1)",
      justification: "Anomalous IP — brute-force detection — auto-blocked",
    },
    {
      id: "AUD-77107",
      timestamp: "2026-08-20T07:39:22Z",
      eventType: "PHI_ACCESS_REVOKE",
      actor: "usr:admin_clara_07",
      actorRole: "hospital_admin",
      resource: "urn:medtrack:staff:contract_dr_41:access_token",
      outcome: "SUCCESS",
      ipAddress: "10.42.2.15",
      userAgent: "MedTrack-Admin/3.2.1",
      mfaVerified: true,
      hipaaSection: "§164.312(a)(3)",
      justification: "Terminated contractor — immediate access revocation",
    },
  ]);

  /* ── Chain Integrity Blocks ────────────────────────────────────────────── */
  const [chainBlocks, setChainBlocks] = useState([
    {
      blockNum: 91817,
      timestamp: "2026-08-20T07:30:00Z",
      txCount: 14,
      prevHash: "0x7b12…44a0",
      blockHash: "0x3f8a…991e",
      merkleRoot: "0xab31…f772",
      validator: "node:audit-validator-03",
      chainStatus: "VALID",
      size: "14.2 KB",
    },
    {
      blockNum: 91818,
      timestamp: "2026-08-20T07:30:15Z",
      txCount: 8,
      prevHash: "0x3f8a…991e",
      blockHash: "0x9e22…11c4",
      merkleRoot: "0xcc45…3a01",
      validator: "node:audit-validator-01",
      chainStatus: "VALID",
      size: "9.7 KB",
    },
    {
      blockNum: 91819,
      timestamp: "2026-08-20T07:30:30Z",
      txCount: 22,
      prevHash: "0x9e22…11c4",
      blockHash: "0x5d71…b833",
      merkleRoot: "0xef67…2190",
      validator: "node:audit-validator-02",
      chainStatus: "VALID",
      size: "23.5 KB",
    },
    {
      blockNum: 91820,
      timestamp: "2026-08-20T07:30:45Z",
      txCount: 5,
      prevHash: "0x5d71…b833",
      blockHash: "0x2a18…66de",
      merkleRoot: "0xdd90…ab44",
      validator: "node:audit-validator-03",
      chainStatus: "VALID",
      size: "6.1 KB",
    },
    {
      blockNum: 91821,
      timestamp: "2026-08-20T07:31:00Z",
      txCount: 31,
      prevHash: "0x2a18…66de",
      blockHash: "0x1c44…f029",
      merkleRoot: "0xbb22…9c88",
      validator: "node:audit-validator-01",
      chainStatus: "CORRUPT",
      size: "32.8 KB",
    },
  ]);

  /* ── Compliance Matrix ─────────────────────────────────────────────────── */
  const [complianceMatrix] = useState([
    {
      framework: "HIPAA Security Rule",
      section: "§164.312",
      status: "COMPLIANT",
      lastAudit: "2026-08-18",
      nextAudit: "2026-11-18",
      findings: 0,
      owner: "CISO Office",
      score: 98,
    },
    {
      framework: "C2PA Content Provenance",
      section: "C2PA 2.1 Spec",
      status: "COMPLIANT",
      lastAudit: "2026-08-15",
      nextAudit: "2026-10-15",
      findings: 1,
      owner: "AI Governance",
      score: 94,
    },
    {
      framework: "ISO/IEC 42001",
      section: "AI Management System",
      status: "IN_PROGRESS",
      lastAudit: "2026-07-20",
      nextAudit: "2026-09-20",
      findings: 3,
      owner: "AI Governance",
      score: 78,
    },
    {
      framework: "EU AI Act",
      section: "Art. 52 — Transparency",
      status: "COMPLIANT",
      lastAudit: "2026-08-01",
      nextAudit: "2026-11-01",
      findings: 0,
      owner: "Legal & Compliance",
      score: 96,
    },
    {
      framework: "HITRUST CSF",
      section: "v11 — Common Security",
      status: "AT_RISK",
      lastAudit: "2026-06-10",
      nextAudit: "2026-09-10",
      findings: 7,
      owner: "CISO Office",
      score: 62,
    },
    {
      framework: "SOC 2 Type II",
      section: "Trust Services Criteria",
      status: "COMPLIANT",
      lastAudit: "2026-08-12",
      nextAudit: "2027-02-12",
      findings: 2,
      owner: "CISO Office",
      score: 91,
    },
    {
      framework: "IEC 62304",
      section: "Medical Device Software",
      status: "IN_PROGRESS",
      lastAudit: "2026-07-30",
      nextAudit: "2026-10-30",
      findings: 4,
      owner: "Engineering",
      score: 74,
    },
    {
      framework: "GDPR",
      section: "Art. 30 — Records of Processing",
      status: "COMPLIANT",
      lastAudit: "2026-08-05",
      nextAudit: "2026-11-05",
      findings: 0,
      owner: "Legal & Compliance",
      score: 99,
    },
  ]);

  /* ── simulation helpers ────────────────────────────────────────────────── */
  const addToast = useCallback((msg, type = "info") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const openModal = useCallback((data) => {
    setModalData(data);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
  }, []);

  /* simulation tick — generates new audit events */
  useEffect(() => {
    if (!simRunning) {
      clearInterval(simRef.current);
      return;
    }
    simRef.current = setInterval(() => {
      setSimTick((t) => t + 1);
      const actors = [
        "usr:dr_martinez_44",
        "usr:nurse_james_12",
        "svc:ehr_bridge",
        "usr:dr_thorne_99",
        "usr:admin_clara_07",
      ];
      const events = [
        "PHI_ACCESS_READ",
        "PHI_ACCESS_WRITE",
        "PHI_EXPORT_PDF",
        "PHI_ACCESS_DECRYPT",
      ];
      const resources = [
        "urn:medtrack:patient:PT-72310:lab_results",
        "urn:medtrack:patient:PT-55890:imaging",
        "urn:medtrack:patient:PT-31022:ehr_bundle",
        "urn:medtrack:patient:PT-88219:clinical_notes",
      ];
      const outcomes = ["SUCCESS", "DENIED", "SUCCESS", "SUCCESS"];
      const newLog = {
        id: `AUD-${77108 + simTick}`,
        timestamp: new Date().toISOString(),
        eventType: events[Math.floor(Math.random() * events.length)],
        actor: actors[Math.floor(Math.random() * actors.length)],
        actorRole: "physician",
        resource: resources[Math.floor(Math.random() * resources.length)],
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        ipAddress: `10.42.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`,
        userAgent: "MedTrack-Web/3.2.1",
        mfaVerified: Math.random() > 0.2,
        hipaaSection: "§164.312(a)(1)",
        justification: "Simulated compliance event",
      };
      setHipaaLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      /* extend chain every 5 ticks */
      if (simTick % 5 === 0) {
        const lastBlock = chainBlocks[chainBlocks.length - 1];
        const newBlock = {
          blockNum: lastBlock.blockNum + 1,
          timestamp: new Date().toISOString(),
          txCount: Math.floor(Math.random() * 30) + 1,
          prevHash: lastBlock.blockHash,
          blockHash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
          merkleRoot: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
          validator: `node:audit-validator-0${(Math.floor(Math.random() * 3) + 1)}`,
          chainStatus: "VALID",
          size: `${(Math.random() * 30 + 2).toFixed(1)} KB`,
        };
        setChainBlocks((prev) => [...prev.slice(-9), newBlock]);
      }

      if (simTick % 7 === 0) {
        addToast(`Simulated audit event at tick ${simTick + 1}`, "info");
      }
    }, 1500 / simSpeed);
    return () => clearInterval(simRef.current);
  }, [simRunning, simSpeed, simTick, chainBlocks, addToast]);

  /* ── CSV export ────────────────────────────────────────────────────────── */
  const exportCSV = useCallback(() => {
    const rows = hipaaLogs.map((l) => [
      l.id,
      l.timestamp,
      l.eventType,
      l.actor,
      l.actorRole,
      l.resource,
      l.outcome,
      l.ipAddress,
      l.mfaVerified ? "Yes" : "No",
      l.hipaaSection,
      l.justification,
    ]);
    const header =
      "ID,Timestamp,Event Type,Actor,Role,Resource,Outcome,IP,MFA,HIPAA Section,Justification";
    const csv = [header, ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hipaa-audit-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("HIPAA audit log exported to CSV", "success");
  }, [hipaaLogs, addToast]);

  const exportC2paCSV = useCallback(() => {
    const header =
      "ID,Title,Type,Producer,Status,Timestamp,Hash,Signatures,Frameworks";
    const rows = c2paAssertions.map((a) =>
      [
        a.id,
        `"${a.title}"`,
        a.type,
        `"${a.producer}"`,
        a.status,
        a.timestamp,
        a.hash,
        a.signatures,
        `"${a.complianceFrameworks.join("; ")}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `c2pa-provenance-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("C2PA provenance data exported to CSV", "success");
  }, [c2paAssertions, addToast]);

  /* ── filtering ─────────────────────────────────────────────────────────── */
  const filteredAssertions = useMemo(() => {
    return c2paAssertions.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.producer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [c2paAssertions, searchTerm, statusFilter]);

  const filteredLogs = useMemo(() => {
    return hipaaLogs.filter((l) => {
      const matchesSearch =
        !searchTerm ||
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.eventType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || l.outcome === statusFilter;
      const matchesSeverity =
        severityFilter === "all" ||
        (severityFilter === "critical" &&
          (l.eventType === "PHI_BREACH_ATTEMPT" || l.outcome === "BLOCKED")) ||
        (severityFilter === "warning" && l.outcome === "DENIED") ||
        (severityFilter === "normal" && l.outcome === "SUCCESS");
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [hipaaLogs, searchTerm, statusFilter, severityFilter]);

  /* ── computed stats ────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const totalC2pa = c2paAssertions.length;
    const verified = c2paAssertions.filter(
      (a) => a.status === "VERIFIED"
    ).length;
    const pending = c2paAssertions.filter(
      (a) => a.status === "PENDING_REVIEW"
    ).length;
    const rejected = c2paAssertions.filter(
      (a) => a.status === "REJECTED"
    ).length;
    const totalLogs = hipaaLogs.length;
    const breaches = hipaaLogs.filter(
      (l) => l.eventType === "PHI_BREACH_ATTEMPT"
    ).length;
    const denied = hipaaLogs.filter((l) => l.outcome === "DENIED").length;
    const validBlocks = chainBlocks.filter(
      (b) => b.chainStatus === "VALID"
    ).length;
    const corruptBlocks = chainBlocks.filter(
      (b) => b.chainStatus === "CORRUPT"
    ).length;
    return {
      totalC2pa,
      verified,
      pending,
      rejected,
      totalLogs,
      breaches,
      denied,
      validBlocks,
      corruptBlocks,
    };
  }, [c2paAssertions, hipaaLogs, chainBlocks]);

  /* ── status / severity colour helpers ──────────────────────────────────── */
  const statusColor = (s) => {
    switch (s) {
      case "VERIFIED":
      case "COMPLIANT":
      case "SUCCESS":
      case "VALID":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "PENDING_REVIEW":
      case "IN_PROGRESS":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "REJECTED":
      case "BLOCKED":
      case "DENIED":
      case "CORRUPT":
      case "AT_RISK":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const scoreColor = (s) => {
    if (s >= 90) return "text-emerald-400";
    if (s >= 75) return "text-amber-400";
    return "text-red-400";
  };

  const badge = (text, colorCls) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorCls}`}
    >
      {text}
    </span>
  );

  /* ── tab definitions ───────────────────────────────────────────────────── */
  const tabs = [
    { key: "c2pa", label: "C2PA Provenance Ledger", icon: Stamp },
    { key: "hipaa", label: "HIPAA Audit Stream", icon: ShieldCheck },
    { key: "chain", label: "Chain Integrity", icon: Link2 },
    { key: "matrix", label: "Compliance Matrix", icon: Scale },
  ];

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Regulatory Audit &amp; Provenance Ledger
              </h1>
              <p className="text-sm text-slate-400">
                C2PA content provenance · HIPAA audit compliance · Immutable
                chain verification · Regulatory matrix
              </p>
            </div>
          </div>

          {/* stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">
            {[
              {
                label: "C2PA Assertions",
                value: stats.totalC2pa,
                icon: Stamp,
                color: "indigo",
              },
              {
                label: "Verified",
                value: stats.verified,
                icon: CheckCircle2,
                color: "emerald",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                color: "amber",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                icon: XCircle,
                color: "red",
              },
              {
                label: "Audit Events",
                value: stats.totalLogs,
                icon: FileText,
                color: "cyan",
              },
              {
                label: "Breaches Blocked",
                value: stats.breaches,
                icon: ShieldAlert,
                color: "red",
              },
              {
                label: "Chain Blocks",
                value: stats.validBlocks,
                icon: Link2,
                color: "emerald",
              },
              {
                label: "Corrupt Blocks",
                value: stats.corruptBlocks,
                icon: AlertTriangle,
                color: "red",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900 border border-slate-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <s.icon
                    className={`h-4 w-4 text-${s.color}-400`}
                  />
                  <span className="text-xs text-slate-400 truncate">
                    {s.label}
                  </span>
                </div>
                <p className="text-lg font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-1 overflow-x-auto py-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-slate-800 text-white border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, actor, title…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>

          {/* status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Statuses</option>
            {activeTab === "c2pa" && (
              <>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </>
            )}
            {activeTab === "hipaa" && (
              <>
                <option value="SUCCESS">Success</option>
                <option value="DENIED">Denied</option>
                <option value="BLOCKED">Blocked</option>
              </>
            )}
          </select>

          {/* severity filter (hipaa only) */}
          {activeTab === "hipaa" && (
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Breaches)</option>
              <option value="warning">Warning (Denied)</option>
              <option value="normal">Normal (Success)</option>
            </select>
          )}

          {/* simulation controls */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1 py-0.5">
              <button
                onClick={() => setSimRunning(!simRunning)}
                className={`p-1.5 rounded ${simRunning ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:text-white"}`}
                title={simRunning ? "Pause simulation" : "Resume simulation"}
              >
                {simRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              {[1, 2, 4].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSimSpeed(sp)}
                  className={`px-2 py-1 text-xs rounded ${
                    simSpeed === sp
                      ? "bg-indigo-500/20 text-indigo-400 font-medium"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sp}x
                </button>
              ))}
              <button
                onClick={() => {
                  setSimRunning(false);
                  setSimTick(0);
                  setChainBlocks([
                    {
                      blockNum: 91817,
                      timestamp: "2026-08-20T07:30:00Z",
                      txCount: 14,
                      prevHash: "0x7b12…44a0",
                      blockHash: "0x3f8a…991e",
                      merkleRoot: "0xab31…f772",
                      validator: "node:audit-validator-03",
                      chainStatus: "VALID",
                      size: "14.2 KB",
                    },
                  ]);
                  addToast("Simulation reset", "info");
                }}
                className="p-1.5 text-slate-400 hover:text-white"
                title="Reset simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Tick: {simTick}
              {simRunning && (
                <span className="ml-1 text-indigo-400">● LIVE</span>
              )}
            </span>
          </div>

          {/* export buttons */}
          {(activeTab === "c2pa" || activeTab === "hipaa") && (
            <button
              onClick={activeTab === "c2pa" ? exportC2paCSV : exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── C2PA PROVENANCE LEDGER TAB ─── */}
        {activeTab === "c2pa" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Stamp className="h-5 w-5 text-indigo-400" />
                Content Provenance Assertions ({filteredAssertions.length})
              </h2>
            </div>
            {filteredAssertions.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <FileWarning className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  No C2PA assertions match your filters.
                </p>
              </div>
            )}
            {filteredAssertions.map((a) => (
              <div
                key={a.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors cursor-pointer"
                onClick={() => openModal({ type: "c2pa", data: a })}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-indigo-400">
                        {a.id}
                      </span>
                      {badge(a.type, "text-cyan-400 bg-cyan-500/10 border-cyan-500/30")}
                      {badge(a.status, statusColor(a.status))}
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Producer: {a.producer} · Tool: {a.tool}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">
                      {new Date(a.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {a.signatures} sig{a.signatures !== 1 && "s"} ·{" "}
                      {a.manifestStore}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {a.complianceFrameworks.map((fw) => (
                    <span
                      key={fw}
                      className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Hash className="h-3 w-3 text-slate-600" />
                  <span className="text-xs font-mono text-slate-500">
                    {a.hash}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── HIPAA AUDIT STREAM TAB ─── */}
        {activeTab === "hipaa" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                HIPAA Compliance Audit Events ({filteredLogs.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Event ID
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actor
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      MFA
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      HIPAA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredLogs.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                      onClick={() => openModal({ type: "hipaa", data: l })}
                    >
                      <td className="py-3 px-3 font-mono text-xs text-indigo-400">
                        {l.id}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3">
                        {badge(
                          l.eventType.replace("PHI_", ""),
                          l.eventType.includes("BREACH")
                            ? "text-red-400 bg-red-500/10 border-red-500/30"
                            : "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-300 font-mono">
                        {l.actor}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 max-w-[200px] truncate">
                        {l.resource}
                      </td>
                      <td className="py-3 px-3">
                        {badge(l.outcome, statusColor(l.outcome))}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {l.mfaVerified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 inline" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 font-mono">
                        {l.hipaaSection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── CHAIN INTEGRITY TAB ─── */}
        {activeTab === "chain" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Link2 className="h-5 w-5 text-cyan-400" />
                Immutable Audit Chain — Block History
              </h2>
              <span className="text-xs text-slate-500">
                {chainBlocks.length} blocks · latest #{chainBlocks[chainBlocks.length - 1]?.blockNum}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <GitCommit className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-medium text-white">
                  Chain Status Overview
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-xs text-slate-400">Total Blocks</p>
                  <p className="text-xl font-bold text-white">
                    {chainBlocks.length}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-xs text-slate-400">Valid</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {stats.validBlocks}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-xs text-slate-400">Corrupt</p>
                  <p className="text-xl font-bold text-red-400">
                    {stats.corruptBlocks}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-xs text-slate-400">Integrity %</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {chainBlocks.length > 0
                      ? (
                          (stats.validBlocks / chainBlocks.length) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* block timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800" />
              {chainBlocks.map((b, i) => (
                <div
                  key={b.blockNum}
                  className="relative pl-14 pb-4 cursor-pointer group"
                  onClick={() => openModal({ type: "chain", data: b })}
                >
                  <div
                    className={`absolute left-4 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      b.chainStatus === "VALID"
                        ? "bg-emerald-500/20 border-emerald-500"
                        : "bg-red-500/20 border-red-500"
                    }`}
                  >
                    <Link2
                      className={`h-2.5 w-2.5 ${b.chainStatus === "VALID" ? "text-emerald-400" : "text-red-400"}`}
                    />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 group-hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          Block #{b.blockNum}
                        </span>
                        {badge(b.chainStatus, statusColor(b.chainStatus))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(b.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Transactions</span>
                        <p className="text-slate-300 font-medium">{b.txCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Size</span>
                        <p className="text-slate-300 font-medium">{b.size}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Validator</span>
                        <p className="text-slate-300 font-mono text-[10px]">
                          {b.validator}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Prev Hash</span>
                        <p className="text-slate-300 font-mono text-[10px]">
                          {b.prevHash}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── COMPLIANCE MATRIX TAB ─── */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-400" />
                Cross-Framework Compliance Matrix
              </h2>
            </div>

            {/* summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: "Compliant",
                  count: complianceMatrix.filter(
                    (c) => c.status === "COMPLIANT"
                  ).length,
                  color: "emerald",
                },
                {
                  label: "In Progress",
                  count: complianceMatrix.filter(
                    (c) => c.status === "IN_PROGRESS"
                  ).length,
                  color: "amber",
                },
                {
                  label: "At Risk",
                  count: complianceMatrix.filter(
                    (c) => c.status === "AT_RISK"
                  ).length,
                  color: "red",
                },
                {
                  label: "Avg Score",
                  count: `${(
                    complianceMatrix.reduce((a, c) => a + c.score, 0) /
                    complianceMatrix.length
                  ).toFixed(0)}%`,
                  color: "cyan",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center"
                >
                  <p className={`text-2xl font-bold text-${s.color}-400`}>
                    {s.count}
                  </p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* matrix table */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Framework
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Section
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Findings
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Next Audit
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {complianceMatrix.map((c) => (
                      <tr
                        key={c.framework}
                        className="hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-white">
                              {c.framework}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                          {c.section}
                        </td>
                        <td className="py-3 px-4">
                          {badge(c.status, statusColor(c.status))}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  c.score >= 90
                                    ? "bg-emerald-500"
                                    : c.score >= 75
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium ${scoreColor(c.score)}`}
                            >
                              {c.score}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-medium ${
                              c.findings === 0
                                ? "text-emerald-400"
                                : c.findings <= 3
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {c.findings}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {c.owner}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {c.nextAudit}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              openModal({ type: "compliance", data: c })
                            }
                            className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast notifications ── */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-slide-in-right ${
              t.type === "success"
                ? "bg-emerald-950/95 border-emerald-700/50 text-emerald-300"
                : t.type === "error"
                  ? "bg-red-950/95 border-red-700/50 text-red-300"
                  : "bg-slate-900/95 border-slate-700/50 text-slate-300"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : t.type === "error" ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Bell className="h-4 w-4 shrink-0" />
            )}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {modalOpen && modalData && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {modalData.type === "c2pa" && (
                  <Stamp className="h-5 w-5 text-indigo-400" />
                )}
                {modalData.type === "hipaa" && (
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                )}
                {modalData.type === "chain" && (
                  <Link2 className="h-5 w-5 text-cyan-400" />
                )}
                {modalData.type === "compliance" && (
                  <Scale className="h-5 w-5 text-amber-400" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {modalData.type === "c2pa" && "C2PA Assertion Detail"}
                  {modalData.type === "hipaa" && "HIPAA Audit Event Detail"}
                  {modalData.type === "chain" && "Block Integrity Detail"}
                  {modalData.type === "compliance" &&
                    "Compliance Framework Detail"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modalData.type === "c2pa" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Assertion ID</p>
                      <p className="text-sm font-mono text-indigo-400">
                        {modalData.data.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      {badge(modalData.data.status, statusColor(modalData.data.status))}
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Title</p>
                      <p className="text-sm text-white">{modalData.data.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Type</p>
                      <p className="text-sm text-slate-300">{modalData.data.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Producer</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.producer}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Claim Generator</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.claimGenerator}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Manifest Store</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.manifestStore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Signatures</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.signatures}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="text-sm text-slate-300">
                        {new Date(modalData.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Content Hash</p>
                    <p className="text-xs font-mono text-slate-400 bg-slate-800 p-2 rounded">
                      {modalData.data.hash}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Compliance Frameworks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {modalData.data.complianceFrameworks.map((fw) => (
                        <span
                          key={fw}
                          className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Evidentiary Links
                    </p>
                    <div className="space-y-1">
                      {modalData.data.evidentiaryLinks.map((link) => (
                        <div
                          key={link}
                          className="flex items-center gap-1.5 text-xs text-slate-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {modalData.type === "hipaa" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Event ID</p>
                      <p className="text-sm font-mono text-indigo-400">
                        {modalData.data.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Outcome</p>
                      {badge(modalData.data.outcome, statusColor(modalData.data.outcome))}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Event Type</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.eventType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="text-sm text-slate-300">
                        {new Date(modalData.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Actor</p>
                      <p className="text-sm font-mono text-slate-300">
                        {modalData.data.actor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Actor Role</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.actorRole}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">IP Address</p>
                      <p className="text-sm font-mono text-slate-300">
                        {modalData.data.ipAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">MFA Verified</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.mfaVerified ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Resource</p>
                    <p className="text-xs font-mono text-slate-400 bg-slate-800 p-2 rounded">
                      {modalData.data.resource}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      HIPAA Section &amp; Justification
                    </p>
                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                      <p className="text-xs text-indigo-400 font-mono mb-1">
                        {modalData.data.hipaaSection}
                      </p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.justification}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">User Agent</p>
                      <p className="text-xs font-mono text-slate-400">
                        {modalData.data.userAgent}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {modalData.type === "chain" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Block Number</p>
                      <p className="text-lg font-bold text-white">
                        #{modalData.data.blockNum}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      {badge(modalData.data.chainStatus, statusColor(modalData.data.chainStatus))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Block Hash</p>
                      <p className="text-xs font-mono text-slate-400 bg-slate-800 p-2 rounded">
                        {modalData.data.blockHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Previous Hash</p>
                      <p className="text-xs font-mono text-slate-400 bg-slate-800 p-2 rounded">
                        {modalData.data.prevHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Merkle Root</p>
                      <p className="text-xs font-mono text-slate-400 bg-slate-800 p-2 rounded">
                        {modalData.data.merkleRoot}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Validator</p>
                      <p className="text-xs font-mono text-slate-300">
                        {modalData.data.validator}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Transactions</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.txCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Block Size</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.size}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="text-sm text-slate-300">
                        {new Date(modalData.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {modalData.type === "compliance" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Framework</p>
                      <p className="text-lg font-semibold text-white">
                        {modalData.data.framework}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Section</p>
                      <p className="text-sm font-mono text-slate-300">
                        {modalData.data.section}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      {badge(modalData.data.status, statusColor(modalData.data.status))}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Compliance Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              modalData.data.score >= 90
                                ? "bg-emerald-500"
                                : modalData.data.score >= 75
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${modalData.data.score}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${scoreColor(modalData.data.score)}`}
                        >
                          {modalData.data.score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Open Findings</p>
                      <p
                        className={`text-sm font-medium ${
                          modalData.data.findings === 0
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {modalData.data.findings}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Owner</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Last Audit</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.lastAudit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Next Audit</p>
                      <p className="text-sm text-slate-300">
                        {modalData.data.nextAudit}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end p-5 border-t border-slate-800">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryAuditProvenanceHub;
