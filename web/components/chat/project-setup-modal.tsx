"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Terminal } from "lucide-react";
import ShimmerLoader from "@/components/ui/logo-animated-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface ProjectSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSetupComplete?: () => void;
}

export function ProjectSetupModal({
  open,
  onOpenChange,
  projectId,
  onSetupComplete,
}: ProjectSetupModalProps) {
  const [orgUrl, setOrgUrl] = useState("");
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [steps, setSteps] = useState<StepLog[]>([
    { label: "Project Setup", status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setPhase("input");
      setSteps([{ label: "Project Setup", status: "pending" }]);
      setError(null);
      setAccessToken("");
      fetch(`/api/orgs/${projectId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setOrgUrl(data.domain_url ?? "");
            setUsername(data.username ?? "");
          }
        })
        .catch(() => {
          // Org might not exist yet — user will see empty fields
        });
    }
  }, [open, projectId]);

  const handleSetup = async () => {
    if (!accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    setError(null);
    setLoading(true);
    setPhase("running");
    setSteps((prev) =>
      prev.map((s) => (s.label === "Project Setup" ? { ...s, status: "running" } : s))
    );

    try {
      const res = await fetch(`/api/orgs/${projectId}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: accessToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Setup failed");
      }

      setSteps((prev) =>
        prev.map((s) =>
          s.label === "Project Setup"
            ? { ...s, status: "success", output: JSON.stringify(data.data, null, 2) }
            : s
        )
      );
      setPhase("done");
      onSetupComplete?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Setup failed";
      setSteps((prev) =>
        prev.map((s) =>
          s.label === "Project Setup"
            ? { ...s, status: "error", output: message }
            : s
        )
      );
      setError(message);
      setPhase("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleContinueToFetch = () => {
    onOpenChange(false);
    // Parent will open the FetchLatestModal separately
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Project Setup</DialogTitle>
          <DialogDescription>
            Enter your Salesforce access token to connect the org.
          </DialogDescription>
        </DialogHeader>

        {/* Org info — read only */}
        <div className="space-y-2 py-2">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Org URL</Label>
            <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {orgUrl || "—"}
            </div>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Username</Label>
            <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {username || "—"}
            </div>
          </div>
        </div>

        {/* Stepper / Output */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.label} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {step.status === "pending" && (
                  <span className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
                {step.status === "running" && (
                  <ShimmerLoader className="w-5 h-5" />
                )}
                {step.status === "success" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {step.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className={step.status === "error" ? "text-destructive" : ""}>
                  {step.label}
                </span>
              </div>
              {step.output && (
                <div className="relative">
                  <Terminal className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <pre className="max-h-32 overflow-auto rounded bg-muted p-2 pl-7 text-xs text-muted-foreground scrollbar-thin">
                    {step.output}
                  </pre>
                </div>
              )}
            </div>
          ))}
          {error && phase === "error" && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Access token form — only in input phase */}
        {phase === "input" && (
          <div className="grid gap-2 py-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              placeholder="00D..."
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {phase === "done" ? "Close" : "Cancel"}
          </Button>
          {phase === "input" && (
            <Button onClick={handleSetup} disabled={loading}>
              {loading ? "Setting up..." : "Setup Project"}
            </Button>
          )}
          {phase === "error" && (
            <Button onClick={handleSetup} disabled={loading}>
              Retry
            </Button>
          )}
          {phase === "done" && (
            <Button onClick={handleContinueToFetch}>
              Next: Fetch Latest
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
