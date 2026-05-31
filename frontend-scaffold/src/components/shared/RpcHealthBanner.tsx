import React from "react";
import { useRpcHealth } from "@/hooks/useRpcHealth";

export const RpcHealthBanner: React.FC = () => {
  const { isHealthy } = useRpcHealth();

  if (isHealthy) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b-4 border-black bg-red-300 px-4 py-2 text-sm font-black uppercase tracking-wide"
    >
      <span>Stellar network connection issues - some features may be unavailable</span>
    </div>
  );
};
