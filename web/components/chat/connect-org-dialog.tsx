"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Terminal } from "lucide-react";
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
import { setupProject, fetchLatest } from "@/lib/sfdx/project";

type Phase =
  | "input"
  | "setup-running"
  | "setup-done"
  | "fetch-running"
  | "fetch-done"
  | "error";

interface StepLog {
  label: string;
  status: "pending" | "running" | "success" | "error";
  output?: string;
}

interface ConnectOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

export function ConnectOrgDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: ConnectOrgDialogProps) {
  const [accessToken, setAccessToken] = useState("");
  const [orgUrl, setOrgUrl] = useState(
    "https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com"
  );
  const [phase, setPhase] = useState<Phase>("input");
  const [steps, setSteps] = useState<StepLog[]>([
    { label: "Project Setup", status: "pending" },
    { label: "Fetch Latest Metadata", status: "pending" },
  ]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const reset = () => {
    setPhase("input");
    setSteps([
      { label: "Project Setup", status: "pending" },
      { label: "Fetch Latest Metadata", status: "pending" },
    ]);
    setGlobalError(null);
    setAccessToken("");
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const runSetup = async () => {
    if (!accessToken.trim()) {
      setGlobalError("Access token is required");
      return;
    }

    setGlobalError(null);
    setPhase("setup-running");
    setSteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "running" } : s))
    );

    try {
      const result = await setupProject(
        projectId,
        accessToken.trim(),
        orgUrl.trim()
      );

      if (!result.success) {
        throw new Error(result.error ?? "Project setup failed");
      }

      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0
            ? { ...s, status: "success", output: JSON.stringify(result.data, null, 2) }
            : s
        )
      );
      setPhase("setup-done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Setup failed";
      setSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "error", output: message } : s))
      );
      setGlobalError(message);
      setPhase("error");
    }
  };

  const runFetch = async () => {
    setPhase("fetch-running");
    setGlobalError(null);
    setSteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "running" } : s))
    );

    try {
      const result = await fetchLatest(
        projectId,
        accessToken.trim(),
        orgUrl.trim()
      );

      if (!result.success) {
        throw new Error(result.error ?? "Fetch latest failed");
      }

      setSteps((prev) =>
        prev.map((s, i) =>
          i === 1
            ? { ...s, status: "success", output: JSON.stringify(result.data, null, 2) }
            : s
        )
      );
      setPhase("fetch-done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fetch failed";
      setSteps((prev) =>
        prev.map((s, i) => (i === 1 ? { ...s, status: "error", output: message } : s))
      );
      setGlobalError(message);
      setPhase("error");
    }
  };

  const finish = () => {
    onSuccess();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Salesforce Org</DialogTitle>
          <DialogDescription>
            {phase === "input" &&
              "Enter your org credentials to switch to build mode."}
            {phase === "setup-running" && "Setting up project..."}
            {phase === "setup-done" && "Project setup complete."}
            {phase === "fetch-running" && "Fetching latest metadata..."}
            {phase === "fetch-done" && "All done! Ready to build."}
            {phase === "error" && "Something went wrong."}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper / Output Panel */}
        <div className="space-y-3 py-2">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {step.status === "pending" && (
                  <span className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
                {step.status === "running" && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
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

          {globalError && phase === "error" && (
            <p className="text-sm text-destructive">{globalError}</p>
          )}
        </div>

        {/* Input Form (only in input phase) */}
        {phase === "input" && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                placeholder="00D..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orgUrl">Org URL</Label>
              <Input
                id="orgUrl"
                placeholder="https://myorg.my.salesforce.com"
                value={orgUrl}
                onChange={(e) => setOrgUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {/* Cancel / Close */}
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={phase === "setup-running" || phase === "fetch-running"}
          >
            {phase === "fetch-done" ? "Close" : "Cancel"}
          </Button>

          {/* Primary Action */}
          {phase === "input" && (
            <Button onClick={runSetup}>Connect & Setup Project</Button>
          )}

          {phase === "setup-done" && (
            <Button onClick={runFetch}>Next: Fetch Latest</Button>
          )}

          {phase === "fetch-done" && <Button onClick={finish}>Start Building</Button>}

          {phase === "error" && (
            <Button variant="secondary" onClick={runSetup}>
              Retry Setup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}