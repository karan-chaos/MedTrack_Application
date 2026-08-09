import API from "./HttpService";

const fallbackInventory = [
  {
    id: "BDI-001",
    name: "ICU Ventilator V680",
    manufacturer: "MedAir Systems",
    serialNumber: "V680-24-1184",
    location: "ICU / Bay 04",
    status: "Monitored",
    risk: "High",
    firmware: "4.2.1",
    lastAttestedAt: "2026-08-09T06:14:00.000Z",
    integrityState: "Verified",
    certificateExpiresAt: "2026-11-18T00:00:00.000Z",
    owner: "Respiratory Care",
  },
  {
    id: "BDI-002",
    name: "Infusion Pump Sigma X",
    manufacturer: "CareFlow",
    serialNumber: "SFX-906177",
    location: "Oncology / Pod 02",
    status: "Monitored",
    risk: "Critical",
    firmware: "7.8.0",
    lastAttestedAt: "2026-08-09T05:48:00.000Z",
    integrityState: "Verified",
    certificateExpiresAt: "2026-09-03T00:00:00.000Z",
    owner: "Infusion Services",
  },
  {
    id: "BDI-003",
    name: "Patient Monitor MX450",
    manufacturer: "Philips",
    serialNumber: "MX4-724691",
    location: "Emergency / Resus 01",
    status: "Review required",
    risk: "High",
    firmware: "3.9.5",
    lastAttestedAt: "2026-08-08T21:10:00.000Z",
    integrityState: "Hash mismatch",
    certificateExpiresAt: "2027-01-07T00:00:00.000Z",
    owner: "Clinical Engineering",
  },
  {
    id: "BDI-004",
    name: "MRI Magnetom Vida",
    manufacturer: "Siemens Healthineers",
    serialNumber: "VIDA-039220",
    location: "Imaging / MRI 01",
    status: "Monitored",
    risk: "Medium",
    firmware: "XA12A",
    lastAttestedAt: "2026-08-09T06:02:00.000Z",
    integrityState: "Verified",
    certificateExpiresAt: "2027-06-12T00:00:00.000Z",
    owner: "Imaging Operations",
  },
  {
    id: "BDI-005",
    name: "Anaesthesia Workstation Aisys CS2",
    manufacturer: "GE HealthCare",
    serialNumber: "ACS2-717833",
    location: "OR / Theatre 05",
    status: "Isolated",
    risk: "Critical",
    firmware: "11.04",
    lastAttestedAt: "2026-08-07T16:30:00.000Z",
    integrityState: "Certificate expired",
    certificateExpiresAt: "2026-08-06T00:00:00.000Z",
    owner: "Perioperative Services",
  },
];

const standards = [
  { id: "NIST-800-53-SI-7", framework: "NIST SP 800-53", title: "Software, Firmware, and Information Integrity", requirement: "Verify integrity with cryptographic mechanisms and investigate anomalies.", state: "Enforced" },
  { id: "NIST-CSF-PR.DS-6", framework: "NIST CSF 2.0", title: "Integrity Checking", requirement: "Check software, firmware, and information integrity before use.", state: "Enforced" },
  { id: "FIPS-140-3", framework: "FIPS 140-3", title: "Cryptographic Module Validation", requirement: "Use validated cryptographic modules for device attestation workflows.", state: "Required" },
  { id: "ISO-27001-A.8.9", framework: "ISO/IEC 27001:2022", title: "Configuration Management", requirement: "Establish and maintain secure configurations for managed assets.", state: "Enforced" },
  { id: "ISO-80001-1", framework: "ISO 80001-1", title: "Medical IT Risk Management", requirement: "Manage safety, effectiveness, and data security risks in medical IT networks.", state: "Monitored" },
];

export const getDeviceIntegrityInventory = async () => {
  try {
    const response = await API.get("/api/security/biomedical/device-integrity/inventory");
    return Array.isArray(response.data) && response.data.length ? response.data : fallbackInventory;
  } catch (error) {
    console.info("Device integrity API unavailable; using local continuity dataset.");
    return fallbackInventory;
  }
};

export const validateDeviceIntegrityAction = (action, assetId) => {
  const allowedActions = ["attest", "quarantine", "recheck-certificate", "generate-evidence"];
  if (!allowedActions.includes(action)) return { valid: false, reason: "Action is not allow-listed for the clinical sandbox." };
  if (!fallbackInventory.some((asset) => asset.id === assetId)) return { valid: false, reason: "Asset is outside the approved inventory scope." };
  return { valid: true, reason: "Action is constrained to the simulated device-integrity boundary." };
};

export const sandboxDeviceIntegrityAction = async ({ action, assetId, operator = "security-operator" }) => {
  const validation = validateDeviceIntegrityAction(action, assetId);
  if (!validation.valid) return { ok: false, validation, executedAt: new Date().toISOString() };
  const asset = fallbackInventory.find((item) => item.id === assetId);
  const evidenceId = `EV-${assetId}-${Date.now().toString().slice(-6)}`;
  const response = {
    ok: true,
    mode: "SIMULATION_ONLY",
    action,
    assetId,
    operator,
    evidenceId,
    executedAt: new Date().toISOString(),
    message: `${action} accepted in the isolated sandbox. No production device command was transmitted.`,
    deviceSnapshot: { name: asset.name, integrityState: action === "attest" ? "Verified" : asset.integrityState },
  };
  try {
    await API.post("/api/security/biomedical/device-integrity/sandbox", response);
  } catch (error) {
    // Offline simulations are intentionally retained in the UI response.
  }
  return response;
};

export const exportDeviceIntegrityReportJson = async (id) => {
  const inventory = await getDeviceIntegrityInventory();
  const asset = inventory.find((item) => item.id === id) || fallbackInventory[0];
  return JSON.stringify({
    reportType: "Biomedical Device Integrity Audit",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    auditId: `AUDIT-${asset.id}-${new Date().toISOString().slice(0, 10)}`,
    asset,
    controls: standards.map(({ id: controlId, framework, state }) => ({ controlId, framework, state })),
    evidence: { hashAlgorithm: "SHA-256", attestationRequired: asset.risk === "Critical" || asset.risk === "High", immutableLogReference: `medtrack://evidence/${asset.id}` },
  }, null, 2);
};

export const getDeviceIntegrityStandards = async () => standards;

export { fallbackInventory };
