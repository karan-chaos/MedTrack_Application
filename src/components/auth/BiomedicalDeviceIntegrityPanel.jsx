import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  FileJson,
  Filter,
  FlaskConical,
  HardDrive,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import {
  exportDeviceIntegrityReportJson,
  getDeviceIntegrityInventory,
  getDeviceIntegrityStandards,
  sandboxDeviceIntegrityAction,
  validateDeviceIntegrityAction,
} from "../../services/BiomedicalDeviceIntegrityService";

const tabs = [
  { id: "assets", label: "Assets Inventory", icon: HardDrive },
  { id: "sandbox", label: "Action Sandbox", icon: FlaskConical },
  { id: "schema", label: "JSON Schema Inspector", icon: FileJson },
  { id: "standards", label: "Standards", icon: ShieldCheck },
];

const actionOptions = [
  { value: "attest", label: "Run firmware attestation" },
  { value: "recheck-certificate", label: "Recheck device certificate" },
  { value: "generate-evidence", label: "Generate audit evidence" },
  { value: "quarantine", label: "Simulate network quarantine" },
];

const auditSchemaFields = [
  {
    path: "reportType",
    type: "string",
    required: true,
    description: "Human-readable audit report classification.",
  },
  {
    path: "schemaVersion",
    type: "string",
    required: true,
    description: "Version of the exported evidence schema.",
  },
  {
    path: "generatedAt",
    type: "date-time",
    required: true,
    description: "UTC timestamp at which the report is produced.",
  },
  {
    path: "auditId",
    type: "string",
    required: true,
    description: "Immutable-friendly audit correlation identifier.",
  },
  {
    path: "asset.id",
    type: "string",
    required: true,
    description: "MedTrack biomedical inventory identifier.",
  },
  {
    path: "asset.integrityState",
    type: "enum",
    required: true,
    description: "Latest cryptographic integrity determination.",
  },
  {
    path: "asset.lastAttestedAt",
    type: "date-time",
    required: true,
    description: "Timestamp of the latest recorded attestation.",
  },
  {
    path: "controls[]",
    type: "array",
    required: true,
    description: "Mapped NIST, FIPS, and ISO control evidence.",
  },
  {
    path: "evidence.hashAlgorithm",
    type: "string",
    required: true,
    description: "Cryptographic digest algorithm for integrity evidence.",
  },
  {
    path: "evidence.immutableLogReference",
    type: "uri",
    required: true,
    description: "Reference to the retained evidence record.",
  },
];

