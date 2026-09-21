"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Laptop, 
  Smartphone, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  UserCheck, 
  Lock, 
  Unlock, 
  History, 
  Search, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  ArrowUpRight
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { FleetAsset, FleetAuditLog } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/formatters";

export default function FleetPage() {
  const [assets, setAssets] = useState<FleetAsset[]>([]);
  const [auditLogs, setAuditLogs] = useState<FleetAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "audit">("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Assignment Modal State
  const [assigningAsset, setAssigningAsset] = useState<FleetAsset | null>(null);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empDept, setEmpDept] = useState("Engineering");

  // Lockdown Confirm State
  const [lockdownAsset, setLockdownAsset] = useState<FleetAsset | null>(null);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = () => {
    const loadedAssets = hybridStore.getFleetAssets();
    const loadedLogs = hybridStore.getFleetAuditLogs();
    setAssets(loadedAssets);
    setAuditLogs(loadedLogs);
  };

  const handleOpenAssign = (asset: FleetAsset) => {
    setAssigningAsset(asset);
    setEmpName(asset.assigned_to_name || "");
    setEmpEmail(asset.assigned_to_email || "");
    setEmpDept(asset.department && asset.department !== "IT Depot Reserve" ? asset.department : "Engineering");
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningAsset || !empName.trim()) return;

    hybridStore.assignFleetAsset(assigningAsset.id, empName, empEmail, empDept);
    setAssigningAsset(null);
    loadFleetData();
  };

  const handleUnassign = (assetId: string) => {
    hybridStore.unassignFleetAsset(assetId);
    loadFleetData();
  };

  const handleToggleLockdown = (asset: FleetAsset) => {
    hybridStore.toggleFleetLockdown(asset.id);
    setLockdownAsset(null);
    loadFleetData();
  };

  // Metrics
  const totalCount = assets.length;
  const assignedCount = assets.filter((a) => a.assigned_to_name).length;
  const depotCount = totalCount - assignedCount;
  const lockedDownCount = assets.filter((a) => a.lockdown_status === "LOCKED_DOWN").length;

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      asset.asset_tag.toLowerCase().includes(query) ||
      asset.brand.toLowerCase().includes(query) ||
      asset.model.toLowerCase().includes(query) ||
      (asset.serial_number && asset.serial_number.toLowerCase().includes(query)) ||
      (asset.assigned_to_name && asset.assigned_to_name.toLowerCase().includes(query));

    const matchesDept =
      departmentFilter === "ALL" ||
      (departmentFilter === "UNASSIGNED" && !asset.assigned_to_name) ||
      asset.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const departments = Array.from(
    new Set(assets.map((a) => a.department).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border-zinc-700/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono glass-pill px-2.5 py-0.5 rounded-full text-emerald-400 border-emerald-500/30 uppercase">
              SME Enterprise Fleet Suite
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-zinc-300" />
            IT Fleet Asset & Employee Custody
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Centralized corporate hardware management, employee device assignment, audit logs, and 1-click remote lockdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "inventory" ? "audit" : "inventory")}
            className="glass-pill text-xs text-zinc-200 px-4 py-2.5 rounded-full hover:bg-zinc-800 transition flex items-center gap-2 font-medium"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>{activeTab === "inventory" ? "View Audit Trail" : "View Fleet Inventory"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">Fleet Assets</span>
          <div className="text-xl font-bold text-white font-mono">{totalCount}</div>
          <span className="text-[10px] text-zinc-500">Under custody</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">Assigned to Staff</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">{assignedCount}</div>
          <span className="text-[10px] text-zinc-500">Active employee devices</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium">Depot Reserve</span>
          <div className="text-xl font-bold text-sky-400 font-mono">{depotCount}</div>
          <span className="text-[10px] text-zinc-500">Ready for deployment</span>
        </div>
        <div className={`glass-panel rounded-2xl p-4 space-y-1 ${lockedDownCount > 0 ? "border-amber-500/40 bg-amber-950/10" : ""}`}>
          <span className="text-[11px] text-zinc-400 font-medium">Active Lockdowns</span>
          <div className={`text-xl font-bold font-mono ${lockedDownCount > 0 ? "text-amber-400 animate-pulse" : "text-zinc-300"}`}>
            {lockedDownCount}
          </div>
          <span className="text-[10px] text-zinc-500">Blacklisted across network</span>
        </div>
      </div>

      {activeTab === "inventory" ? (
        /* INVENTORY TAB */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Asset Tag, Employee, Brand, or Serial..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-500"
              >
                <option value="ALL">All Departments</option>
                <option value="UNASSIGNED">Unassigned (Depot)</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fleet Asset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => {
              const isLocked = asset.lockdown_status === "LOCKED_DOWN";
              const isAssigned = Boolean(asset.assigned_to_name);

              return (
                <div
                  key={asset.id}
                  className={`glass-panel rounded-3xl p-5 space-y-4 border transition duration-200 relative overflow-hidden ${
                    isLocked
                      ? "border-amber-500/50 bg-amber-950/15 shadow-xl shadow-amber-950/30"
                      : "border-zinc-800/80 hover:border-zinc-700 shadow-lg"
                  }`}
                >
                  {/* Top Row: Tag & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
                        {asset.brand.toLowerCase().includes("apple") ? (
                          <Laptop className="w-4 h-4 text-white" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-zinc-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-white">
                            {asset.asset_tag}
                          </span>
                          {isLocked && (
                            <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> LOCKED DOWN
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-zinc-200 mt-0.5">
                          {asset.brand} {asset.model}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                        isLocked
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : isAssigned
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800/60 border-zinc-700/40 text-zinc-400"
                      }`}
                    >
                      {isLocked ? "SECURITY ALERT" : isAssigned ? "IN SERVICE" : "DEPOT RESERVE"}
                    </span>
                  </div>

                  {/* Hardware Identifiers Box */}
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 text-[11px] space-y-1.5 font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hardware Serial:</span>
                      <span className="text-zinc-200">{asset.serial_number || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IMEI / Registry Deed:</span>
                      <span className="text-zinc-300 tracking-wider">{asset.imei_primary}</span>
                    </div>
                  </div>

                  {/* Employee Custody Block */}
                  <div className="border-t border-zinc-800/60 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Assigned Custody
                      </span>
                      {isAssigned ? (
                        <div className="mt-0.5">
                          <span className="text-xs font-semibold text-white block">
                            {asset.assigned_to_name}
                          </span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {asset.assigned_to_email} &bull; {asset.department}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 italic block mt-0.5">
                          Unassigned &bull; Available in IT Depot
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAssign(asset)}
                      className="text-xs glass-pill text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3 h-3 text-zinc-400" />
                      <span>{isAssigned ? "Reassign" : "Assign Staff"}</span>
                    </button>
                  </div>

                  {/* Bottom Actions: Instant Remote Lockdown */}
                  <div className="border-t border-zinc-800/60 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setLockdownAsset(asset)}
                      className={`text-xs px-3.5 py-2 rounded-xl font-medium transition flex items-center gap-1.5 ${
                        isLocked
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Lift Lockdown</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Instant Remote Lockdown</span>
                        </>
                      )}
                    </button>

                    {isAssigned && !isLocked && (
                      <button
                        onClick={() => handleUnassign(asset.id)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Return to Depot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AUDIT TRAIL TAB */
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                Fleet Audit Trail & Custody Chain
              </h3>
              <span className="text-xs text-zinc-400">
                Immutable event logs for equipment allocations, verification pings, and lockdown flags.
              </span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">{auditLogs.length} Events Recorded</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => {
              const isLockdown = log.action === "LOCKDOWN_TRIGGERED";
              const isAssigned = log.action === "ASSIGNED";

              return (
                <div
                  key={log.id}
                  className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isLockdown
                          ? "bg-amber-500/20 text-amber-400"
                          : isAssigned
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isLockdown ? <Lock className="w-4 h-4" /> : isAssigned ? <UserCheck className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{log.asset_name}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            isLockdown
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1">{log.details}</p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {formatDateTime(log.timestamp)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                      Actor: {log.actor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGN EMPLOYEE MODAL */}
      {assigningAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 text-zinc-100 shadow-2xl border-zinc-700/60">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Assign Device Custody</h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {assigningAsset.asset_tag} &bull; {assigningAsset.brand} {assigningAsset.model}
                </span>
              </div>
              <button
                onClick={() => setAssigningAsset(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Employee Full Name *</label>
                <input
                  required
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. David Oreoluwa"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Corporate Email Address *</label>
                <input
                  required
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="e.g. d.oreoluwa@company.io"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Business Department *</label>
                <select
                  value={empDept}
                  onChange={(e) => setEmpDept(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Engineering">Engineering / AI Core</option>
                  <option value="Finance & Treasury">Finance & Treasury</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Executive Logistics">Executive Logistics</option>
                  <option value="Sales & Field Ops">Sales & Field Ops</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningAsset(null)}
                  className="flex-1 glass-pill text-zinc-400 py-2.5 rounded-xl hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-2.5 rounded-xl transition shadow"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTANT REMOTE LOCKDOWN CONFIRMATION MODAL */}
      {lockdownAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 text-zinc-100 shadow-2xl border-amber-500/40">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {lockdownAsset.lockdown_status === "LOCKED_DOWN" ? "Lift Remote Lockdown?" : "Instant Remote Lockdown"}
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  Asset: {lockdownAsset.asset_tag} &bull; {lockdownAsset.brand} {lockdownAsset.model}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {lockdownAsset.lockdown_status === "LOCKED_DOWN"
                ? "Restoring this asset will lift the blacklisted status across the national repair network and return the hardware to clean title."
                : "Locking down this asset will immediately broadcast its IMEI and Serial Number to every repair hub and second-hand dealer across the country. If presented for repair or resale, the technician intake scanner will automatically intercept it."}
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 my-4 text-[11px] font-mono text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>IMEI / Identifier:</span>
                <span className="text-white">{lockdownAsset.imei_primary}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Employee:</span>
                <span className="text-zinc-200">{lockdownAsset.assigned_to_name || "Depot Reserve"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLockdownAsset(null)}
                className="flex-1 glass-pill text-zinc-300 py-2.5 rounded-xl hover:bg-zinc-800 transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleLockdown(lockdownAsset)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg ${
                  lockdownAsset.lockdown_status === "LOCKED_DOWN"
                    ? "bg-white text-zinc-950 hover:bg-zinc-200"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                }`}
              >
                {lockdownAsset.lockdown_status === "LOCKED_DOWN" ? "Confirm Lift" : "Authorize Lockdown"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
