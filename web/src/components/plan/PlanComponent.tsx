import { ExecutionPlan } from '@/lib/schemas/plan-schemas';
import { PlanRequirement } from './PlanRequirement';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface PlanComponentProps {
  plan: ExecutionPlan;
  onApprove: () => void;
  isApproved: boolean;
  completedActions?: string[];
}

export function PlanComponent({
  plan,
  onApprove,
  isApproved,
  completedActions = []
}: PlanComponentProps) {
  const totalActions = plan.requirements.reduce(
    (sum, req) => sum + req.actions.length,
    0
  );

  const completedCount = plan.requirements.reduce(
    (sum, req) => sum + req.actions.filter(a => completedActions.includes(a.id)).length,
    0
  );

  const progress = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <div className="w-full max-w-2xl border border-border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/50 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Execution Plan</h3>
          {isApproved && (
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Approved</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{plan.requirements_summary}</p>
        {!isApproved && totalActions > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{completedCount}/{totalActions} actions</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {plan.requirements.map((requirement, index) => (
          <PlanRequirement
            key={requirement.id}
            requirement={requirement}
            completedActions={completedActions}
          />
        ))}
      </div>

      {/* Footer with Approve button */}
      {!isApproved && (
        <div className="p-4 border-t border-border bg-muted/30 rounded-b-lg">
          <Button
            onClick={onApprove}
            className="w-full"
            size="lg"
          >
            Approve Plan
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Once approved, the agent will execute the actions in order
          </p>
        </div>
      )}
    </div>
  );
}
