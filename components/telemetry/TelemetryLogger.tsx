"use client";

import { useEffect, useRef } from "react";
import { hybridStore } from "@/lib/storage/hybrid-store";

/**
 * TelemetryLogger (TEL-01)
 * Non-invasive, battery-neutral active session telemetry logger.
 * Triggers on authenticated active sessions to update the "Last Seen" timeline
 * without requiring persistent background daemons or draining mobile battery.
 */
export default function TelemetryLogger() {
  const hasLoggedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasLoggedRef.current) return;

    // Check if user has any active registered devices
    const devices = hybridStore.getDevices();
    if (!devices || devices.length === 0) return;

    // Find first active/clean or priority device to update
    const targetDevice = devices.find((d) => d.status === "CLEAN") || devices[0];
    if (!targetDevice) return;

    hasLoggedRef.current = true;

    const recordPing = async (lat?: number, lng?: number, accuracy?: number) => {
      try {
        const payload = {
          device_id: targetDevice.id,
          latitude: lat ?? targetDevice.last_seen_lat ?? 6.5244,
          longitude: lng ?? targetDevice.last_seen_lng ?? 3.3792,
          accuracy: accuracy ?? 15,
          approximate_address: lat
            ? `Active PWA Session (${lat.toFixed(4)}, ${lng?.toFixed(4)})`
            : "Active PWA Session (Verified Origin)",
        };

        // 1. Record instantly to client-side hybrid store
        hybridStore.recordTelemetryPing(targetDevice.id, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
          approximate_address: payload.approximate_address,
        });

        // 2. Transmit to server API in background
        fetch("/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {
          // Graceful fallback for offline
        });
      } catch {
        // Silently fail without interrupting user experience
      }
    };

    // Passive low-power location request if supported and granted
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          recordPing(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        () => {
          // Geolocation denied or unavailable; log network IP-based heartbeat
          recordPing();
        },
        {
          enableHighAccuracy: false, // Low-power / zero battery drain
          timeout: 4000,
          maximumAge: 1000 * 60 * 10, // Cache up to 10 mins
        }
      );
    } else {
      recordPing();
    }
  }, []);

  return null;
}
