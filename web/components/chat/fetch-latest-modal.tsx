"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Phase = "input" | "running" | "done" | "error";

interface StepLog {
  label: string;
  status: "pending" | "running" | "success" | "error";
  output?: string;
}

export interface FetchLatestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function FetchLatestModal({
  open,
  onOpenChange,
  projectId,
}: FetchLatestModalProps) {
  const [orgUrl, setOrgUrl] = useState("");
  const [username, setUsername] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [steps, setSteps] = useState<StepLog[]>([
    { label: "Fetch Latest Metadata", status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setPhase("input");
      setSteps([{ label: "Fetch Latest Metadata", status: "pending" }]);
      setError(null);
      fetch(`/api/orgs/${projectId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setOrgUrl(data.domain_url ?? "");
            setUsername(data.username ?? "");
          }
        })
        .catch(() => {
          // Org might not be connected yet
        });
    }
  }, [open, projectId]);

  const handleFetch = async () => {
    setError(null);
    setLoading(true);
    setPhase("running");

    try {
      const res = await fetch(`/api/orgs/${projectId}/fetch`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Fetch failed");
      }

      setPhase("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fetch failed";
      setError(message);
      setPhase("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fetch Latest Metadata</DialogTitle>
          <DialogDescription>
            Pull the latest metadata from your connected Salesforce org.
          </DialogDescription>
        </DialogHeader>

        {/* Org info — read only */}
        <div className="space-y-2 py-2">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Org URL</span>
            <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {orgUrl || "—"}
            </div>
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Username</span>
            <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {username || "—"}
            </div>
          </div>
        </div>

        {/* Stepper / Output */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isRunning = phase === "running" && idx === 0;
            const isSuccess = phase === "done" && idx === 0;
            const isError = phase === "error" && idx === 0;

            return (
              <div key={step.label} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {isRunning && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {isSuccess && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {isError && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {phase === "input" && (
                    <span className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span
                    className={
                      isError ? "text-destructive" : ""
                    }
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
          {error && phase === "error" && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {phase === "done" ? "Close" : "Cancel"}
          </Button>
          {phase === "input" && (
            <Button onClick={handleFetch} disabled={loading || !orgUrl}>
              {loading ? "Fetching..." : "Fetch Latest"}
            </Button>
          )}
          {phase === "error" && (
            <Button onClick={handleFetch} disabled={loading}>
              Retry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
