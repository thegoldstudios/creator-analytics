"use client";

import { useEffect } from "react";

export default function ExportTrigger() {
  useEffect(() => {
    // Brief delay so images can begin loading before print dialog opens
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);
  return null;
}
