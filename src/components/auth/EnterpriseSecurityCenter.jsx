import { useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import BiomedicalDeviceIntegrityPanel from "./BiomedicalDeviceIntegrityPanel";

const tabs = [
  { id: "overview", label: "Security overview", icon: ShieldCheck },
  { id: "biomedical-device-integrity", label: "Device integrity", icon: Activity },
];

export default function EnterpriseSecurityCenter() {
  const [activeTab, setActiveTab] = useState("biomedical-device-integrity");

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">MedTrack enterprise</p>
            <h1 className="mt-1 text-3xl font-bold">Security Center</h1>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Security controls active</div>
        </header>
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Security center areas">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${selected ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}><Icon size={16} />{tab.label}</button>;
          })}
        </nav>
        {activeTab === "overview" && <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Select a security domain to inspect its audit controls.</div>}
        {activeTab === "biomedical-device-integrity" && <BiomedicalDeviceIntegrityPanel />}
      </div>
    </section>
  );
}