const riskClass = {
  Critical: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  High: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Medium: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

const statusClass = {
  Monitored: "text-emerald-300",
  "Review required": "text-amber-300",
  Isolated: "text-rose-300",
};

function StatusPill({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>;
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <Icon size={18} className={tone} />
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">{message}</div>;
}

function OperationalGuardrails() {
  const guardrails = [
    {
      icon: LockKeyhole,
      title: "No direct device control",
      body: "This subsystem never opens a socket, changes a configuration, or transmits a command to clinical equipment.",
    },
    {
      icon: BadgeCheck,
      title: "Evidence-first workflow",
      body: "Attestation results are modeled as retained evidence and should be reviewed by authorized clinical engineering staff.",
    },
    {
      icon: Activity,
      title: "Risk-aware escalation",
      body: "Critical and review-required assets are visible immediately, with ownership and maintenance context retained in the inventory.",
    },
  ];

  return (
    <aside className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Operational guardrails</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {guardrails.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <Icon size={19} className="text-cyan-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-100">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function JsonBlock({ value, onCopy }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><FileJson size={16} className="text-cyan-300" />Audit JSON</div>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"><Copy size={14} />Copy JSON</button>
      </div>
      <pre className="max-h-[32rem] overflow-auto p-4 text-xs leading-6 text-cyan-100">{value || "Select an asset to generate its evidence document."}</pre>
    </div>
  );
}

function SchemaFieldList() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-bold text-white">Schema field reference</h3>
        <p className="mt-1 text-xs text-slate-400">Required fields emitted by this client-side audit report.</p>
      </div>
      <ul className="divide-y divide-slate-800">
        {auditSchemaFields.map((field) => (
          <li key={field.path} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-mono text-xs font-bold text-cyan-200">{field.path}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{field.description}</p>
            </div>
            <div className="flex items-start gap-2">
              <StatusPill className="border-slate-600 bg-slate-800 text-slate-200">{field.type}</StatusPill>
              {field.required && <StatusPill className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">required</StatusPill>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InventoryTable({ assets, selectedId, onSelect, onProvision }) {
  if (!assets.length) return <EmptyState message="No biomedical assets match the active filters." />;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Asset</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Risk</th><th className="px-4 py-3">Integrity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {assets.map((asset) => (
            <tr key={asset.id} className={`transition hover:bg-slate-900/70 ${selectedId === asset.id ? "bg-cyan-400/5" : ""}`}>
              <td className="px-4 py-4"><button type="button" className="text-left" onClick={() => onSelect(asset.id)}><p className="font-semibold text-white">{asset.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{asset.id} · {asset.serialNumber}</p></button></td>
              <td className="px-4 py-4 text-slate-300">{asset.location}</td>
              <td className="px-4 py-4"><StatusPill className={riskClass[asset.risk]}>{asset.risk}</StatusPill></td>
              <td className="px-4 py-4"><span className={asset.integrityState === "Verified" ? "text-emerald-300" : "text-amber-300"}>{asset.integrityState}</span></td>
              <td className={`px-4 py-4 font-medium ${statusClass[asset.status]}`}>{asset.status}</td>
              <td className="px-4 py-4"><button type="button" onClick={() => onProvision(asset)} className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200">Manage <ChevronRight size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProvisionModal({ asset, onClose, onSubmit }) {
  const [owner, setOwner] = useState(asset?.owner || "");
  const [window, setWindow] = useState("Next approved maintenance window");
  if (!asset) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="provision-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Controlled provisioning</p><h3 id="provision-title" className="mt-1 text-xl font-bold text-white">Manage {asset.name}</h3></div><button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close"><X /></button></div>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit({ owner, changeWindow: window }); }} className="space-y-4 p-5">
          <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-5 text-amber-100">Changes are recorded as a simulated approval request. No command is sent to this clinical device.</p>
          <label className="block text-sm font-semibold text-slate-200">Control owner<input required value={owner} onChange={(event) => setOwner(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400" /></label>
          <label className="block text-sm font-semibold text-slate-200">Change window<select value={window} onChange={(event) => setWindow(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"><option>Next approved maintenance window</option><option>Emergency clinical engineering review</option><option>Quarterly attestation cycle</option></select></label>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"><Plus size={16} />Create request</button></div>
        </form>
      </div>
    </div>
  );
}

export default function BiomedicalDeviceIntegrityPanel() {
  const [activeTab, setActiveTab] = useState("assets");
  const [assets, setAssets] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [reportJson, setReportJson] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [action, setAction] = useState("attest");
  const [sandboxAssetId, setSandboxAssetId] = useState("");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [sandboxBusy, setSandboxBusy] = useState(false);
  const [provisionAsset, setProvisionAsset] = useState(null);
  const [notice, setNotice] = useState("");

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    const [inventory, rules] = await Promise.all([getDeviceIntegrityInventory(), getDeviceIntegrityStandards()]);
    setAssets(inventory);
    setStandards(rules);
    const firstId = inventory[0]?.id || "";
    setSelectedId((current) => current || firstId);
    setSandboxAssetId((current) => current || firstId);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedId) return;
    exportDeviceIntegrityReportJson(selectedId).then(setReportJson);
  }, [selectedId]);

  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const searchable = `${asset.name} ${asset.id} ${asset.location} ${asset.manufacturer}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (statusFilter === "All" || asset.status === statusFilter) && (riskFilter === "All" || asset.risk === riskFilter);
  }), [assets, query, riskFilter, statusFilter]);

  const selectedAsset = assets.find((asset) => asset.id === selectedId);
  const criticalCount = assets.filter((asset) => asset.risk === "Critical").length;
  const reviewCount = assets.filter((asset) => asset.status !== "Monitored").length;
  const verifiedCount = assets.filter((asset) => asset.integrityState === "Verified").length;

  const copyJson = async () => {
    try { await navigator.clipboard.writeText(reportJson); setCopyMessage("Audit JSON copied."); }
    catch (error) { setCopyMessage("Clipboard access was unavailable. Select and copy the document manually."); }
    window.setTimeout(() => setCopyMessage(""), 3000);
  };

  const downloadJson = () => {
    const blob = new Blob([reportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedId || "device-integrity"}-audit.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const runSandbox = async () => {
    const validation = validateDeviceIntegrityAction(action, sandboxAssetId);
    if (!validation.valid) { setSandboxOutput(JSON.stringify({ ok: false, validation }, null, 2)); return; }
    setSandboxBusy(true);
    const result = await sandboxDeviceIntegrityAction({ action, assetId: sandboxAssetId });
    setSandboxOutput(JSON.stringify(result, null, 2));
    setSandboxBusy(false);
  };

  const provision = ({ owner, changeWindow }) => {
    setNotice(`Provisioning request created for ${provisionAsset.id}. Owner: ${owner}; window: ${changeWindow}.`);
    setProvisionAsset(null);
    window.setTimeout(() => setNotice(""), 6000);
  };

  if (loading) return <div className="flex min-h-[24rem] items-center justify-center text-slate-300"><LoaderCircle className="mr-3 animate-spin text-cyan-300" />Loading integrity telemetry…</div>;

  return (
    <section className="space-y-6 text-slate-100">
      <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7">
          <div className="flex items-start gap-4"><div className="rounded-xl bg-cyan-400/15 p-3 text-cyan-300"><ShieldCheck size={30} /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Biomedical security subsystem</p><h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Device Integrity Command Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Continuous integrity evidence, simulation-only response actions, and standards mapping for connected clinical assets.</p></div></div>
          <StatusPill className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200"><span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-300" />LIVE TELEMETRY</StatusPill>
        </div>
      </div>

      {notice && <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"><CheckCircle2 size={18} />{notice}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={HardDrive} label="Monitored assets" value={assets.length} tone="text-cyan-300" />
        <Metric icon={BadgeCheck} label="Verified integrity" value={`${verifiedCount}/${assets.length}`} tone="text-emerald-300" />
        <Metric icon={ShieldAlert} label="Critical assets" value={criticalCount} tone="text-rose-300" />
        <Metric icon={AlertTriangle} label="Action queue" value={reviewCount} tone="text-amber-300" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4" role="tablist" aria-label="Device integrity workspace">
        {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <button key={tab.id} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}><Icon size={16} />{tab.label}</button>; })}
      </div>

      {activeTab === "assets" && <div>
        <SectionTitle eyebrow="Clinical asset visibility" title="Assets Inventory" description="Search the attestation inventory and prioritize devices based on operational state, clinical risk, and cryptographic evidence." action={<button type="button" onClick={() => loadData(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400 disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />Refresh telemetry</button>} />
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block"><Search size={17} className="absolute left-3 top-3 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search asset, serial, location, manufacturer…" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" /></label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-300"><Filter size={15} /><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent py-2.5 outline-none"><option>All</option><option>Monitored</option><option>Review required</option><option>Isolated</option></select></label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-300"><ShieldAlert size={15} /><span className="sr-only">Filter by risk</span><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="bg-transparent py-2.5 outline-none"><option>All</option><option>Critical</option><option>High</option><option>Medium</option></select></label>
        </div>
        <InventoryTable assets={filteredAssets} selectedId={selectedId} onSelect={setSelectedId} onProvision={setProvisionAsset} />
        {selectedAsset && <div className="mt-5 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-3"><div><p className="text-xs uppercase tracking-wide text-slate-500">Selected owner</p><p className="mt-1 font-semibold text-white">{selectedAsset.owner}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Firmware baseline</p><p className="mt-1 font-mono text-sm text-cyan-200">{selectedAsset.firmware}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Last attestation</p><p className="mt-1 text-sm text-slate-200">{new Date(selectedAsset.lastAttestedAt).toLocaleString()}</p></div></div>}
        <OperationalGuardrails />
      </div>}

      {activeTab === "sandbox" && <div>
        <SectionTitle eyebrow="Safe response simulation" title="Action Sandbox" description="Every action is allow-listed and runs in a simulation boundary. This UI does not transmit a command to a medical device." />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="mb-5 flex items-center gap-2 text-sm font-bold text-cyan-200"><LockKeyhole size={17} />Constrained execution request</div><label className="block text-sm font-semibold text-slate-200">Target asset<select value={sandboxAssetId} onChange={(event) => setSandboxAssetId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400">{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id} — {asset.name}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-slate-200">Sandbox action<select value={action} onChange={(event) => setAction(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400">{actionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs leading-5 text-slate-400"><span className="font-bold text-slate-300">Validation:</span> {validateDeviceIntegrityAction(action, sandboxAssetId).reason}</div><button type="button" disabled={sandboxBusy} onClick={runSandbox} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">{sandboxBusy ? <LoaderCircle className="animate-spin" size={17} /> : <Terminal size={17} />}{sandboxBusy ? "Executing safely…" : "Execute in sandbox"}</button></div><div><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-slate-200">Response output</p><StatusPill className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">NO DEVICE I/O</StatusPill></div><pre className="min-h-[22rem] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs leading-6 text-emerald-100">{sandboxOutput || "// Awaiting a simulated action\n// Evidence and response metadata appear here."}</pre></div></div>
      </div>}

      {activeTab === "schema" && <div>
        <SectionTitle eyebrow="Portable audit evidence" title="JSON Schema Inspector" description="Inspect the structured audit evidence generated for the selected device. Copy or download the exact report document for an approved evidence workflow." action={<div className="flex gap-2"><button type="button" onClick={copyJson} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400"><Clipboard size={16} />Copy</button><button type="button" onClick={downloadJson} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"><Download size={16} />Download</button></div>} />
        <div className="mb-5 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_auto]"><label className="block text-sm font-semibold text-slate-200">Audit target<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400">{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id} — {asset.name}</option>)}</select></label><div className="self-end text-xs leading-5 text-slate-400"><p><span className="font-semibold text-slate-300">Schema:</span> 1.0.0</p><p><span className="font-semibold text-slate-300">Hash:</span> SHA-256</p></div></div>
        {copyMessage && <p className="mb-3 text-sm text-emerald-300">{copyMessage}</p>}
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <JsonBlock value={reportJson} onCopy={copyJson} />
          <SchemaFieldList />
        </div>
      </div>}

      {activeTab === "standards" && <div>
        <SectionTitle eyebrow="Control coverage" title="Standards & Compliance" description="Mapped guardrails support a traceable medical-device security assurance posture. Control owners should verify applicability against the organization’s approved policies." />
        <div className="grid gap-4">{standards.map((rule) => <article key={rule.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-cyan-300">{rule.id}</p><h3 className="mt-2 text-lg font-bold text-white">{rule.title}</h3><p className="mt-2 text-sm text-slate-400">{rule.framework}</p></div><StatusPill className={rule.state === "Enforced" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : rule.state === "Required" ? "border-amber-400/30 bg-amber-400/10 text-amber-100" : "border-sky-400/30 bg-sky-400/10 text-sky-100"}>{rule.state}</StatusPill></div><p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">{rule.requirement}</p></article>)}</div>
      </div>}

      <ProvisionModal asset={provisionAsset} onClose={() => setProvisionAsset(null)} onSubmit={provision} />
    </section>
  );
}
