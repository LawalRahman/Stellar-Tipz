import { useEffect, useState, useCallback } from "react";
import { env } from "@/helpers/env";

interface RpcHealthState {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: number | null;
}

const HEALTH_CHECK_INTERVAL_MS = 30000;
const HEALTH_CHECK_TIMEOUT_MS = 5000;

async function checkRpcHealth(rpcUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export function useRpcHealth(): RpcHealthState {
  const [state, setState] = useState<RpcHealthState>({
    isHealthy: true,
    isChecking: false,
    lastChecked: null,
  });

  const performHealthCheck = useCallback(async () => {
    setState((prev) => ({ ...prev, isChecking: true }));
    const isHealthy = await checkRpcHealth(env.sorobanRpcUrl);
    setState({
      isHealthy,
      isChecking: false,
      lastChecked: Date.now(),
    });
  }, []);

  useEffect(() => {
    performHealthCheck();
    const intervalId = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [performHealthCheck]);

  return state;
}
