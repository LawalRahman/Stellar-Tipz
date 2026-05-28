import { useMemo, useEffect, useRef } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit";
import { signTx } from "../helpers/network";
import { useWalletStore } from "../store/walletStore";
import { classifyWalletError } from "../helpers/error";

interface Freighter {
  getNetwork: () => Promise<string>;
  getAddress: () => Promise<string>;
}

let kitInstance: StellarWalletsKit | null = null;
let currentNetwork: WalletNetwork | null = null;

type DisposableWalletKit = StellarWalletsKit & {
  closeModal?: () => void;
  disconnect?: () => void | Promise<void>;
  destroy?: () => void;
  removeAllListeners?: () => void;
};

const disposeKit = (kit: StellarWalletsKit | null) => {
  const disposableKit = kit as DisposableWalletKit | null;
  if (!disposableKit) return;

  try {
    disposableKit.closeModal?.();
  } catch (error) {
    console.warn("Failed to close wallet modal during cleanup:", error);
  }

  try {
    void disposableKit.disconnect?.();
  } catch (error) {
    console.warn("Failed to disconnect wallet kit during cleanup:", error);
  }

  try {
    disposableKit.removeAllListeners?.();
    disposableKit.destroy?.();
  } catch (error) {
    console.warn("Failed to fully dispose wallet kit during cleanup:", error);
  }
};

const getKit = (network: WalletNetwork) => {
  if (!kitInstance || currentNetwork !== network) {
    disposeKit(kitInstance);
    kitInstance = new StellarWalletsKit({
      network,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule(), new AlbedoModule(), new xBullModule()],
    });
    currentNetwork = network;
  }
  return kitInstance;
};

const AUTO_RECONNECT_TIMEOUT_MS = 5000;

export const useWallet = () => {
  const {
    publicKey,
    connected,
    connecting,
    isReconnecting,
    error,
    walletError,
    network,
    walletType,
    signingStatus,
    connect,
    disconnect,
    setConnecting,
    setReconnecting,
    setError,
    setWalletError,
    setNetwork: storeSetNetwork,
    setSigningStatus,
  } = useWalletStore();

  const kitNetwork =
    network === "PUBLIC" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET;
  const kit = useMemo(() => getKit(kitNetwork), [kitNetwork]);

  // Auto-reconnect on mount if a previous session exists
  const hasAttemptedReconnect = useRef(false);
  useEffect(() => {
    if (hasAttemptedReconnect.current) return;
    hasAttemptedReconnect.current = true;

    if (!walletType || connected) return;

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("Auto-reconnect timed out");
        setReconnecting(false);
        disconnect();
      }
    }, AUTO_RECONNECT_TIMEOUT_MS);

    setReconnecting(true);

    (async () => {
      try {
        kit.setWallet(walletType);
        const { address } = await kit.getAddress();
        if (!cancelled) {
          connect(address, walletType);
        }
      } catch (err) {
        console.warn(
          "Auto-reconnect failed — wallet extension may be unavailable:",
          err,
        );
        if (!cancelled) {
          // Clear persisted state so we don't retry on next load
          disconnect();
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setReconnecting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
    };
  }, []);

  const actions = useMemo(
    () => ({
      connect: async () => {
        setConnecting(true);
        setError(null);
        setWalletError(null);

        let walletSelected = false;

        const startTimeout = () => {
          connectTimeoutRef.current = setTimeout(() => {
            if (!walletSelected) {
              console.error(
                "[Wallet] Connection timed out after 60s",
              );
              const classified = classifyWalletError(
                new Error("Connection timed out"),
              );
              setWalletError(classified);
              setError(classified.message);
              setConnecting(false);
            }
          }, 60000);
        };

        const clearTimeout_ = () => {
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current);
            connectTimeoutRef.current = null;
          }
        };

        startTimeout();
        try {
          await kit.openModal({
            onWalletSelected: async (option) => {
              walletSelected = true;
              clearTimeout_();
              try {
                kit.setWallet(option.id);
                const { address } = await kit.getAddress();

                // Automatic network detection for better UX
                try {
                  const freighterWindow = window as unknown as {
                    freighter?: Freighter;
                  };
                  if (option.id === FREIGHTER_ID && freighterWindow.freighter) {
                    const networkDetails =
                      await freighterWindow.freighter.getNetwork();
                    const detectedNetwork =
                      networkDetails === "PUBLIC" ? "PUBLIC" : "TESTNET";
                    if (detectedNetwork !== network) {
                      storeSetNetwork(detectedNetwork);
                    }
                  }
                } catch (e) {
                  console.warn("[Wallet] Network auto-detection failed:", e);
                }

                connect(address, option.id);
              } catch (err) {
                console.error("[Wallet] Wallet connection failed:", err);
                const classified = classifyWalletError(err);
                setWalletError(classified);
                setError(classified.message);
              }
            },
          });
          clearTimeout_();
          if (!walletSelected) {
            const timeoutErr = new Error("Connection popup closed without wallet selection");
            console.warn("[Wallet] Popup closed without wallet selection");
            const classified = classifyWalletError(timeoutErr);
            setWalletError(classified);
            setError(classified.message);
            setConnecting(false);
          }
        } catch (err) {
          clearTimeout_();
          console.error("[Wallet] Wallet connection error:", {
            type: "openModal",
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString(),
          });
          const classified = classifyWalletError(err);
          setWalletError(classified);
          setError(classified.message);
          setConnecting(false);
        }
      },

      disconnect: () => {
        disconnect();
      },

      setNetwork: (newNetwork: "TESTNET" | "PUBLIC") => {
        storeSetNetwork(newNetwork);
      },

      signTransaction: async (xdr: string): Promise<string> => {
        if (!publicKey) {
          throw new Error(
            "Please connect your wallet before signing transactions",
          );
        }

        setSigningStatus("signing");
        try {
          const signed = await signTx(xdr, publicKey, kit);
          setSigningStatus("signed");
          return signed;
        } catch (err) {
          setSigningStatus("error");
          const message = err instanceof Error ? err.message : String(err);
          // Normalise rejection/cancellation messages
          if (/cancel|reject|denied|declined|closed/i.test(message)) {
            throw new Error("Transaction rejected by user", { cause: err });
          }
          throw err;
        } finally {
          // Reset to idle after a short delay so consumers can react to the state
          setTimeout(() => setSigningStatus("idle"), 1500);
        }
      },
    }),
    [
      publicKey,
      connect,
      disconnect,
      setConnecting,
      setError,
      setWalletError,
      storeSetNetwork,
      setSigningStatus,
      kit,
      network,
    ],
  );

  return useMemo(
    () => ({
      publicKey,
      connected,
      connecting,
      isReconnecting,
      error,
      walletError,
      network,
      walletType,
      signingStatus,
      ...actions,
    }),
    [
      publicKey,
      connected,
      connecting,
      isReconnecting,
      error,
      walletError,
      network,
      walletType,
      signingStatus,
      actions,
    ],
  );
};
