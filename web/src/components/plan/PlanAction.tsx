import { Checkbox } from '@/components/ui/checkbox';
import { Action } from '@/lib/schemas/plan-schemas';

interface PlanActionProps {
  action: Action;
  isCompleted: boolean;
}

export function PlanAction({ action, isCompleted }: PlanActionProps) {
  return (
    <div className="flex items-start gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isCompleted}
        disabled
        className="mt-0.5"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{action.label}</p>
        <p className="text-xs text-muted-foreground capitalize">
          Tool: {action.tool}
        </p>
        {action.dependsOn.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Depends on: {action.dependsOn.join(', ')}
          </p>
        )}
      </div>
      {isCompleted && (
        <span className="text-xs text-green-500 font-medium">Completed</span>
      )}
    </div>
  );
}
