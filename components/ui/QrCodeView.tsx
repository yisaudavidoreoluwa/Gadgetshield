"use client";

import React, { useMemo } from "react";
import { generateQrMatrix } from "@/lib/utils/qrcode";

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  quietZone?: number;
}

export default function QrCodeView({
  value,
  size = 180,
  className = "",
  quietZone = 2,
}: QrCodeViewProps) {
  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value);
    } catch {
      // Fallback matrix if encoding exceeds capacity
      return generateQrMatrix(value.slice(0, 40));
    }
  }, [value]);

  const matrixSize = matrix.length;
  const totalCells = matrixSize + quietZone * 2;
  const cellSize = size / totalCells;

  // Build SVG path
  const pathData = useMemo(() => {
    let d = "";
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = (c + quietZone) * cellSize;
          const y = (r + quietZone) * cellSize;
          d += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize, cellSize, quietZone]);

  return (
    <div className={`inline-block bg-white p-2 rounded-2xl shadow-sm ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="currentColor"
        className="text-black block"
      >
        <rect width={size} height={size} fill="white" />
        <path d={pathData} fill="black" />
      </svg>
    </div>
  );
}
