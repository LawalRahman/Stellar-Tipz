import React from "react";
import {
  AlertCircle,
  Download,
  Lock,
  RefreshCcw,
  Network,
  Clock,
  XCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Toast from "../ui/Toast";
import { useWalletStore } from "../../store/walletStore";
import type { WalletErrorType } from "../../helpers/error";

interface WalletErrorRecoveryProps {
  onRetry: () => void;
  onClose?: () => void;
  className?: string;
}

const INSTALL_URL = "https://freighter.app";

const errorConfig: Record<
  WalletErrorType,
  {
    icon: React.ReactNode;
    title: string;
    guidance: string;
    showInstallLink: boolean;
    showRetry: boolean;
  }
> = {
  "not-installed": {
    icon: <Download className="text-blue-600" size={24} />,
    title: "Install Freighter",
    guidance:
      "Freighter is a browser extension wallet for Stellar. Install it to connect and start tipping.",
    showInstallLink: true,
    showRetry: true,
  },
  locked: {
    icon: <Lock className="text-orange-600" size={24} />,
    title: "Unlock Your Wallet",
    guidance:
      "Your Freighter wallet is locked. Please open Freighter and unlock it, then try again.",
    showInstallLink: false,
    showRetry: true,
  },
  rejected: {
    icon: <XCircle className="text-red-600" size={24} />,
    title: "Connection Rejected",
    guidance:
      "You closed or rejected the connection request. Please try again and approve the connection in your wallet.",
    showInstallLink: false,
    showRetry: true,
  },
  "network-mismatch": {
    icon: <Network className="text-purple-600" size={24} />,
    title: "Network Mismatch",
    guidance:
      "Your wallet is set to a different network than this app. Switch your wallet network and try again.",
    showInstallLink: false,
    showRetry: true,
  },
  timeout: {
    icon: <Clock className="text-yellow-600" size={24} />,
    title: "Connection Timed Out",
    guidance:
      "The connection request timed out. Please try again and approve the connection in your wallet promptly.",
    showInstallLink: false,
    showRetry: true,
  },
  unknown: {
    icon: <AlertCircle className="text-gray-600" size={24} />,
    title: "Wallet Error",
    guidance:
      "An unexpected wallet error occurred. Please check your wallet and try again.",
    showInstallLink: false,
    showRetry: true,
  },
};

const WalletErrorRecovery: React.FC<WalletErrorRecoveryProps> = ({
  onRetry,
  onClose,
  className = "",
}) => {
  const walletError = useWalletStore((state) => state.walletError);

  if (!walletError) return null;

  const config = errorConfig[walletError.type] || errorConfig.unknown;

  return (
    <div className={className}>
      <Toast
        message={walletError.message}
        type="error"
        onClose={() => onClose?.()}
      />
      <div
        className="mt-2 border-2 border-black bg-white p-4"
        style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-black uppercase mb-1">
              {config.title}
            </h4>
            <p className="text-sm font-bold text-gray-600 mb-3">
              {config.guidance}
            </p>
            <div className="flex flex-wrap gap-2">
              {config.showInstallLink && (
                <a
                  href={INSTALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide text-sm border-2 border-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-200"
                  style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
                >
                  <Download size={16} />
                  Install Freighter
                </a>
              )}
              {config.showRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw size={16} />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletErrorRecovery;
