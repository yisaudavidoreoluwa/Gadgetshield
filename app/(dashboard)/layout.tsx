import React from "react";
import TelemetryLogger from "@/components/telemetry/TelemetryLogger";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <TelemetryLogger />
      {children}
    </div>
  );
}
