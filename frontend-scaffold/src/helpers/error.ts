export const ERRORS = {
  UNSUPPORTED_NETWORK:
    "Unsupported network selected, please use Futurenet in Freighter",
  FREIGHTER_NOT_AVAILABLE: "Please install Freighter to connect your wallet",
  UNABLE_TO_SUBMIT_TX: "Unable to submit transaction",
  UNABLE_TO_SIGN_TX: "Unable to sign transaction",
  WALLET_CONNECTION_REJECTED: "Wallet connection rejected",
  NETWORK: "Unable to connect. Please check your internet connection.",
  CONTRACT: "Something went wrong. Please try again.",
  NOT_FOUND: "The requested content could not be found.",
  WALLET: "Wallet action failed. Please check your wallet and try again.",
  WALLET_NOT_INSTALLED:
    "Freighter extension not found. Please install Freighter to connect your wallet.",
  WALLET_LOCKED:
    "Freighter is locked. Please unlock your wallet and try again.",
  WALLET_REJECTED:
    "Connection was rejected. Please approve the connection request in your wallet.",
  WALLET_NETWORK_MISMATCH:
    "Network mismatch detected. Please switch your wallet to the correct network.",
  WALLET_TIMEOUT:
    "Connection timed out. Please try again and approve the connection in your wallet.",
};

export type ErrorCategory =
  | "network"
  | "contract"
  | "wallet"
  | "not-found"
  | "unknown";

export type WalletErrorType =
  | "not-installed"
  | "locked"
  | "rejected"
  | "network-mismatch"
  | "timeout"
  | "unknown";

export const classifyWalletError = (
  error: unknown,
): { type: WalletErrorType; message: string } => {
  if (!error) return { type: "unknown", message: ERRORS.WALLET };

  const errorString = String(error).toLowerCase();

  if (
    errorString.includes("not installed") ||
    errorString.includes("extension not found") ||
    errorString.includes("freighter not available") ||
    errorString.includes("please install")
  ) {
    return { type: "not-installed", message: ERRORS.WALLET_NOT_INSTALLED };
  }

  if (
    errorString.includes("locked") ||
    errorString.includes("unlock")
  ) {
    return { type: "locked", message: ERRORS.WALLET_LOCKED };
  }

  if (
    errorString.includes("rejected") ||
    errorString.includes("cancelled") ||
    errorString.includes("canceled") ||
    errorString.includes("user declined") ||
    errorString.includes("user denied") ||
    errorString.includes("connection declined")
  ) {
    return { type: "rejected", message: ERRORS.WALLET_REJECTED };
  }

  if (
    errorString.includes("network") &&
    (errorString.includes("mismatch") ||
      errorString.includes("switch") ||
      errorString.includes("unsupported network"))
  ) {
    return {
      type: "network-mismatch",
      message: ERRORS.WALLET_NETWORK_MISMATCH,
    };
  }

  if (
    errorString.includes("timeout") ||
    errorString.includes("timed out") ||
    errorString.includes("popup closed")
  ) {
    return { type: "timeout", message: ERRORS.WALLET_TIMEOUT };
  }

  return { type: "unknown", message: ERRORS.WALLET };
};

export const categorizeError = (error: unknown): ErrorCategory => {
  if (!error) return "unknown";

  const errorString = String(error).toLowerCase();

  if (
    errorString.includes("network") ||
    errorString.includes("fetch") ||
    errorString.includes("failed to fetch") ||
    errorString.includes("connection")
  ) {
    return "network";
  }

  if (
    errorString.includes("not found") ||
    errorString.includes("404") ||
    errorString.includes("could not find")
  ) {
    return "not-found";
  }

  if (
    errorString.includes("rejected") ||
    errorString.includes("cancelled") ||
    errorString.includes("canceled") ||
    errorString.includes("wallet") ||
    errorString.includes("freighter") ||
    errorString.includes("user declined") ||
    errorString.includes("extension not found")
  ) {
    return "wallet";
  }

  if (
    errorString.includes("contract") ||
    errorString.includes("soroban") ||
    errorString.includes("simulation") ||
    errorString.includes("transaction")
  ) {
    return "contract";
  }

  return "unknown";
};
