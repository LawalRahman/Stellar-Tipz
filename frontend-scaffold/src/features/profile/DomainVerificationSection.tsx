import React, { useMemo, useState } from "react";
import { CheckCircle, Copy, Globe2, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TransactionStatus from "@/components/shared/TransactionStatus";
import { useContract } from "@/hooks";
import { useToastStore } from "@/store/toastStore";
import type { Profile } from "@/types/contract";

interface DomainVerificationSectionProps {
  profile: Profile;
  onVerified?: () => void;
}

type TxStatus =
  | "idle"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

const DOMAIN_RE = /^(?=.{1,253}$)(?!-)(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

const normalizeDomain = (value: string): string =>
  value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "")
    .toLowerCase();

const getTxtRecordValue = (owner: string): string =>
  `stellar-tipz-domain-verification=${owner}`;

const DomainVerificationSection: React.FC<DomainVerificationSectionProps> = ({
  profile,
  onVerified,
}) => {
  const [domain, setDomain] = useState(profile.domain ?? "");
  const [error, setError] = useState<string | undefined>();
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();

  const { setDomain: setContractDomain, verifyDomain } = useContract();
  const { addToast } = useToastStore();

  const normalizedDomain = useMemo(() => normalizeDomain(domain), [domain]);
  const txtValue = useMemo(
    () => getTxtRecordValue(profile.owner),
    [profile.owner],
  );
  const hasPendingDomain = Boolean(profile.domain && !profile.domainVerified);
  const isVerified = Boolean(profile.domain && profile.domainVerified);
  const isSubmitting = ["signing", "submitting", "confirming"].includes(
    txStatus,
  );

  const validateDomain = (): boolean => {
    if (!normalizedDomain) {
      setError("Enter the domain you want to verify.");
      return false;
    }

    if (!DOMAIN_RE.test(normalizedDomain)) {
      setError("Enter a valid domain such as example.com.");
      return false;
    }

    setError(undefined);
    return true;
  };

  const copyTxtValue = async () => {
    await navigator.clipboard.writeText(txtValue);
    addToast({ message: "TXT value copied.", type: "success", duration: 3000 });
  };

  const handleSetDomain = async () => {
    if (!validateDomain()) return;

    try {
      setTxStatus("signing");
      setTxError(undefined);
      setTxHash(undefined);
      setTxStatus("submitting");
      const hash = await setContractDomain(normalizedDomain);
      setTxStatus("confirming");
      setTxHash(hash);
      setTxStatus("success");
      addToast({
        message: "Domain saved. Add the TXT record, then verify.",
        type: "success",
        duration: 5000,
      });
      onVerified?.();
    } catch (err) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Unable to save domain.");
    }
  };

  const handleVerify = async () => {
    if (!profile.domain) {
      setError("Save your domain before verifying it.");
      return;
    }

    try {
      setTxStatus("signing");
      setTxError(undefined);
      setTxHash(undefined);
      setTxStatus("submitting");
      const hash = await verifyDomain(profile.owner);
      setTxStatus("confirming");
      setTxHash(hash);
      setTxStatus("success");
      addToast({
        message: "Domain verification submitted.",
        type: "success",
        duration: 5000,
      });
      onVerified?.();
    } catch (err) {
      setTxStatus("error");
      setTxError(
        err instanceof Error
          ? err.message
          : "Unable to verify domain. Confirm the TXT record is published.",
      );
    }
  };

  return (
    <Card padding="lg" className="space-y-5 border-4 shadow-brutalist">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-black uppercase">Verify Domain</h2>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-600">
            Prove you control your creator domain and show a verified badge on
            your public profile.
          </p>
        </div>
        {isVerified && (
          <span className="inline-flex items-center gap-1 border-2 border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">
            <CheckCircle size={14} /> Verified
          </span>
        )}
      </div>

      <Input
        label="Domain"
        placeholder="example.com"
        value={domain}
        onChange={(e) => {
          setDomain(e.target.value);
          if (error) setError(undefined);
        }}
        onBlur={validateDomain}
        error={error}
        helperText="Enter only the root domain; no https:// or path."
        disabled={isSubmitting}
      />

      <div className="space-y-3 rounded-none border-2 border-black bg-yellow-50 p-4">
        <div className="flex items-center gap-2 font-black uppercase">
          <Globe2 size={16} /> DNS TXT instructions
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm font-bold text-gray-800">
          <li>
            Save the domain above to write it to your Tipz profile contract
            state.
          </li>
          <li>Add a DNS TXT record at your domain root.</li>
          <li>
            Use host/name <code className="bg-white px-1">@</code> and the value
            below.
          </li>
          <li>
            After DNS propagates, click Verify to call the contract
            verify_domain function.
          </li>
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 break-all border-2 border-black bg-white p-3 text-xs font-black">
            {txtValue}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Copy size={14} />}
            onClick={copyTxtValue}
          >
            Copy
          </Button>
        </div>
      </div>

      {profile.domain && (
        <p className="text-sm font-bold text-gray-700">
          Current contract status:{" "}
          <span className="font-black">{profile.domain}</span>{" "}
          {profile.domainVerified ? "is verified." : "is pending verification."}
        </p>
      )}

      {txStatus !== "idle" && (
        <TransactionStatus
          status={txStatus}
          txHash={txHash}
          errorMessage={txError}
          onRetry={() => setTxStatus("idle")}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSetDomain}
          disabled={isSubmitting}
        >
          Save Domain
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleVerify}
          disabled={
            isSubmitting || isVerified || (!hasPendingDomain && !profile.domain)
          }
        >
          Verify
        </Button>
      </div>
    </Card>
  );
};

export default DomainVerificationSection;
