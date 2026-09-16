import TechnicianScanner from "@/components/technician/TechnicianScanner";

export const metadata = {
  title: "Technician Scanner // RupalShield",
  description: "Rapid mobile-first scanner portal for electronics repair hubs with the Stealth Safety Protocol.",
};

export default function TechnicianScanPage() {
  return (
    <div className="py-4 px-2 sm:px-4">
      <TechnicianScanner />
    </div>
  );
}
